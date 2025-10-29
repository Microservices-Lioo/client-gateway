import { SCHEDULER_QUEUE } from './../config/services';
import { Provider } from "@nestjs/common";
import { createSchedulerQueue } from './scheduler.queue';
import { RedisService } from 'src/redis/redis.service';

export const SchedulerProviders: Provider[] = [
    {
        provide: SCHEDULER_QUEUE,
        useFactory: (redisService: RedisService) => createSchedulerQueue(redisService.getClient()),
        inject: [RedisService]
    },
];