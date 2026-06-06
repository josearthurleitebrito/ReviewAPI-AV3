// Tipo GraphQL de livro — campos expostos na API para o frontend//
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Livro')
export class BookType {
  @Field(() => ID)
  id: number;

  @Field()
  titulo: string;

  @Field(() => String, { nullable: true })
  autor: string | null;

  @Field()
  externalId: string; // ID do Open Library (ex: "ol_OL1234W")
}
