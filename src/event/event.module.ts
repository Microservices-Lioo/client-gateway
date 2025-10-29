import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { CardsController } from './cards.controller';
import { AwardController } from './award.controller';
import { NatsModule } from 'src/transport/nats.module';
import { CustomException } from 'src/common/exceptions';
import { EventErrorInterceptor } from 'src/common/interceptors';
import { SchedulerModule } from 'src/scheduler/scheduler.module';

@Module({
  imports: [NatsModule, SchedulerModule],
  controllers: [EventController, CardsController, AwardController],
  providers: [CustomException, EventErrorInterceptor],
})
export class EventModule { }
