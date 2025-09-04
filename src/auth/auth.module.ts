import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { NatsModule } from 'src/transport/nats.module';
import { CustomException } from 'src/common/exceptions';

@Module({
  imports: [
    NatsModule
  ],
  controllers: [AuthController],
  providers: [CustomException],
})
export class AuthModule {}
