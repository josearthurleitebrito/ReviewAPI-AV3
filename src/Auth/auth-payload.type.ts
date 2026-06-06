// Tipo de retorno das mutations de autenticação — contém o token JWT e os dados do usuário
import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from '../User/user.type';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string; // Token JWT para ser enviado nas requisições protegidas feitas pelo usuário

  @Field(() => UserType)
  user: UserType; // Dados básicos do usuário autenticado
}
