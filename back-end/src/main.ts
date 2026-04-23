import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ms }) => {
              return `[${timestamp}] ${level}: [${context || 'App'}] ${message} ${ms}`;
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          level: 'error',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      ],
    }),
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('LEFXY - CRM Jurídico')
    .setDescription('API robusta para gestão de leads jurídicos, integrada com Google Gemini IA e automação de follow-ups.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend running on http://localhost:${port}`);
}

bootstrap();
