// Serviço de séries — operações de leitura e criação no banco//
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeriesService {
  constructor(private prisma: PrismaService) {}

  // Retorna todas as séries ordenadas por título
  async findAll() {
    return this.prisma.serie.findMany({
      orderBy: { titulo: 'asc' },
    });
  }

  // Busca uma série específica pelo ID
  async findById(id: number) {
    return this.prisma.serie.findUnique({
      where: { id },
    });
  }

  // Cria uma nova série no banco de dados
  async create(titulo: string, sinopse: string | undefined, externalId: string) {
    return this.prisma.serie.create({
      data: {
        titulo,
        sinopse,
        externalId,
      },
    });
  }
}
