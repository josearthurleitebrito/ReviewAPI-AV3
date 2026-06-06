// Consumidor da fila RabbitMQ — processa eventos de avaliação criada
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { QUEUES, ReviewCreatedPayload } from '../../shared/queue.constants';
import { AiService } from '../services/ai.service';
import { EmailService } from '../services/email.service';
import { PdfService } from '../services/pdf.service';

@Injectable()
export class ReviewConsumer implements OnModuleInit {
  private readonly logger = new Logger(ReviewConsumer.name);

  constructor(
    private readonly aiService: AiService,
    private readonly emailService: EmailService,
    private readonly pdfService: PdfService,
  ) {}

  // Inicia o consumidor assim que o módulo é carregado
  async onModuleInit() {
    await this.startConsuming();
  }

  private async startConsuming() {
    const url = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';

    const connect = async () => {
      try {
        this.logger.log('Worker conectando ao RabbitMQ...');
        const connection: amqp.ChannelModel = await amqp.connect(url);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUES.REVIEW_CREATED, { durable: true });
        channel.prefetch(1); // Processa uma mensagem por vez

        this.logger.log(`Escutando a fila '${QUEUES.REVIEW_CREATED}'...`);

        channel.consume(QUEUES.REVIEW_CREATED, async (msg) => {
          if (!msg) return;
          try {
            const payload: ReviewCreatedPayload = JSON.parse(msg.content.toString());
            this.logger.log(
              `Processando avaliação #${payload.reviewId} — ` +
              `[${payload.mediaType}] "${payload.mediaTitle}" por ${payload.userName}`,
            );
            await this.processReviewCreated(payload);
            channel.ack(msg); // Confirma que a mensagem foi processada com sucesso
          } catch (err: any) {
            this.logger.error(`Falha ao processar mensagem: ${err.message}`);
            // Descarta a mensagem sem recolocar na fila (evita loop de erros)
            channel.nack(msg, false, false);
          }
        });

        // Reconecta automaticamente se a conexão cair
        connection.on('close', () => {
          this.logger.warn('Conexão com RabbitMQ fechada. Reconectando em 5s...');
          setTimeout(connect, 5000);
        });
        connection.on('error', (err: Error) => {
          this.logger.error(`Erro no RabbitMQ: ${err.message}. Reconectando em 5s...`);
          setTimeout(connect, 5000);
        });
      } catch (err: any) {
        this.logger.warn(`Falha na conexão: ${err.message}. Tentando novamente em 5s...`);
        setTimeout(connect, 5000);
      }
    };

    await connect();
  }

  // Orquestra o processamento: sugestão → email e PDF em paralelo
  private async processReviewCreated(payload: ReviewCreatedPayload): Promise<void> {
    // Passo 1: gera a sugestão (email e PDF dependem dela)
    const aiSuggestion = await this.aiService.generateSuggestion(payload);

    // Passo 2 e 3: envia email e gera PDF ao mesmo tempo
    const results = await Promise.allSettled([
      this.emailService.sendReviewConfirmation(payload, aiSuggestion),
      this.pdfService.generateReviewPdf(payload, aiSuggestion),
    ]);

    const [emailResult, pdfResult] = results;

    if (emailResult.status === 'rejected') {
      this.logger.error(`Erro no serviço de e-mail: ${emailResult.reason?.message ?? emailResult.reason}`);
    }
    if (pdfResult.status === 'rejected') {
      this.logger.error(`Erro no serviço de PDF: ${pdfResult.reason?.message ?? pdfResult.reason}`);
    }

    this.logger.log(`Avaliação #${payload.reviewId} processada com sucesso.`);
  }
}
