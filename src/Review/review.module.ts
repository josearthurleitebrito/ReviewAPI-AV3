// Módulo de avaliações — registra o serviço e o resolver de reviews
// O ReviewService depende do RabbitMQService (injetado globalmente) para publicar eventos
import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';

@Module({
  providers: [ReviewService, ReviewResolver],
  exports: [ReviewService],
})
export class ReviewModule {}
