// DTO de entrada para a mutation register — define os campos obrigatórios do cadastro
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
