// Serviço de jogos — operações de leitura e criação no banco//
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  // Retorna todos os jogos ordenados por título
  async findAll() {
    return this.prisma.jogo.findMany({
      orderBy: { titulo: 'asc' },
    });
  }

  // Busca um jogo específico pelo ID
  async findById(id: number) {
    return this.prisma.jogo.findUnique({
      where: { id },
    });
  }

  // Cria um novo jogo no banco de dados
  async create(titulo: string, desenvolvedora: string | undefined, externalId: string) {
    return this.prisma.jogo.create({
      data: {
        titulo,
        desenvolvedora,
        externalId,
      },
    });
  }
}
