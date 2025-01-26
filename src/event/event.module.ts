import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, EVENT_SERVICE } from 'src/config';

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
  controllers: [EventController],
  providers: [],
})
export class EventModule {}
