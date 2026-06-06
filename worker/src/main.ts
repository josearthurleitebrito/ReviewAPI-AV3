// Ponto de entrada do worker — sobe o módulo NestJS sem servidor HTTP
// O worker é um serviço separado que apenas consome filas do RabbitMQ
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  // Não há servidor HTTP — apenas inicializa os providers e inicia o consumo das filas
  await app.init();
  console.log('Worker rodando e consumindo filas.');
}
bootstrap();
