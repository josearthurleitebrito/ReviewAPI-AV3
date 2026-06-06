// Tipo GraphQL de filme — campos expostos na API para o frontend
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Filme')
export class MovieType {
  @Field(() => ID)
  id: number;

  @Field()
  titulo: string;

  @Field(() => String, { nullable: true })
  sinopse: string | null;

  @Field()
  externalId: string; // ID da API de origem (ex: "tmdb_12345")
}
