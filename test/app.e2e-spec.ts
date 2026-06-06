// Teste end-to-end básico gerado pelo NestJS CLI
// Verifica se a aplicação sobe e responde na rota raiz
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  // Cria uma instância da aplicação antes de cada teste
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Teste básico: GET / deve retornar 200 com "Hello World!"
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // Fecha a aplicação após cada teste para liberar recursos
  afterEach(async () => {
    await app.close();
  });
});
