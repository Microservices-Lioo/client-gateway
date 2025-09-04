
import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new InternalServerErrorException({
        message: "Usuario no encontrado en la requets",
        status: 500,
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
    
    return request.user;
  },
);
