
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch(RpcException)
export class RcpExceptionFilter implements ExceptionFilter {
  
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const rpcError = exception.getError() as any;

    const status = rpcError.error?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    const message = rpcError.message || 'Ocurrio un error inesperado.';
    
    const code = rpcError.error?.code || 'Error inesperado';

    response.status(status).json({
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
    });
  }
}