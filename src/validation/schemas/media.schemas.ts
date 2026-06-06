// Schemas Zod para validação dos inputs de mídia (filmes, séries, livros, jogos e sync)
import { z } from 'zod';

// Schema base reutilizado por todos os tipos de mídia
const baseMediaSchema = z.object({
  titulo: z.string().min(1, 'Título não pode ser vazio').max(300, 'Título muito longo'),
  externalId: z.string().min(1, 'ID externo não pode ser vazio'),
});

// Estende o schema base com campos específicos de cada tipo
export const CreateMovieSchema = baseMediaSchema.extend({
  sinopse: z.string().max(5000, 'Sinopse muito longa').optional(),
});

export const CreateSerieSchema = baseMediaSchema.extend({
  sinopse: z.string().max(5000, 'Sinopse muito longa').optional(),
});

export const CreateBookSchema = baseMediaSchema.extend({
  autor: z.string().max(300, 'Nome do autor muito longo').optional(),
});

export const CreateGameSchema = baseMediaSchema.extend({
  desenvolvedora: z.string().max(300, 'Nome da desenvolvedora muito longo').optional(),
});

// Valida o tipo de mídia para a mutation syncCatalog
export const SyncCatalogSchema = z.object({
  mediaType: z.enum(['filme', 'serie', 'livro', 'jogo'], {
    error: 'mediaType deve ser: filme, serie, livro ou jogo',
  }),
});

// Tipos TypeScript inferidos dos schemas
export type CreateMovieDto = z.infer<typeof CreateMovieSchema>;
export type CreateSerieDto = z.infer<typeof CreateSerieSchema>;
export type CreateBookDto = z.infer<typeof CreateBookSchema>;
export type CreateGameDto = z.infer<typeof CreateGameSchema>;
export type SyncCatalogDto = z.infer<typeof SyncCatalogSchema>;
