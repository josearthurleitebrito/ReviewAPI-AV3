// Serviço de livros — operações de leitura e criação no banco//
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  // Retorna todos os livros ordenados por título
  async findAll() {
    return this.prisma.livro.findMany({
      orderBy: { titulo: 'asc' },
    });
  }

  // Busca um livro específico pelo ID
  async findById(id: number) {
    return this.prisma.livro.findUnique({
      where: { id },
    });
  }

  // Cria um novo livro no banco de dados
  async create(titulo: string, autor: string | undefined, externalId: string) {
    return this.prisma.livro.create({
      data: {
        titulo,
        autor,
        externalId,
      },
    });
  }
}
