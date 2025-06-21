import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { EventModule } from 'src/event/event.module';
import { WebSocketMiddleware } from './middleware/websocket-auth.middleware';

@Module({
  providers: [WebsocketGateway, WebSocketMiddleware],
  imports: [EventModule]
})
export class WebsocketModule {}
