import { Module } from '@nestjs/common';
import { CardsModule } from './cards/cards.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CardsModule, OrdersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
