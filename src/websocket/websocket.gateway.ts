import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Inject, Logger, ParseBoolPipe, ParseUUIDPipe, UseFilters } from '@nestjs/common';
import { Server } from 'socket.io';
import { envs, NATS_SERVICE } from 'src/config';
import { AuthenticatedSocket, WebSocketMiddleware } from './middleware/websocket-auth.middleware';
import { WsExceptionFilter } from './exceptions/ws.exception';
import { WsConst } from './consts/ws.const';
import { EWebSocket } from './enums/ws.enum';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { WebSocketService } from './websocket.service';
import { HostActivity, IDataInitial, ITableWinners } from './interfaces';
import { EStatusHost } from './enums';
import { EndGameDto, RouletteWinnerDto } from './dtos';
import { IAward, IGame } from 'src/shared/interfaces';
import { StatusAward } from 'src/shared/enums';

@WebSocketGateway(envs.WS_PORT,
  {
    namespace: 'room',
    cors: {
      origin: envs.FRONTEND_URL,
      credentials: true
    }
  }
)
@UseFilters(WsExceptionFilter)
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private webSocketMiddleware: WebSocketMiddleware,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    private readonly wsService: WebSocketService
  ) { }

  afterInit(server: Server) {
    server.use((socket: AuthenticatedSocket, next) => {
      this.webSocketMiddleware.use(socket, next);
    });

    this.logger.log('WebSocket Gateway inicializado con middleware de autenticación');
  }

  //* Conectar al usuario al socket
  async handleConnection(socket: AuthenticatedSocket) {
    try {
      const { roomId } = socket;
      const { id: userId } = socket.user;
      const connected = await firstValueFrom(
        this.client.send('joinRoom', { socketId: socket.id, roomId: roomId, userId })
      );
      if (connected) {
        this.logger.log('Cliente conectado con socketId: ' + socket.id + ', email: ' + socket.user.email);

        // Obtención de la data inicial
        const data = await firstValueFrom(
          this.client.send<IDataInitial>('initialDataRoom', { roomId })
        );

        this.server.emit(WsConst.socket(roomId), {
          numUsers: data.countUser // Emite el numero de usuarios conectados en la sala
        });

        // Room
        const room = await this.wsService.offlineStatusHost(roomId, userId, EStatusHost.ONLINE);
        if (room) {
          this.server.emit(WsConst.room(roomId), {
            room,
            hostActivity: data.hostActivity,
          });
        }

        // Game
        this.server.emit(WsConst.game(roomId), {
          counter: data.statusCount, // Emite el estado del contador si existe
          statusAward: data.awardStatus,
          tableWinner: { table: data.tableWinners },
          rouletteStatus: data.rouletteStatus,
          rouletteWinner: data.rouletteWinner
        });
      } else {
        this.logger.error('Cliente no conectado con socketId: ' + socket.id + ', email: ' + socket.user.email);
      }
    } catch (error) {
      this.logger.error('Error al conectarse en la sala', error);
    }
  }

  //* Desconectar al usuario del socket
  async handleDisconnect(socket: AuthenticatedSocket) {
    try {
      const { roomId } = socket;
      const { id: userId } = socket.user;
      const disconnected = await firstValueFrom(
        this.client.send('exitRoom', { socketId: socket.id, roomId: socket.roomId, userId })
      );

      if (disconnected) {
        this.logger.log('Cliente desconectado con socketId: ' + socket.id + ', email: ' + socket.user.email);

        // Room
        const room = await this.wsService.offlineStatusHost(roomId, userId, EStatusHost.OFFLINE);
        if (room) {
          this.server.emit(WsConst.room(roomId), {
            room
          });
        }

        // Emite el numero de usuarios conectados en la sala
        const count = await this.wsService.connectedPlayers(roomId);
        this.server.emit(WsConst.socket(roomId), {
          numUsers: count // Emite el numero de usuarios conectados en la sala
        });
      } else {
        this.logger.error('Cliente no desconectado con socketId: ' + socket.id + ', email: ' + socket.user.email);
      }
    } catch (error) {
      this.logger.error('Error al desconectarse en la sala', error);
    }
  }

  //* Escucha de usuarios conectados a una sala
  @SubscribeMessage(EWebSocket.COUNT)
  async connectedPlayers(@ConnectedSocket() socket: AuthenticatedSocket) {
    const { roomId } = socket;
    const count = await this.wsService.connectedPlayers(roomId);
    socket.emit(WsConst.socket(roomId), { numUsers: count});
  }

  //* Creación de un juego
  @SubscribeMessage(EWebSocket.CREATE_GAME)
  async createGame(
    @MessageBody('awardId', ParseUUIDPipe) awardId: string,
    @MessageBody('modeId', ParseUUIDPipe) modeId: string,
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const { roomId } = socket;
    const result = await this.wsService.createGame(roomId, awardId, modeId);
    if (!result) return;
    const { award, game } = result;
    this.server.emit(WsConst.game(roomId), {
      game,
      award: { ...award, status: StatusAward.NOW }
    });
  }

  //* Obtención de celda única de tabla de bingo
  @SubscribeMessage(EWebSocket.CELL_CARD)
  async getCellCard(
    @MessageBody('gameId', ParseUUIDPipe) gameId: string,
    @ConnectedSocket() socket: AuthenticatedSocket
  ) {
    const { roomId } = socket;
    const startTime = Date.now();
    const minDurationMs = 10000;

    this.client.emit('updateHostActivityRoom', { roomId, status: HostActivity.MEZCLANDO });
    this.server.emit(WsConst.room(roomId), { 
      hostActivity: HostActivity.MEZCLANDO 
    });

    const num = await this.wsService.getCellCard(roomId, gameId);

    if (!num) {
      await this.durationMinMs(startTime, minDurationMs);
      this.server.emit(WsConst.game(roomId), null);
      return;
    }

    const COLMNS = ['B', 'I', 'N', 'G', 'O'];
    let RANGE_SIZE = 15;
    const result = COLMNS.map((col, i) => {
      const minRange = i * RANGE_SIZE + 1;
      const maxRange = (i + 1) * RANGE_SIZE;

      if (num >= minRange && num <= maxRange) {
        return `${col} - ${num}`;
      }
      return null;
    }).filter(Boolean)[0];

    await this.durationMinMs(startTime, minDurationMs);

    this.server.emit(WsConst.game(roomId), { cell: result});

    this.client.emit('updateHostActivityRoom', { roomId, status: HostActivity.CANTANDO });
    this.server.emit(WsConst.room(roomId), { 
      hostActivity: HostActivity.CANTANDO 
    });

    this.startCounter(roomId);
  }

  //* Cantos de bingo
  @SubscribeMessage(EWebSocket.BINGO)
  async bingo(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('cardId', ParseUUIDPipe) cardId: string,
    @MessageBody('numberHistoryId', ParseUUIDPipe) numberHistoryId: string,
    @MessageBody('modeId', ParseUUIDPipe) modeId: string,
  ) {
    const { roomId, user } = client;
    try {
      const result = await this.wsService.bingo(user.id, cardId, numberHistoryId, modeId);
      if (result != 'enviado') {
        client.emit(WsConst.game(roomId), { myBingo: result});
        return;
      }

      const tableBingo = await firstValueFrom(
        this.client.send<ITableWinners[]>('saveTableBingoRoom',
          {
            socketId: client.id,
            roomId,
            userId: user.id,
            cardId: cardId,
            fullnames: `${user.name} ${user.lastname}`
          })
      );

      if (!tableBingo) {
        client.emit(WsConst.game(roomId), { 
          myBingo: 'Error al guardar los datos'});
        return;
      }
      client.emit(WsConst.game(roomId), { myBingo: 'Enviado a revisión'});
      this.server.emit(WsConst.game(roomId), 
      { tableWinner: { table: tableBingo }});
    } catch (error) {
      client.emit(WsConst.game(roomId), { myBingo: 'Ocurrio un error al cantar bingo'});
      this.logger.error(error);
    }
  }

  //* Actualización de canto de un usuario
  @SubscribeMessage(EWebSocket.UPDATE_BINGO)
  async updateBingo(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('cardId', ParseUUIDPipe) cardId: string,
    @MessageBody('status') status: string,
  ) {
    const { roomId } = client;
    const tableBingo = await lastValueFrom(
      this.client.send<{ sing: ITableWinners, table: ITableWinners[] }>
        ('updateTableBingoRoom', { roomId, cardId, status })
    );

    if (tableBingo) {
      const { table, sing } = tableBingo;
      if (sing) {
        this.server.except(sing.socketId).emit(WsConst.game(roomId), { tableWinner: { table }});
        this.server.to(sing.socketId).emit(WsConst.game(roomId), { tableWinner: tableBingo}); // enviar el socketId unicamente
      } else {
        this.server.except(sing.socketId).emit(WsConst.game(roomId), { tableWinner: { table }});
      }
    }
  }

  //* Actualización del estado de un canto de usuario
  @SubscribeMessage(EWebSocket.UPDATE_STATUS_WINNER_MODAL)
  updateStatusWinnerModal(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('status', ParseBoolPipe) status: boolean,
  ) {
    const { roomId } = client;
    this.server.except(client.id).emit(WsConst.game(roomId), { winnerModal: status });
  }

  //* Actualización de la actividad del host
  @SubscribeMessage(EWebSocket.HOST_ACTIVITY)
  updateHostActivity(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('status') status: string,
  ) {
    const { roomId } = client;
    this.client.emit('updateHostActivityRoom', { roomId, status });
    this.server.emit(WsConst.room(roomId), { hostActivity: status });
  }

  //* Actualizar el estado de la premiación
  @SubscribeMessage(EWebSocket.AWARD_STATUS)
  updateAwardStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('status') status: string,
  ) {
    const { roomId } = client;
    this.client.emit('updateAwardStatusRoom', { roomId, status });
    this.server.emit(WsConst.game(roomId), { statusAward:status});
  }

  //* Actualizar el estado de la ruleta de premiación
  @SubscribeMessage(EWebSocket.ROULETTE_STATUS)
  updateRouletteStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody('status') status: string,
  ) {
    const { roomId } = client;
    this.client.emit('updateRouletteStatusRoom', { roomId, status });
    this.server.emit(WsConst.game(roomId), { rouletteStatus: status});
  }

  //* Actualizar la posicion del ganador en la ruleta
  @SubscribeMessage(EWebSocket.ROULETTE_WINNER)
  updateRouletteWinner(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: RouletteWinnerDto,
  ) {
    const { roomId } = client;
    this.client.emit('updateRouletteWinnerRoom', { roomId, data });
    this.server.except(client.id).emit(WsConst.game(roomId), { rouletteWinner: data});
  }

  //* Limpiar tabla de cantos de jugadores
  @SubscribeMessage(EWebSocket.CLEAN_TABLE_SONGS)
  cleanTableSongs(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { roomId } = client;
    this.client.emit('cleanTableBingoRoom', { roomId });
    this.server.emit(WsConst.game(roomId), { tableWinner: { table: [] }});
  }

  async durationMinMs(startTime: number, minDurationMs: number) {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = minDurationMs - elapsedTime;

    if (remainingTime > 0) {
      await this.delay(remainingTime);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  //* Iniciar el contador por sala
  async startCounter(
    roomId: string,
  ) {
    const duration = 10000; // ms

    const count = await firstValueFrom(
      this.client.send('countRoom', { roomId, duration })
    );

    this.server.emit(WsConst.game(roomId), { counter: count});

    let result = 10;
    const interval = setInterval(() => {
      result = result - 1;
      if ( result <= 0) {
        this.client.emit('updateHostActivityRoom', { roomId, status: HostActivity.ESPERANDO });
        this.server.emit(WsConst.room(roomId), { 
          hostActivity: HostActivity.ESPERANDO 
        });
        clearInterval(interval);
      }
    }, 1000)
  }

  //* Finalizar Juego
  @SubscribeMessage(EWebSocket.END_GAME)
  async finishedGame(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() endGameDto: EndGameDto,
  ) {
    const { roomId } = socket;
    const { gameId, cardId, awardId } = endGameDto;

    try {
      // Terminó el juego
      await lastValueFrom(
        this.client.send<IGame>('updateGame', { id: gameId, end_time: new Date() })
      );

      // Asigno la tabla ganadora al premio
      await lastValueFrom(
        this.client.send<IAward>('updateAward', { id: awardId, gameId, winner: cardId })
      );

      // Obtengo el premio actualizado
      const award = await lastValueFrom(
        this.client.send<IAward>('findOneAward', { id: awardId })
      );

      // Limpio datos necesarios en almacenados en redis
      this.client.emit('cleanTableBingoRoom', { roomId });

      // respuestas
      this.server.emit(WsConst.game(roomId), { 
        tableWinners: { table: [] },
        game: null,
        award: { ...award, status: StatusAward.END, winner: cardId  }
      },
      );

      this.endRoom(roomId);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async endRoom(roomId: string) {
    // Termino la sala en caso de ser necesario
    const { room, event, error }  = await this.wsService.endRoom(roomId);

    if (error) return;
    this.server.emit(WsConst.room(roomId), { room });
  }
}
