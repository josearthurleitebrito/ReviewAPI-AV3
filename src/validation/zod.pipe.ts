// Pipe de validação com Zod — valida os argumentos das mutations/queries antes de chegarem ao resolver
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe<T = unknown> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  // Tenta parsear o valor com o schema Zod; lança 400 com mensagem detalhada se falhar
  transform(value: unknown): T {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata os erros de validação em uma string legível
        const messages = error.issues
          .map((e) => (e.path.length ? `${e.path.join('.')}: ${e.message}` : e.message))
          .join('; ');
        throw new BadRequestException(`Validação falhou — ${messages}`);
      }
      throw new BadRequestException('Validação falhou');
    }
  }
}
