import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE, envs } from 'src/config';
import { JwtStrategy } from 'src/strategies';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CustomException } from 'src/common';

@Module({
  imports: [
    ClientsModule.register([
      { 
        name: AUTH_SERVICE, 
        transport: Transport.TCP,
        options: {
          host: envs.AUTH_MS_HOST,
          port: envs.AUTH_MS_PORT
        }
      },
    ]),
    PassportModule,
    JwtModule.register({
      secret: envs.JWT_SECRET,
      signOptions: { expiresIn: envs.JWT_EXPIRATION },
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, CustomException],
})
export class AuthModule {}
