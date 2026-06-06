// DTO de entrada para editar uma avaliação — ID da review, nova nota e novo texto
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UpdateReviewInput {
  @Field(() => Int)
  reviewId: number; // ID da avaliação a ser editada

  @Field(() => Int)
  score: number; // Nova nota (1 a 5)

  @Field()
  content: string; // Novo texto da avaliação
}
