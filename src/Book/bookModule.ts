// Módulo de livros — registra o serviço e o resolver de livros
import { Module } from '@nestjs/common';
import { BookService } from './bookService';
import { BookResolver } from './bookResolver';

@Module({
  providers: [BookService, BookResolver],
  exports: [BookService],
})
export class BookModule {}
