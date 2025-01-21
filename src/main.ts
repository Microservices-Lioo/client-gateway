import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ExceptionFilter } from './common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Main-Gateway');
  
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })   
  );

  app.useGlobalFilters(new ExceptionFilter())
    
  await app.listen(envs.PORT);
  

  logger.log(`Server is running on port ${envs.PORT}`);
}
bootstrap();
