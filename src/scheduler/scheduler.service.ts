import { Inject, Injectable, Logger } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';
import { SCHEDULER_QUEUE } from 'src/config';

@Injectable()
export class SchedulerService {
    private logger = new Logger('Scheduler Servicee');
    constructor(
        @Inject(SCHEDULER_QUEUE) private readonly queue: Queue,
    ) {}

    //* Método para programar un evento
    async scheduleEvent(eventId: string, runAt: Date) {
        const delay = Math.max(0, runAt.getTime() - Date.now());
        const jobId = `event:${eventId}:activate`;
        const opts: JobsOptions = {
            jobId,
            delay,
            removeOnComplete: true,
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
        };
        await this.queue.add('activate-event', { eventId }, opts);
        this.logger.log(`Evento ${eventId} programado dentro de ${delay}ms`);
    }

    //* Método para cancelar un evento programado
    async cancelEvent(eventId: string) {
        const jobId = `event:${eventId}:activate`;
        try {
            const job = await this.queue.getJob(jobId);
            if (job) await job.remove();
        } catch (error) {
            this.logger.log(`Error al cancelar la tarea ${jobId}: ${error.message}`);
        }
    }
}
