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
    const joinRoom = `Room #${room}`;

    //* Validacion si el usuario pertenece al evento
    this.eventServ.verifyAParticipatingUserEvent(room, userId)
    .subscribe({
      next: (exists) => {
        if (!exists) {
          client.emit('unauthorized', { message: 'No perteneces al evento' });
          client.disconnect();
        } else {
          client.join(joinRoom);
          this.server.to(joinRoom).emit('cantPlayers', `${client.id} se unió a la sala ${room}`);
        }
      },
      error: (error) => {
        client.emit('', { message: 'Error de validación: ' + error.message });
      }
    });    
  }

  @SubscribeMessage('waitingGame')
  handleWaitingGame(
    @MessageBody() room: number,
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    const { userId } = client.user;
    const joinRoom = `Waiting room #${room}`;
    //* Validacion si el usuario pertenece al evento
    this.eventServ.verifyAParticipatingUserEvent(room, userId)
    .subscribe({
      next: (exists) => {
        if (!exists) {
          client.emit('unauthorized', { message: 'No perteneces al evento' });
          client.disconnect();
        } else {
          client.join(joinRoom);
          client.emit(joinRoom, { message: `Estas en la sala de espera #${room}`, status: true});
        }
      },
      error: (error) => {
        client.emit('', { message: 'Error de validación: ' + error.message });
      }
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Jugador #${client.id} desconectado`);
  }

}
