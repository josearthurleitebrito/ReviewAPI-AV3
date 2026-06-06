export const QUEUES = {
  REVIEW_CREATED: 'review_created',
} as const;

export interface ReviewCreatedPayload {
  reviewId: number;
  userId: number;
  userEmail: string;
  userName: string;
  mediaType: 'filme' | 'serie' | 'livro' | 'jogo';
  mediaTitle: string;
  score: number;
  content: string;
  createdAt: Date;
}
