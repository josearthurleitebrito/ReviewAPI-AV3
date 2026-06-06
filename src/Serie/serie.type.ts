// Tipo GraphQL de série — campos expostos na API para o frontend//
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Serie')
export class SerieType {
  @Field(() => ID)
  id: number;

  @Field()
  titulo: string;

  @Field(() => String, { nullable: true })
  sinopse: string | null;

  @Field()
  externalId: string; // ID do TMDB TV (ex: "tmdb_tv_67890")
}
