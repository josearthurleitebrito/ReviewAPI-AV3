// Resolver GraphQL de livros — expõe queries e mutations para o frontend//
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BookService } from './bookService';
import { BookType } from './book.type';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { ZodValidationPipe } from '../validation/zod.pipe';
import { CreateBookSchema } from '../validation/schemas/media.schemas';

@Resolver(() => BookType)
export class BookResolver {
  constructor(private bookService: BookService) {}

  // Lista todos os livros disponíveis no catálogo local
  @Query(() => [BookType])
  async books(): Promise<BookType[]> {
    return this.bookService.findAll();
  }

  // Busca um livro pelo ID (retorna null se não encontrado)
  @Query(() => BookType, { nullable: true })
  async book(@Args('id', { type: () => Int }) id: number): Promise<BookType | null> {
    return this.bookService.findById(id);
  }

  // Cria um livro manualmente (requer autenticação)
  @Mutation(() => BookType)
  @UseGuards(GqlAuthGuard)
  async createBook(
    @Args('titulo', new ZodValidationPipe(CreateBookSchema.shape.titulo)) titulo: string,
    @Args('externalId', new ZodValidationPipe(CreateBookSchema.shape.externalId)) externalId: string,
    @Args('autor', { nullable: true }) autor?: string,
  ): Promise<BookType> {
    return this.bookService.create(titulo, autor, externalId);
  }
}
