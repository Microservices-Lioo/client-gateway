import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { RcpExceptionFilter } from './common/exceptions';

async function bootstrap() {
  const logger = new Logger('Main-Gateway');
  
  const app = await NestFactory.create(AppModule, {
    rawBody: true 
  });

  app.enableCors();
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true
    })   
  );
  app.useGlobalFilters(new RcpExceptionFilter())
  
  app.setGlobalPrefix('api');

  await app.listen(envs.PORT);
  

  logger.log(`Server is running on port ${envs.PORT}`);
  logger.log(`Web Socket Server is running on port ${envs.WS_PORT}`);
}
bootstrap();