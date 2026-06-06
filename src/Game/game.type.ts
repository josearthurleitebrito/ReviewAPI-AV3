// Tipo GraphQL de jogo — campos expostos na API para o frontend
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Jogo')
export class GameType {
  @Field(() => ID)
  id: number;

  @Field()
  titulo: string;

  @Field(() => String, { nullable: true })
  desenvolvedora: string | null;

  @Field()
  externalId: string; // ID do RAWG (ex: "rawg_3498")
}
