import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { NatsModule } from 'src/transport/nats.module';
import { SchedulerService } from './scheduler.service';
import { SchedulerProviders } from './scheduler.providers';
import { SchedulerProcessor } from './scheduler.processor';

@Module({
    imports: [NatsModule],
    providers: [...SchedulerProviders, SchedulerService, SchedulerProcessor],
    exports: [SchedulerService]
})
export class SchedulerModule implements OnModuleInit {
    private readonly logger = new Logger(SchedulerModule.name);

    constructor(
        private worker: SchedulerProcessor
    ) {}

    async onModuleInit() {
        try {
            const { worker } = await this.worker.startWorker();
            this.logger.log('Worker iniciado correctamente y en ejecución');
        } catch (error) {
            this.logger.error('Falló al iniciar el worker: ' + error.message);
        }
    }
}
