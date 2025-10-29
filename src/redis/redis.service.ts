import { Injectable, Logger } from '@nestjs/common';
import IORedis  from 'ioredis';
import { envs } from 'src/config';

@Injectable()
export class RedisService {
    private static instance: IORedis;
    private readonly logger = new Logger('Redis Service');

    constructor() {
        if (!RedisService.instance) {
            RedisService.instance = new IORedis({
                maxRetriesPerRequest: null,
                host: envs.REDIS_HOST,
                port: envs.REDIS_PORT,
                retryStrategy: times => Math.min(times * 50, 2000),
            });

            RedisService.instance.on('connect', () =>
                this.logger.log('Conectado a Redis'),
            );
            RedisService.instance.on('error', (err) =>
                this.logger.error('Error Redis:', err.message),
            );
        }
    }

    getClient(): IORedis {
        return RedisService.instance;
    }
}
