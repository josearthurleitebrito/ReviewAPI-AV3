// Resolver GraphQL de jogos — expõe queries e mutations para o frontend
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GamesService } from './gamesService';
import { GameType } from './game.type';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { ZodValidationPipe } from '../validation/zod.pipe';
import { CreateGameSchema } from '../validation/schemas/media.schemas';

@Resolver(() => GameType)
export class GamesResolver {
  constructor(private gamesService: GamesService) {}

  // Lista todos os jogos disponíveis no catálogo local
  @Query(() => [GameType])
  async games(): Promise<GameType[]> {
    return this.gamesService.findAll();
  }

  // Busca um jogo pelo ID (retorna null se não encontrado)
  @Query(() => GameType, { nullable: true })
  async game(@Args('id', { type: () => Int }) id: number): Promise<GameType | null> {
    return this.gamesService.findById(id);
  }

  // Cria um jogo manualmente (requer autenticação)
  @Mutation(() => GameType)
  @UseGuards(GqlAuthGuard)
  async createGame(
    @Args('titulo', new ZodValidationPipe(CreateGameSchema.shape.titulo)) titulo: string,
    @Args('externalId', new ZodValidationPipe(CreateGameSchema.shape.externalId)) externalId: string,
    @Args('desenvolvedora', { nullable: true }) desenvolvedora?: string,
  ): Promise<GameType> {
    return this.gamesService.create(titulo, desenvolvedora, externalId);
  }
}
