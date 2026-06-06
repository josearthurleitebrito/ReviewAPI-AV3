// Módulo de jogos — registra o serviço e o resolver de jogos
import { Module } from '@nestjs/common';
import { GamesService } from './gamesService';
import { GamesResolver } from './gamesResolver';

@Module({
  providers: [GamesService, GamesResolver],
  exports: [GamesService],
})
export class GamesModule {}
