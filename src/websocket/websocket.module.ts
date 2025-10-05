import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { EventModule } from 'src/event/event.module';
import { WebSocketMiddleware } from './middleware/websocket-auth.middleware';
import { NatsModule } from 'src/transport/nats.module';
import { WebSocketService } from './websocket.service';

@Module({
  providers: [WebsocketGateway, WebSocketMiddleware, WebSocketService],
  imports: [NatsModule, EventModule]
})
export class WebsocketModule {}
