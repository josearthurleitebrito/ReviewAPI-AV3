// Resolver GraphQL de filmes — expõe queries e mutations para o frontend//
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MoviesService } from './moviesService';
import { MovieType } from './movie.type';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { ZodValidationPipe } from '../validation/zod.pipe';
import { CreateMovieSchema } from '../validation/schemas/media.schemas';

@Resolver(() => MovieType)
export class MoviesResolver {
  constructor(private moviesService: MoviesService) {}

  // Lista todos os filmes disponíveis no catálogo local
  @Query(() => [MovieType])
  async movies(): Promise<MovieType[]> {
    return this.moviesService.findAll();
  }

  // Busca um filme pelo ID (retorna null se não encontrado)
  @Query(() => MovieType, { nullable: true })
  async movie(@Args('id', { type: () => Int }) id: number): Promise<MovieType | null> {
    return this.moviesService.findById(id);
  }

  // Cria um filme manualmente (requer autenticação)
  @Mutation(() => MovieType)
  @UseGuards(GqlAuthGuard)
  async createMovie(
    @Args('titulo', new ZodValidationPipe(CreateMovieSchema.shape.titulo)) titulo: string,
    @Args('externalId', new ZodValidationPipe(CreateMovieSchema.shape.externalId)) externalId: string,
    @Args('sinopse', { nullable: true }) sinopse?: string,
  ): Promise<MovieType> {
    return this.moviesService.create(titulo, sinopse, externalId);
  }
}
