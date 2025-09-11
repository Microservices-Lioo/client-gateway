import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { NatsModule } from 'src/transport/nats.module';
import { CustomException } from 'src/common/exceptions';
import { RoleController } from './role.controller';

@Module({
  imports: [
    NatsModule
  ],
  controllers: [AuthController, RoleController],
  providers: [CustomException],
})
export class AuthModule {}
