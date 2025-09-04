import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { EventModule } from './event/event.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebsocketModule } from './websocket/websocket.module';
import { NatsModule } from './transport/nats.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [OrdersModule, AuthModule, GamesModule, EventModule, EventEmitterModule.forRoot(), WebsocketModule, NatsModule, PaymentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
