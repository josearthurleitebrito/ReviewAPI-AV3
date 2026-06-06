// Schemas Zod para validação das avaliações
import { z } from 'zod';

// Criação de review: nota 1-5, texto não vazio, exatamente uma mídia informada
export const CreateReviewSchema = z
  .object({
    score: z.number().int().min(1, 'Nota mínima é 1').max(5, 'Nota máxima é 5'),
    content: z.string().min(1, 'O texto da avaliação não pode ser vazio').max(2000, 'Texto muito longo'),
    filmeId: z.number().int().positive().optional(),
    serieId: z.number().int().positive().optional(),
    livroId: z.number().int().positive().optional(),
    jogoId: z.number().int().positive().optional(),
  })
  .refine(
    ({ filmeId, serieId, livroId, jogoId }) => {
      // Garante que exatamente um tipo de mídia foi informado
      const count = [filmeId, serieId, livroId, jogoId].filter((v) => v !== undefined).length;
      return count === 1;
    },
    { message: 'Informe exatamente um tipo de mídia (filmeId, serieId, livroId ou jogoId)' },
  );

// Edição de review: requer o ID da review, nova nota e novo texto
export const UpdateReviewSchema = z.object({
  reviewId: z.number().int().positive('ID da avaliação deve ser positivo'),
  score: z.number().int().min(1, 'Nota mínima é 1').max(5, 'Nota máxima é 5'),
  content: z.string().min(1, 'O texto da avaliação não pode ser vazio').max(2000, 'Texto muito longo'),
});

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewDto = z.infer<typeof UpdateReviewSchema>;
