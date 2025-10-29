import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Job, Worker } from 'bullmq';
import { NATS_SERVICE } from "src/config";
import { RedisService } from 'src/redis/redis.service';



@Injectable()
export class SchedulerProcessor {
    private readonly logger = new Logger('Scheduler Worker');
    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
        private readonly redisServ: RedisService
    ) {}

    async startWorker() {
        const redisConn = this.redisServ.getClient();
        const worker = new Worker(
            'scheduler-events',
            async (job: Job) => {
                this.logger.log(`Procesando Job ${job.id} - ${job.name}`);
                if (job.name === 'activate-event') {
                    const { eventId } = job.data;
                    // actualizar evento y sala
                    this.client.emit('activeEvent', { eventId });
                    this.client.emit('activeRoom', { eventId });
                    this.logger.log(`Se activó el evento ${eventId}`)
                }
            },
            { connection: redisConn }
        );

        worker.on('failed', (job, error) => {
            this.logger.error(`Job ${job.id} falló: ${error.message}`);
        });

        worker.on('completed', (job) => {
            this.logger.log(`Job ${job.id} completado`);
        });

        worker.on('error', err => {
            this.logger.error(err);
        });

        return { worker };
    }
}
