import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';
import { EventModule } from './event/event.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [OrdersModule, AuthModule, GamesModule, EventModule, EventEmitterModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
