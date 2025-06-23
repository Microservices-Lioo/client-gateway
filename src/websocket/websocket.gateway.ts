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
    const joinRoom = `room:${room}`;

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
    const joinRoom = `room:${room}:waiting`;
    
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
        console.log(countUsers);
        if (countUsers) {
          this.server.to(joinRoom).emit(`${joinRoom}:countUsers`, countUsers);
        }
      }
    });
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    await this.deleteUserRoom(client.user.userId, client.id);
    console.log(`Jugador #${client.id} desconectado`);
  }

  @OnEvent('event.update.status')
  async updateStatusEvent(
    data: { status: StatusEvent, eventId: number }
  ) {
    const { status, eventId } = data;
    const room = `room:${eventId}:waiting`;
    const toRoom = `room:${eventId}`;
    if (status === StatusEvent.NOW) {
      //* Iniciar sala

      //* Cambiar de sala
      this.eventServ.moveToRoom(room, toRoom).subscribe();
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
    @MessageBody() room: number, 
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { userId } = client.user;
    const name = `room:${room}`;
    client.leave(`${name}:waiting`);
    client.leave(`${name}:waiting:countUsers`);
    client.leave(name);
    client.leave(`${name}:countUsers`);

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
    this.connectedPlayers(toRoom);
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

}
