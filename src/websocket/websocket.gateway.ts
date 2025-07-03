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
import { Server, Socket } from 'socket.io';
import { EventService } from 'src/event/event.service';
import { envs } from 'src/config';
import { AuthenticatedSocket, WebSocketMiddleware } from './middleware/websocket-auth.middleware';
import { WsExceptionFilter } from './exceptions/ws.exception';
import { OnEvent } from '@nestjs/event-emitter';
import { StatusEvent } from 'src/event/common';
import { CalledBallI } from './dtos/called-ball.interface';

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
  joinKeyRoom = 'room';

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
    const joinRoom = `${this.joinKeyRoom}:${room}`;

    //* Validacion si el usuario pertenece al evento
    this.eventServ.verifyAParticipatingUserEvent(room, userId)
    .subscribe({
      next: (exists) => {
        if (!exists) {
          client.emit('unauthorized', { message: 'No perteneces al evento' });
          client.disconnect();
        } else {
          client.join(joinRoom);
          this.eventServ.joinRoom(joinRoom, { userId, socketId: client.id })
            .subscribe( (_) => {
              this.connectedPlayers(joinRoom); 
            });
        }
      },
      error: (error) => {
        client.emit('unauthorized', { message: 'Error de validación: ' + error.message });
      }
    });    
  }

  @SubscribeMessage('waitingGame')
  handleWaitingGame(
    @MessageBody() room: number,
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { userId } = client.user;
    const joinRoom = `${this.joinKeyRoom}:${room}:waiting`;
    
    //* Validacion si el usuario pertenece al evento
    this.eventServ.verifyAParticipatingUserEvent(room, userId)
    .subscribe({
      next: (exists) => {
        if (!exists) {
          client.emit('unauthorized', { message: 'No perteneces al evento' });
          client.disconnect();
        } else {
          client.join(joinRoom);
          this.eventServ.joinRoom(joinRoom, { userId, socketId: client.id });
          this.connectedPlayers(joinRoom);          
          client.emit(joinRoom, { message: `Sala #${room}: Evento no iniciado. Ahora te encuentras en sala de espera.`, status: true});
        }
      },
      error: (error) => {
        client.emit('unauthorrized', { message: 'Error de validación: ' + error.message });
      }
    });
  }

  private connectedPlayers(joinRoom: string) {
    this.eventServ.countUsersRoom(joinRoom).subscribe({
      next: (countUsers) => {
        if (countUsers) {
          this.server.to(joinRoom).emit(`${joinRoom}:countUsers`, countUsers);
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
    const room = `${this.joinKeyRoom}:${roomId}:waiting`;
    const toRoom = `${this.joinKeyRoom}:${roomId}`;

    if (status === StatusEvent.NOW) {
      this.server.to(room).emit(room, status);
      this.connectedPlayers(toRoom);
      //* Cambiar de sala en ws
      this.moveRoom(room, toRoom);
      this.moveRoom(`${room}:countUsers`, `${toRoom}:countUsers`);
    } else if (status === StatusEvent.COMPLETED) {

      //* Elimnar sala
      this.deleteRoom(toRoom);
      this.disconnectedRoom(toRoom);
      this.disconnectedRoom(`${toRoom}:countUsers`);
    }
  }

  @SubscribeMessage('disconnectRoom')
  handleDisconnectRoom(
    @MessageBody() roomId: number, 
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { userId } = client.user;
    const room = `${this.joinKeyRoom}:${roomId}`;

    client.leave(`${room}:waiting`);
    client.leave(`${room}:waiting:countUsers`);
    client.leave(room);
    client.leave(`${room}:countUsers`);

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

  @OnEvent('raffle.number.called', { async: true})
  async ballsCalledRoomWs(payload: {eventId: number, calledBall: CalledBallI}) {
    const {eventId, calledBall} = payload;
    const joinRoom = `${this.joinKeyRoom}:${eventId}`;
    this.server.to(joinRoom).emit(`${joinRoom}:calledBall`, calledBall);
  }

}
