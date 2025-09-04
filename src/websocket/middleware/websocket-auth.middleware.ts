import { Injectable, Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from 'socket.io';
import { envs } from "src/config";
import { UserWebSocketInterface } from "../interfaces/user-websocket.interface";

export interface AuthenticatedSocket extends Socket {
    user: UserWebSocketInterface
}

@Injectable()
export class WebSocketMiddleware {
    private readonly logger = new Logger(WebSocketMiddleware.name);

    use(socket: AuthenticatedSocket, next: (error?: any) => void) {
        try {
            const access_token = this.extractToAccessTokenFromSocket(socket);
            if (!access_token) {
                this.logger.warn('Token no proporcionado en la conexión WebSocket');
                return next(new WsException('Token requerido'));
            }

            let payload: any = {
                
            };
            
            if ( !payload || !payload.id || 
                !payload.name || !payload.email || 
                !payload.lastname
            ) {
                console.log(payload)
                return next(new WsException('Token inválido'));
            }

            socket.user = {
                userId: payload.id,
                name: payload.name,
                email: payload.email,
                lastname: payload.lastname
            };
            this.logger.log(`Usuario autenticado: #${socket.user.userId} (${socket.user.name})`);
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
}