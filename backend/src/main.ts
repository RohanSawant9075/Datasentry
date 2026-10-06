import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  if (process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('DataSentry-AI API')
      .setDescription('A Domain-Agnostic Data Reliability and Decision Impact Framework')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication')
      .addTag('Datasets')
      .addTag('Quality')
      .addTag('Anomalies')
      .addTag('Drift')
      .addTag('Reliability')
      .addTag('Models')
      .addTag('Impact')
      .addTag('Decisions')
      .addTag('Alerts')
      .addTag('Reports')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              DataSentry-AI Backend Service                ║
║                                                           ║
║  Trust Your Data. Confident Decisions.                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Application is running on: http://localhost:${port}/api
📚 API Documentation: http://localhost:${port}/api/docs
🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}
🔧 Environment: ${process.env.NODE_ENV || 'development'}

  `);
}

bootstrap();
