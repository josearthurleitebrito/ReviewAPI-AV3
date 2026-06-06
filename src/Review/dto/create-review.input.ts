// DTO de entrada para criar uma avaliação — nota, texto e o ID de uma mídia
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateReviewInput {
  @Field(() => Int)
  score: number; // Nota de 1 a 5

  @Field()
  content: string; // Texto da avaliação

  // Apenas um dos campos abaixo deve ser informado por vez
  @Field(() => Int, { nullable: true })
  filmeId?: number;

  @Field(() => Int, { nullable: true })
  serieId?: number;

  @Field(() => Int, { nullable: true })
  livroId?: number;

  @Field(() => Int, { nullable: true })
  jogoId?: number;
}
