import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse } from '@nestjs/websockets';
import { Logger, OnModuleInit, UseFilters, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EventService } from 'src/event/event.service';
import { CurrentUser } from 'src/common';
import { User } from 'src/auth/entities';
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
    //* Validacion si el usuario pertenece al evento
    this.eventServ.verifyAParticipatingUserEvent(room, client.user.userId)
    .subscribe({
      next: (exists) => {
        if (!exists) {
          client.emit('unauthorized', { message: 'No perteneces al evento' });
          client.disconnect();
        } else {
          client.join(room.toString());
          this.server.to(room.toString()).emit('notification', `${client.id} se unió a la sala ${room}`);
        }
      },
      error: (error) => {
        client.emit('', { message: 'Error de validación: ' + error.message });
      }
    })
    
  }

  handleDisconnect(client: Socket) {
    console.log(`Jugador #${client.id} desconectado`);
  }

}
