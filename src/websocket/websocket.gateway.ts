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
import { Logger, UseFilters } from '@nestjs/common';
import { Server } from 'socket.io';
import { EventService } from 'src/event/event.service';
import { envs } from 'src/config';
import { AuthenticatedSocket, WebSocketMiddleware } from './middleware/websocket-auth.middleware';
import { WsExceptionFilter } from './exceptions/ws.exception';
import { OnEvent } from '@nestjs/event-emitter';
import { StatusEvent } from 'src/event/common';
import { CalledBallI } from './dtos/called-ball.interface';
import { RoomState, StatusSing } from './interfaces/room-status.interface';
import { WsConst } from './consts/ws.const';
import { WsEnum } from './enums/ws.enum';

@WebSocketGateway(
  { 
    namespace: 'events-games',
    cors: {
      origin: envs.FRONTEND_URL,
      credentials: true
    }
   }
)
@UseFilters(WsExceptionFilter)
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private countDuration: number = 30;

  private rooms: Map<string, RoomState> = new Map();

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private webSocketMiddleware: WebSocketMiddleware,
    private readonly eventServ: EventService
  ) {}
  
  afterInit(server: Server) {
    server.use((socket: AuthenticatedSocket, next) => {
      this.webSocketMiddleware.use(socket, next);
    });

    this.logger.log('WebSocket Gateway inicializado con middleware de autenticación');
  }

  handleConnection(socket: AuthenticatedSocket) {
    console.log('Cliente conectado: ' + socket.id);
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() room: number, 
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { userId } = client.user;
    const joinRoom = WsConst.keyRoom(room);

    //* Validacion si el usuario pertenece al evento
    this.eventServ.verifyAParticipatingUserEvent(room, userId)
    .subscribe({
      next: (exists) => {
        if (!exists) {
          client.emit(WsEnum.UNAUTHORIZED, { message: 'No perteneces al evento' });
          client.disconnect();
        } else {
          client.join(joinRoom);
          this.eventServ.joinRoom(joinRoom, { userId, socketId: client.id })
          .subscribe( (_) => {
            this.connectedPlayers(joinRoom);
            if (this.rooms.has(joinRoom)) {
              const room = this.rooms.get(joinRoom);
              if (room.songs && room.songs.length > 0) {
                room.songs.forEach(sing => {
                  client.emit('songs', sing);
                });
              }
            }      
          });

          if (!this.rooms.has(joinRoom)) {
            this.rooms.set(joinRoom, {
              isCounterActive: false,
              counter: 0
            })
          }
        }
      },
      error: (error) => {
        client.emit(WsEnum.UNAUTHORIZED, { message: 'Error de validación: ' + error.message });
      }
    });    
  }

  @SubscribeMessage('waitingGame')
  handleWaitingGame(
    @MessageBody() room: number,
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { userId } = client.user;
    const joinRoom = WsConst.keyRoomWaiting(room);
    
    //* Validacion si el usuario pertenece al evento
    this.eventServ.verifyAParticipatingUserEvent(room, userId)
    .subscribe({
      next: (exists) => {
        if (!exists) {
          client.emit(WsEnum.UNAUTHORIZED, { message: 'No perteneces al evento' });
          client.disconnect();
        } else {
          client.join(joinRoom);
          this.eventServ.joinRoom(joinRoom, { userId, socketId: client.id });
          this.connectedPlayers(joinRoom);          
          client.emit(joinRoom, { message: `Sala #${room}: Evento no iniciado. Ahora te encuentras en sala de espera.`, status: true});
        }
      },
      error: (error) => {
        client.emit(WsEnum.UNAUTHORIZED, { message: 'Error de validación: ' + error.message });
      }
    });
  }

  private connectedPlayers(joinRoom: string) {
    this.eventServ.countUsersRoom(joinRoom).subscribe({
      next: (countUsers) => {
        if (countUsers) {
          this.server.to(joinRoom).emit(
            WsConst.keyRoomCountUsers(joinRoom),
            countUsers
          );
        }

        if (countUsers == 0) {
          this.leaveRoom(joinRoom);
        }
      }
    });
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    await this.deleteUserRoom(client.user.userId, client.id);
  }

  @OnEvent('event.update.status')
  async updateStatusEvent(
    data: { status: StatusEvent, eventId: number }
  ) {
    const { status, eventId: roomId } = data;
    const room = WsConst.keyRoomWaiting(roomId);
    const toRoom = WsConst.keyRoom(roomId);

    if (status === StatusEvent.NOW) {
      this.server.to(room).emit(room, status);
      this.connectedPlayers(toRoom);
      //* Cambiar de sala en ws
      this.moveRoom(room, toRoom);
      this.moveRoom(WsConst.keyRoomCountUsers(room), 
        WsConst.keyRoomCountUsers(toRoom));

    } else if (status === StatusEvent.COMPLETED) {
      //* Elimnar sala
      this.deleteRoom(toRoom);
      this.disconnectedRoom(toRoom);
      this.disconnectedRoom(WsConst.keyRoomCountUsers(toRoom));
    }
  }

  @SubscribeMessage('disconnectRoom')
  handleDisconnectRoom(
    @MessageBody() roomId: number, 
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { userId } = client.user;
    const room = WsConst.keyRoom(roomId);
    const roomWaiting = WsConst.keyRoomWaiting(roomId);

    client.leave(roomWaiting);
    client.leave(WsConst.keyRoomCountUsers(roomWaiting));
    client.leave(room);
    client.leave(WsConst.keyRoomCountUsers(room));

    this.deleteUserRoom(userId, client.id);
  }

  async disconnectedRoom(roomId: string) {
    const sockets = await this.server.in(roomId).fetchSockets();
    sockets.forEach(element => {
      element.leave(roomId);
    });
  }

  async moveRoom(currentRoom: string, toRoom: string) {
    const sockets = await this.server.in(currentRoom).fetchSockets();
    sockets.forEach(element => {
      element.leave(currentRoom);
      element.join(toRoom);   
    });
  }

  async deleteRoom(room: string) {
    this.eventServ.deleteRoom(room).subscribe();
  }

  async deleteUserRoom(userId: number, socketId: string) {
    this.eventServ.deleteUserRoom(userId, socketId).subscribe(room => {
      if (room) {
        this.connectedPlayers(room);
      }
    });
  }

  leaveRoom(roomKey: string) {
    const room = this.rooms.get(roomKey);

    if (room) {
      if (room.counterId) {
        clearInterval(room.counterId);
      }
      this.rooms.delete(roomKey);
    }
  }

  startCounter(
    roomId: number,
  ) {
    const nameKeyRoom = WsConst.keyRoom(roomId);

    const room = this.rooms.get(nameKeyRoom);

    if (!room || room.isCounterActive) {
      return;
    }

    room.isCounterActive = true;
    room.counter = this.countDuration;

    this.server.to(nameKeyRoom).emit(WsEnum.COUNTER_STARTED, {
      counter: room.counter,
      isCounterActive: true
    });

    room.counterId = setInterval(() => {
      room.counter--;

      this.server.to(nameKeyRoom).emit(WsEnum.COUNTER_UPDATE, {
        isCounterActive: true,
        counter: room.counter,
      });

      if (room.counter <= 0) {
        this.stopCounter(roomId);
      }
    }, 1000) 
  }

  stopCounter(roomId: number) {
    const nameKeyRoom = WsConst.keyRoom(roomId);
    const room = this.rooms.get(nameKeyRoom);

    if (!room) return;

    if (room.counterId) {
      clearInterval(room.counterId);
      room.counterId = undefined;
    }

    room.isCounterActive = false;
    room.counter = 0;

    this.server.to(nameKeyRoom).emit(WsEnum.COUNTER_FINISHED, {
      isCounterActive: false,
      counter: 0,
    });
  }

  @OnEvent('raffle.number.called', { async: true})
  async ballsCalledRoomWs(payload: {eventId: number, calledBall: CalledBallI}) {
    const {eventId, calledBall} = payload;
    const room = WsConst.keyRoom(eventId);

    this.server.to(room).emit(WsConst.keyRoomCalledBall(room), calledBall);
    this.startCounter(eventId);
  }

  @SubscribeMessage('sing')
  handleSongs(
    @MessageBody() data: { roomId: number, cardId: number },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { roomId, cardId  } = data;
    const { userId, name, lastname } = client.user;
    const keyRoom = WsConst.keyRoom(roomId);

    const room = this.rooms.get(keyRoom);

    if (!room) {
      client.emit(WsEnum.ERROR,'Sala no existe');
      return;
    }

    if (!room.songs) room.songs = [];

    let date = new Date();
    const hour = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    const sing = { 
      id: client.id, 
      userId,
      cardId,
      eventId: roomId,
      fullnames: `${name} ${lastname}`,
      hour,
      status: StatusSing.PENDING
    }
    
    const exist =  new Promise<boolean>((resolve, _) => {
      room.songs.forEach(sing => {
        if (sing.userId === userId) {
          resolve(true);
          return;
        }
      });
      resolve(false)
    });

    exist.then(val => {
      if (val) {
        client.emit(WsEnum.ERROR,'Ya has cantado bingo, espera mientras el administrador te revisa');
        return;
      } else {
        room.songs.push(sing);
        this.rooms.set(keyRoom, room);
        this.server.to(keyRoom).emit('songs', sing);
      }
    });
  }

  @SubscribeMessage('verify-sing')
  handleVeirfySongs(
    @MessageBody() data: { roomId: number, cardId: number, status: StatusSing, userId: number },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const {roomId, cardId, status, userId} = data;
    if (!roomId || !cardId || !status) {
      client.emit(WsEnum.ERROR,'No se recibieron los datos necesarios para verificar el canto');
      return;
    }
    const keyRoom = WsConst.keyRoom(roomId);

    try {
      const room = this.rooms.get(keyRoom);

      if (!room) {
        client.emit(WsEnum.ERROR,'Sala no existe');
        return;
      }

      if (!room.songs) {
        client.emit(WsEnum.ERROR,'No existe ningun canto');
        return;
      }

      const singPosition = room.songs.findIndex(song => song.userId == userId && song.eventId == roomId && song.cardId == cardId);

      if (singPosition == -1) {
        client.emit(WsEnum.ERROR,'No existe ningun canto de este jugador');
        return;
      }

      const sing = room.songs[singPosition];
      sing.status = status;
      room.songs[singPosition] = sing;
      this.rooms.set(keyRoom, room);
      this.server.to(keyRoom).emit('songs', sing);
    } catch(error) {
      this.server.to(keyRoom).emit(WsEnum.ERROR, 'Ocurrio un error al actualizar el canto del juagdor');
    }
  }

  @SubscribeMessage('delete-all-songs')
  handleDeleteAllSongs(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const {roomId} = data;
    if (!roomId) {
      client.emit(WsEnum.ERROR,'No se recibieron los datos necesarios para verificar el canto');
      return;
    }

    const keyRoom = WsConst.keyRoom(roomId);

    try {
      const room = this.rooms.get(keyRoom);
      if (!room) {
        client.emit(WsEnum.ERROR,'Sala no existe');
        return;
      }

      if (!room.songs) {
        return;
      }

      const songs = room.songs.filter(sing => sing.status != StatusSing.REJECTED);

      room.songs = songs;
      this.rooms.set(keyRoom, room);

      this.server.to(keyRoom).emit('delete-songs', songs);
      
    } catch (error) {
      this.server.to(keyRoom).emit(WsEnum.ERROR, 'Ocurrio un error al eliminar los cantos');
    }
  }

}
