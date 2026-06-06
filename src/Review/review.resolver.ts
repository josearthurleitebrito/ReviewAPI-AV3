// Resolver GraphQL de avaliações — expõe queries e mutations para o frontend
import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewType } from './review.type';
import { UserType } from '../User/user.type';
import { MovieType } from '../Movie/movie.type';
import { SerieType } from '../Serie/serie.type';
import { BookType } from '../Book/book.type';
import { GameType } from '../Game/game.type';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { CurrentUser } from '../Auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { ZodValidationPipe } from '../validation/zod.pipe';
import { CreateReviewSchema, UpdateReviewSchema } from '../validation/schemas/review.schemas';

@Resolver(() => ReviewType)
export class ReviewResolver {
  constructor(
    private reviewService: ReviewService,
    private prisma: PrismaService,
  ) {}

  // Lista todas as avaliações públicas
  @Query(() => [ReviewType])
  async reviews(): Promise<ReviewType[]> {
    return this.reviewService.findAll() as any;
  }

  // Retorna as avaliações do usuário logado
  @Query(() => [ReviewType])
  @UseGuards(GqlAuthGuard)
  async myReviews(@CurrentUser() user: any): Promise<ReviewType[]> {
    return this.reviewService.findByUser(user.getId()) as any;
  }

  // Retorna avaliações de um item de mídia específico
  @Query(() => [ReviewType])
  async reviewsByMedia(
    @Args('filmeId', { type: () => Int, nullable: true }) filmeId?: number,
    @Args('serieId', { type: () => Int, nullable: true }) serieId?: number,
    @Args('livroId', { type: () => Int, nullable: true }) livroId?: number,
    @Args('jogoId', { type: () => Int, nullable: true }) jogoId?: number,
  ): Promise<ReviewType[]> {
    return this.reviewService.findByMedia({ filmeId, serieId, livroId, jogoId }) as any;
  }

  // Cria uma nova avaliação (requer autenticação)
  @Mutation(() => ReviewType)
  @UseGuards(GqlAuthGuard)
  async createReview(
    @CurrentUser() user: any,
    @Args('input', new ZodValidationPipe(CreateReviewSchema)) input: CreateReviewInput,
  ): Promise<ReviewType> {
    return this.reviewService.create(user.getId(), input.score, input.content, {
      filmeId: input.filmeId,
      serieId: input.serieId,
      livroId: input.livroId,
      jogoId: input.jogoId,
    }) as any;
  }

  // Edita uma avaliação existente (somente o autor)
  @Mutation(() => ReviewType)
  @UseGuards(GqlAuthGuard)
  async updateReview(
    @CurrentUser() user: any,
    @Args('input', new ZodValidationPipe(UpdateReviewSchema)) input: UpdateReviewInput,
  ): Promise<ReviewType> {
    return this.reviewService.update(input.reviewId, user.getId(), input.score, input.content) as any;
  }

  // Exclui uma avaliação via soft-delete (somente o autor)
  @Mutation(() => ReviewType)
  @UseGuards(GqlAuthGuard)
  async deleteReview(
    @CurrentUser() user: any,
    @Args('reviewId', { type: () => Int }) reviewId: number,
  ): Promise<ReviewType> {
    return this.reviewService.delete(reviewId, user.getId()) as any;
  }

  // ── Resolvedores de relações — carregam dados relacionados sob demanda ──────

  @ResolveField(() => UserType)
  async user(@Parent() review: any): Promise<UserType> {
    const u = await this.prisma.user.findUnique({ where: { id: review.userId } });
    if (!u) throw new Error('Usuário não encontrado');
    return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt };
  }

  @ResolveField(() => MovieType, { nullable: true })
  async filme(@Parent() review: any): Promise<MovieType | null> {
    if (!review.filmeId) return null;
    return this.prisma.filme.findUnique({ where: { id: review.filmeId } });
  }

  @ResolveField(() => SerieType, { nullable: true })
  async serie(@Parent() review: any): Promise<SerieType | null> {
    if (!review.serieId) return null;
    return this.prisma.serie.findUnique({ where: { id: review.serieId } });
  }

  @ResolveField(() => BookType, { nullable: true })
  async livro(@Parent() review: any): Promise<BookType | null> {
    if (!review.livroId) return null;
    return this.prisma.livro.findUnique({ where: { id: review.livroId } });
  }

  @ResolveField(() => GameType, { nullable: true })
  async jogo(@Parent() review: any): Promise<GameType | null> {
    if (!review.jogoId) return null;
    return this.prisma.jogo.findUnique({ where: { id: review.jogoId } });
  }
}
