import { Module } from '@nestjs/common';
import { CardsModule } from './cards/cards.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [CardsModule, OrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
