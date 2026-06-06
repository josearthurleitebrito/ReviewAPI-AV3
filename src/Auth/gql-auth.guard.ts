// Guard de autenticação para GraphQL — protege mutations e queries que requerem JWT
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  // Sobrescreve o método para extrair o request do contexto GraphQL
  // (o Passport espera um HTTP request padrão, mas no GraphQL ele fica aninhado)
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
