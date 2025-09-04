
import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const Token = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request.token) {
      throw new InternalServerErrorException("Token not found in request (AuthGuard)");
    }
    
    return request.token;
  },
);
