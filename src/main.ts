// Ponto de entrada da aplicação NestJS
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from './validation/zod.pipe';
import { z } from 'zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para o frontend se comunicar com a API
  app.enableCors();

  // Pipe global de validação via Zod — rejeita campos nulos/inválidos
  app.useGlobalPipes(new ZodValidationPipe(z.any()));

  // Inicia o servidor na porta definida no .env (padrão 3000)
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Aplicação rodando em: http://localhost:${process.env.PORT ?? 3000}/graphql`);
}
bootstrap();
