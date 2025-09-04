
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor( @Inject(NATS_SERVICE) private readonly client: ClientProxy){}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: `No estas autenticado`,
        code: 'UNAUTHORIZED'
      });
    }
    try {
      request['token'] = token;
      const user = 
        await firstValueFrom(
          this.client.send('verifyTokenAuth', token));
      request['user'] = user;
    } catch {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        message: `No estas autenticado`,
        code: 'UNAUTHORIZED'
      });
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}