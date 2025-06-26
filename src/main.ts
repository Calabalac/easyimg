import { config } from 'dotenv';
import { join } from 'path';

// Загружаем переменные окружения из корня проекта (.passenv для разработки)
const envPath = join(__dirname, '..', '..', '.passenv');
config({ path: envPath, override: true });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { RLSService } from './services/rls.service';
import helmet from 'helmet';

async function bootstrap() {
  console.log('🚀 Starting EasyImg API Server...');
  console.log('📊 Environment:', process.env.NODE_ENV);
  console.log('🔌 Port:', process.env.PORT || 8347);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust proxy for Coolify/reverse proxy
  app.set('trust proxy', true);

  // Set up static assets (для загруженных изображений)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Enable CORS для фронтенда
  app.enableCors({
    origin: [
      'http://localhost:8348', // Vite dev server
      'http://localhost:4173', // Vite preview
      process.env.FRONTEND_URL || 'http://localhost:8348'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    }),
  );

  // Автоматическое применение RLS политик при старте
  try {
    const rlsService = app.get(RLSService);
    await rlsService.ensureRLSPolicies();
  } catch (error) {
    console.log('⚠️ RLS auto-apply failed:', error.message);
    console.log('This is not critical - system will work without RLS');
  }

  // Health check для мониторинга
  app.getHttpAdapter().get('/health', (_req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      mode: 'api-only'
    });
  });

  const port = process.env.PORT || 8347;
  await app.listen(port);

  console.log('✅ EasyImg API Server is running!');
  console.log(`🌐 Server: http://localhost:${port}`);
  console.log(`📋 Health Check: http://localhost:${port}/health`);
  console.log(`🖼️ Uploads: http://localhost:${port}/uploads/`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}); 