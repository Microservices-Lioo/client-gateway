import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { NatsModule } from 'src/transport/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [PaymentsController],
  providers: [],
})
export class PaymentsModule {}
