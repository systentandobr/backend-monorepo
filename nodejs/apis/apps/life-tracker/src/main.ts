import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { LifeTrackerModule } from './life-tracker.module';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(LifeTrackerModule);

  // Configurações de segurança
  app.use(helmet());
  app.use(compression());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));

  // Validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Prefixo global da API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Life Tracker API rodando na porta ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/life-tracker/health`);
  console.log(`📋 Dashboard: http://localhost:${port}/api/life-tracker/dashboard-summary`);
}

bootstrap(); 