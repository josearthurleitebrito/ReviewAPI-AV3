// Módulo de filmes — registra o serviço e o resolver de filmes//
import { Module } from '@nestjs/common';
import { MoviesService } from './moviesService';
import { MoviesResolver } from './moviesResolver';

@Module({
  providers: [MoviesService, MoviesResolver],
  exports: [MoviesService],
})
export class MoviesModule {}
