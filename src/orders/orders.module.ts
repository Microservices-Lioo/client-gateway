import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, ORDER_SERVICE } from 'src/config';
import { PaymentController } from './payment.controller';
import { CustomerController } from './customer.controller';

@Module({
  imports: [
    ClientsModule.register([
      { 
        name: ORDER_SERVICE, 
        transport: Transport.TCP,
        options: {
          host: envs.ORDER_MS_HOST,
          port: envs.ORDER_MS_PORT
        } 
      },
    ]),
  ],
  controllers: [OrdersController, PaymentController, CustomerController],
  providers: [],
})
export class OrdersModule {}
