import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, envs, EVENT_SERVICE } from 'src/config';
import { CustomException } from 'src/common';
import { CardsController } from './cards.controller';
import { AwardController } from './award.controller';
import { EventService } from './event.service';

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
      },
      {
        name: AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.AUTH_MS_HOST,
          port: envs.AUTH_MS_PORT
        }
      },
    ])
  ],
  controllers: [EventController, CardsController, AwardController],
  providers: [CustomException, EventService],
  exports: [EventService]
})
export class EventModule { }
