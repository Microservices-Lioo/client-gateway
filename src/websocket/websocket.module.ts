import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { EventModule } from 'src/event/event.module';
import { WebSocketMiddleware } from './middleware/websocket-auth.middleware';
import { UserconnectionService } from './services/userconnection.service';

@Module({
  providers: [WebsocketGateway, WebSocketMiddleware, UserconnectionService],
  imports: [EventModule]
})
export class WebsocketModule {}
