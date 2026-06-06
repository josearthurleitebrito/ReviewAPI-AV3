// Constantes e tipos compartilhados entre o backend e o worker para comunicação via RabbitMQ

// Nomes das filas — centralizados aqui para evitar strings duplicadas
export const QUEUES = {
  REVIEW_CREATED: 'review_created', // Fila disparada quando uma nova avaliação é criada
} as const;

// Estrutura da mensagem publicada na fila review_created
// O worker usa este tipo para desserializar a mensagem recebida
export interface ReviewCreatedPayload {
  reviewId: number;
  userId: number;
  userEmail: string;   // Destinatário do e-mail de confirmação
  userName: string;
  mediaType: 'filme' | 'serie' | 'livro' | 'jogo';
  mediaTitle: string;  // Título exibido no e-mail e no PDF
  score: number;
  content: string;
  createdAt: Date;
}
