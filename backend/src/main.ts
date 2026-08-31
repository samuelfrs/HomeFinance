import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefixo global para todos os endpoints da API
  app.setGlobalPrefix('api');

  // Configuração global de CORS para permitir conexões do frontend Next.js
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validação automática de DTOs e transformação de tipos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtro global de exceções para padronização de mensagens de erro
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuração do Swagger/OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('HomeFinance API')
    .setDescription(
      'API RESTful do HomeFinance para controle de receitas, despesas e saldos residenciais. Construída com NestJS e Prisma ORM.',
    )
    .setVersion('1.0')
    .addTag('Pessoas', 'Gerenciamento de moradores da residência')
    .addTag('Transações', 'Controle de receitas e despesas com validações de negócio')
    .addTag('Dashboard', 'Consolidação e cálculo de saldos individuais e gerais')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'HomeFinance API Docs',
  });

  const port = process.env.PORT || 5090;
  await app.listen(port);

  logger.log(`🚀 HomeFinance API rodando em: http://localhost:${port}/api`);
  logger.log(`📚 Swagger Docs disponível em: http://localhost:${port}/api/docs`);
}

bootstrap();
