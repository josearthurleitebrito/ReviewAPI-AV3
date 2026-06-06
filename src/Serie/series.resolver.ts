// Resolver GraphQL de séries — expõe queries e mutations para o frontend//
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SerieType } from './serie.type';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { ZodValidationPipe } from '../validation/zod.pipe';
import { CreateSerieSchema } from '../validation/schemas/media.schemas';

@Resolver(() => SerieType)
export class SeriesResolver {
  constructor(private seriesService: SeriesService) {}

  // Lista todas as séries disponíveis no catálogo local
  @Query(() => [SerieType])
  async series(): Promise<SerieType[]> {
    return this.seriesService.findAll();
  }

  // Busca uma série pelo ID (retorna null se não encontrada)
  @Query(() => SerieType, { nullable: true })
  async serie(@Args('id', { type: () => Int }) id: number): Promise<SerieType | null> {
    return this.seriesService.findById(id);
  }

  // Cria uma série manualmente (requer autenticação)
  @Mutation(() => SerieType)
  @UseGuards(GqlAuthGuard)
  async createSerie(
    @Args('titulo', new ZodValidationPipe(CreateSerieSchema.shape.titulo)) titulo: string,
    @Args('externalId', new ZodValidationPipe(CreateSerieSchema.shape.externalId)) externalId: string,
    @Args('sinopse', { nullable: true }) sinopse?: string,
  ): Promise<SerieType> {
    return this.seriesService.create(titulo, sinopse, externalId);
  }
}
