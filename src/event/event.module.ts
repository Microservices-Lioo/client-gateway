import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, EVENT_SERVICE } from 'src/config';
import { CustomException } from 'src/common';
import { CardsController } from './cards.controller';
import { AwardController } from './award.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: EVENT_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.EVENT_MS_HOST,
          port: envs.EVENT_MS_PORT
        }
      }
    ])
  ],
  controllers: [EventController, CardsController, AwardController],
  providers: [CustomException],
})
export class EventModule {}
