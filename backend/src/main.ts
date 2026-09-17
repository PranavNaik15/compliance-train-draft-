import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());

  const PORT = process.env.PORT || 5001;
  await app.listen(PORT);
  console.log(`🚀 Webinar API Server running at http://localhost:${PORT}`);
}

bootstrap();
