// DTO de entrada para login via OAuth — token do provedor e nome do provedor (ex: "google")
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginOAuthInput {
  @Field()
  token: string; // Token retornado pelo provedor OAuth (Google, etc.)

  @Field()
  provider: string; // Nome do provedor: "google"
}
