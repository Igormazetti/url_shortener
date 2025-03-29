import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Configuração do Swagger
    const config = new DocumentBuilder()
      .setTitle('URL Shortener API')
      .setDescription('API para encurtar URLs')
      .setVersion('1.0')
      .addTag('auth', 'Autenticação')
      .addTag('urls', 'Gerenciamento de URLs')
      .addTag('users', 'Gerenciamento de usuários')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    app.enableCors();

    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') || 3000;

    await app.listen(port);

    console.log(`Aplicação iniciada com sucesso: ${await app.getUrl()}`);
    console.log(
      `Documentação Swagger disponível em: ${await app.getUrl()}/api`,
    );
  } catch (error) {
    console.error('Erro ao iniciar a aplicação:', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('Erro não tratado durante a inicialização:', err);
  process.exit(1);
});
