import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Explicitly define the Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Appointment Booking API')
    .setDescription('API documentation for the Appointment Booking System')
    .setVersion('1.0')
    .build();

  // Type Swagger document explicitly
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
