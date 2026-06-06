// Decorator que extrai o usuário autenticado do contexto GraphQL
// Usado nos resolvers como: @CurrentUser() user: any
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    // req.user é preenchido pela JwtStrategy após validar o token
    return ctx.getContext().req.user;
  },
);
