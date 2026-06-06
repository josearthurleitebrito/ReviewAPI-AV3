// Módulo raiz do worker — registra os serviços que processam eventos da fila
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReviewConsumer } from './consumers/review.consumer';
import { AiService } from './services/ai.service';
import { EmailService } from './services/email.service';
import { PdfService } from './services/pdf.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })], // Carrega variáveis do .env
  providers: [
    ReviewConsumer, // Escuta a fila e orquestra o processamento
    AiService,      // Gera sugestões baseadas no tipo de mídia e nota
    EmailService,   // Envia e-mail de confirmação ao usuário
    PdfService,     // Gera comprovante em PDF da avaliação
  ],
})
export class WorkerModule {}
