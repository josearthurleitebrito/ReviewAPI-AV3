// Serviço de avaliações — criação, edição, exclusão e consultas
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private rabbitmqService: RabbitMQService,
  ) {}

  // Cria uma avaliação e publica o evento no RabbitMQ para o worker processar
  async create(
    userId: number,
    score: number,
    content: string,
    mediaIds: { filmeId?: number; serieId?: number; livroId?: number; jogoId?: number },
  ) {
    const { filmeId, serieId, livroId, jogoId } = mediaIds;

    // Garante que exatamente um tipo de mídia foi informado
    const provided = [filmeId, serieId, livroId, jogoId].filter(id => id !== undefined && id !== null);
    if (provided.length !== 1) {
      throw new BadRequestException('Informe exatamente um tipo de mídia (filmeId, serieId, livroId ou jogoId)');
    }

    if (score < 1 || score > 5) {
      throw new BadRequestException('Nota deve ser entre 1 e 5');
    }

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('O conteúdo da avaliação não pode estar vazio');
    }

    // Verifica se o item de mídia existe no banco e obtém o título
    let mediaTitle = '';
    let mediaType: 'filme' | 'serie' | 'livro' | 'jogo' = 'filme';

    if (filmeId) {
      const filme = await this.prisma.filme.findUnique({ where: { id: filmeId } });
      if (!filme) throw new NotFoundException('Filme não encontrado');
      mediaTitle = filme.titulo;
      mediaType = 'filme';
    } else if (serieId) {
      const serie = await this.prisma.serie.findUnique({ where: { id: serieId } });
      if (!serie) throw new NotFoundException('Série não encontrada');
      mediaTitle = serie.titulo;
      mediaType = 'serie';
    } else if (livroId) {
      const livro = await this.prisma.livro.findUnique({ where: { id: livroId } });
      if (!livro) throw new NotFoundException('Livro não encontrado');
      mediaTitle = livro.titulo;
      mediaType = 'livro';
    } else if (jogoId) {
      const jogo = await this.prisma.jogo.findUnique({ where: { id: jogoId } });
      if (!jogo) throw new NotFoundException('Jogo não encontrado');
      mediaTitle = jogo.titulo;
      mediaType = 'jogo';
    }

    // Salva a avaliação no banco
    const review = await this.prisma.review.create({
      data: {
        userId,
        score,
        content,
        filmeId,
        serieId,
        livroId,
        jogoId,
      },
      include: {
        user: true,
      },
    });

    // Publica o evento para o worker (email + PDF + sugestão)
    await this.rabbitmqService.publishReviewCreated({
      reviewId: review.id,
      userId: review.userId,
      userEmail: review.user.email,
      userName: review.user.name,
      mediaType,
      mediaTitle,
      score: review.score,
      content: review.content,
      createdAt: review.createdAt,
    });

    return review;
  }

  // Atualiza nota e texto de uma avaliação (apenas o dono pode editar)
  async update(reviewId: number, userId: number, score: number, content: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta avaliação');
    }

    if (score < 1 || score > 5) {
      throw new BadRequestException('Nota deve ser entre 1 e 5');
    }

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('O conteúdo da avaliação não pode estar vazio');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        score,
        content,
      },
    });
  }

  // Remove a avaliação usando soft-delete (marca isDeleted = true)
  async delete(reviewId: number, userId: number) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para excluir esta avaliação');
    }

    // Soft delete: não remove do banco, apenas oculta
    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        isDeleted: true,
      },
    });
  }

  // Retorna todas as avaliações ativas (não deletadas)
  async findAll() {
    return this.prisma.review.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Retorna avaliações de um usuário específico
  async findByUser(userId: number) {
    return this.prisma.review.findMany({
      where: { userId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Retorna avaliações de um item de mídia específico
  async findByMedia(mediaIds: { filmeId?: number; serieId?: number; livroId?: number; jogoId?: number }) {
    const { filmeId, serieId, livroId, jogoId } = mediaIds;
    return this.prisma.review.findMany({
      where: {
        filmeId,
        serieId,
        livroId,
        jogoId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
