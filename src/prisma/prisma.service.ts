// Serviço responsável pela conexão com o banco de dados via Prisma ORM
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Abre a conexão quando o módulo é inicializado
  async onModuleInit() {
    await this.$connect();
  }

  // Fecha a conexão quando a aplicação é encerrada
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
