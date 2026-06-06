// Serviço de filmes — operações de leitura e criação no banco//
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  // Retorna todos os filmes ordenados por título
  async findAll() {
    return this.prisma.filme.findMany({
      orderBy: { titulo: 'asc' },
    });
  }

  // Busca um filme específico pelo ID
  async findById(id: number) {
    return this.prisma.filme.findUnique({
      where: { id },
    });
  }

  // Cria um novo filme no banco de dados
  async create(titulo: string, sinopse: string | undefined, externalId: string) {
    return this.prisma.filme.create({
      data: {
        titulo,
        sinopse,
        externalId,
      },
    });
  }
}
