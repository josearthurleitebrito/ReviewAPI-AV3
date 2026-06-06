// Módulo raiz da aplicação — registra todos os módulos do sistema
import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrismaModule } from './prisma/prisma.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { AuthModule } from './Auth/auth.module';
import { MoviesModule } from './Movie/moviesModule';
import { SeriesModule } from './Serie/series.module';
import { BookModule } from './Book/bookModule';
import { GamesModule } from './Game/gamesModule';
import { ReviewModule } from './Review/review.module';
import { CatalogModule } from './Catalog/catalog.module';

@Module({
  imports: [
    // Carrega variáveis de ambiente do .env globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Configura o GraphQL com Apollo — gera o schema automaticamente
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true, // Interface interativa disponível em /graphql
    }),

    PrismaModule,    // Conexão com o banco PostgreSQL via Prisma
    RabbitMQModule,  // Mensageria para eventos assíncronos
    AuthModule,      // Autenticação JWT e OAuth
    MoviesModule,    // CRUD de filmes
    SeriesModule,    // CRUD de séries
    BookModule,      // CRUD de livros
    GamesModule,     // CRUD de jogos
    ReviewModule,    // Avaliações dos usuários
    CatalogModule,   // Sincronização do catálogo com APIs externas
  ],
})
export class AppModule {}
