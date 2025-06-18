import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: WsException, host: ArgumentsHost): void {
        const client = host.switchToWs().getClient<Socket>();
        const data = host.switchToWs().getData();

        const error = exception.getError();

        const details = {
            message: typeof error === 'string' ? error : (error as any).message || 'Error desconocido',
            timestamp: new Date().toISOString(),
            event: data?.event || 'unknown'
        }

        client.emit('error', details);
    }
}