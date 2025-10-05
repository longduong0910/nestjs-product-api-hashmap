// Crypto polyfill for TypeORM compatibility with Node.js v18.17.0
import { randomUUID } from 'crypto';
if (!global.crypto) {
  global.crypto = {
    randomUUID,
  } as any;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Product API with Custom Hashmap')
    .setDescription(
      'A NestJS API for product management with custom hashmap implementation and file attachments',
    )
    .setVersion('1.0')
    .addTag('products', 'Product management endpoints')
    .addTag('attachments', 'File attachment and directory tree endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/swagger`);
}
void bootstrap();
