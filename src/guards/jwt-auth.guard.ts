
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err, user, info) {
        // You can throw an exception based on either "info" or "err" arguments
        if (info?.name == 'TokenExpiredError') {
            throw new UnauthorizedException({
                error: 'invalid_token',
                message: 'Token expired',
                status: 401
            });
        }

        if (info?.name === 'JsonWebTokenError') {
            throw new UnauthorizedException({
              error: 'invalid_token',
              message: 'Invalid token',
              status: 401,
            });
          }

        if (err || !user) {
            throw err || new UnauthorizedException({
                error: 'unauthorized',
                message: 'Unauthorized',
                status: 401,
              });
        }

        return user;
    }
}