// Tipo GraphQL de avaliação — define os campos retornados pela API
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { UserType } from '../User/user.type';
import { MovieType } from '../Movie/movie.type';
import { SerieType } from '../Serie/serie.type';
import { BookType } from '../Book/book.type';
import { GameType } from '../Game/game.type';

@ObjectType('Review')
export class ReviewType {
  @Field(() => ID)
  id: number;

  @Field(() => UserType)
  user: UserType; // Resolvido dinamicamente pelo ReviewResolver

  @Field(() => Int)
  score: number; // Nota de 1 a 5

  @Field()
  content: string; // Texto da avaliação

  @Field()
  createdAt: Date;

  // Apenas um destes campos será preenchido por review
  @Field(() => MovieType, { nullable: true })
  filme?: MovieType;

  @Field(() => SerieType, { nullable: true })
  serie?: SerieType;

  @Field(() => BookType, { nullable: true })
  livro?: BookType;

  @Field(() => GameType, { nullable: true })
  jogo?: GameType;

  @Field()
  isDeleted: boolean; // true = soft-deleted (não aparece nas listagens)
}
