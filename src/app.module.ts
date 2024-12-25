import { Module } from '@nestjs/common';
import { CardsModule } from './cards/cards.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { GamesModule } from './games/games.module';

@Module({
  imports: [CardsModule, OrdersModule, AuthModule, GamesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
