// Serviço de mensageria — publica eventos no RabbitMQ para o worker processar
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { QUEUES, ReviewCreatedPayload } from './queue.constants';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isShuttingDown = false;

  // Inicia a conexão ao subir o módulo
  async onModuleInit() {
    await this.connect();
  }

  // Fecha a conexão ao encerrar o módulo
  async onModuleDestroy() {
    this.isShuttingDown = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    try { await this.channel?.close(); } catch { /* ignora erros ao fechar */ }
    try { await this.connection?.close(); } catch { /* ignora erros ao fechar */ }
  }

  private async connect() {
    const url = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';
    try {
      this.logger.log('Conectando ao RabbitMQ...');
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Garante que todas as filas existem antes de publicar
      await Promise.all(
        Object.values(QUEUES).map((queue) =>
          this.channel!.assertQueue(queue, { durable: true }),
        ),
      );

      this.connection.on('error', () => this.scheduleReconnect());
      this.connection.on('close', () => this.scheduleReconnect());

      this.logger.log('RabbitMQ conectado e filas criadas.');
    } catch (err: any) {
      this.logger.warn(`RabbitMQ indisponível: ${err.message}. Tentando novamente em 5s.`);
      this.scheduleReconnect();
    }
  }

  // Reagenda a reconexão em caso de queda
  private scheduleReconnect() {
    if (this.isShuttingDown) return;
    this.connection = null;
    this.channel = null;
    this.reconnectTimer = setTimeout(() => this.connect(), 5000);
  }

  // Publica uma mensagem JSON em uma fila específica
  async publish(queue: string, payload: object): Promise<boolean> {
    if (!this.channel) await this.connect();
    if (!this.channel) {
      this.logger.warn(`RabbitMQ não disponível — mensagem para '${queue}' descartada.`);
      return false;
    }
    try {
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
        persistent: true,       // Mensagem sobrevive a reinicializações do broker
        contentType: 'application/json',
      });
      this.logger.log(`Mensagem publicada em '${queue}'`);
      return true;
    } catch (err: any) {
      this.logger.error(`Falha ao publicar: ${err.message}`);
      return false;
    }
  }

  // Atalho para publicar o evento de avaliação criada
  async publishReviewCreated(payload: ReviewCreatedPayload): Promise<boolean> {
    return this.publish(QUEUES.REVIEW_CREATED, payload);
  }
}
