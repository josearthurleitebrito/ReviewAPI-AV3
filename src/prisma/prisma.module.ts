// Módulo global do Prisma — disponibiliza o PrismaService para toda a aplicação sem precisar importar em cada módulo
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Torna o PrismaService acessível globalmente sem importar o módulo individualmente
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
