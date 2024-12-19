import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CARD_SERVICE, envs } from 'src/config';

@Module({
  imports: [
    ClientsModule.register([
      { 
        name: CARD_SERVICE, 
        transport: Transport.TCP,
        options: {
          host: envs.CARD_MS_HOST,
          port: envs.CARD_MS_PORT
        }
      },
      
    ]),
  ],
  controllers: [CardsController],
  providers: [],
})
export class CardsModule { }
