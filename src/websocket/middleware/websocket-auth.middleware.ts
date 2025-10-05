import { Inject, Injectable, Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from 'socket.io';
import { NATS_SERVICE } from "src/config";
import { IUserRole } from "src/common/interfaces";
import { firstValueFrom } from "rxjs";
import { ClientProxy } from "@nestjs/microservices";
import { WebSocketService } from "../websocket.service";

export interface AuthenticatedSocket extends Socket {
    user: IUserRole,
    roomId: string
}

@Injectable()
export class WebSocketMiddleware {
    private readonly logger = new Logger(WebSocketMiddleware.name);

    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
        private readonly wsServ: WebSocketService
    ) {}

    async use(socket: AuthenticatedSocket, next: (error?: any) => void) {
        try {
            const access_token = this.extractToAccessTokenFromSocket(socket);
            if (!access_token) {
                this.logger.warn('Token no proporcionado en la conexión WebSocket');
                return next(new WsException('Token requerido'));
            }

            const roomId = this.extractToRoomFromSocket(socket);
            if (!roomId) {
                this.logger.warn('No se proporcionó una sala en la conexión WebSocket');
                return next(new WsException('No se proporcionó una sala en la conexión WebSocket'));
            }

            const user: IUserRole = 
                    await firstValueFrom(
                      this.client.send('verifyTokenAuth', access_token));

            await this.wsServ.verifyRole(roomId, user.id);
            
            socket.user = user;
            socket.roomId = roomId;
            next();
        } catch (error) {
            this.logger.error('Error en autenticación WebSocket:', error.message);

            if (error.name === 'TokenExpiredError') {
                return next(new WsException('Token expirado'));
            } else if (error.name === 'JsonWebTokenError') {
                return next(new WsException('Token inválido'));
            }

            return next(new WsException('Error de autenticación'));
        }
    }

    extractToAccessTokenFromSocket(socket: Socket): string {
        if (socket.handshake.auth?.access_token) {
            return socket.handshake.auth.access_token;
        }
        return null;
    }

    extractToRoomFromSocket(socket: Socket): string {
        if (socket.handshake.auth?.roomId) {
            return socket.handshake.auth.roomId;
        }
        return null;
    }
}