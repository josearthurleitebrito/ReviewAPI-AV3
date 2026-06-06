// Resolver GraphQL de autenticação — expõe as mutations de login e registro
import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayload } from './auth-payload.type';
import { UserType } from '../User/user.type';
import { GqlAuthGuard } from './gql-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { LoginOAuthInput } from './dto/login-oauth.input';
import { ZodValidationPipe } from '../validation/zod.pipe';
import { RegisterSchema, LoginSchema, LoginOAuthSchema } from '../validation/schemas/auth.schemas';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  // Retorna os dados do usuário autenticado (requer JWT válido)
  @Query(() => UserType)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: any): Promise<UserType> {
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      createdAt: new Date(),
    };
  }

  // Cria uma nova conta e retorna o token JWT
  @Mutation(() => AuthPayload)
  async register(
    @Args('input', new ZodValidationPipe(RegisterSchema)) input: RegisterInput,
  ): Promise<AuthPayload> {
    return this.authService.register(input.name, input.email, input.password);
  }

  // Autentica com email e senha, retorna JWT
  @Mutation(() => AuthPayload)
  async login(
    @Args('input', new ZodValidationPipe(LoginSchema)) input: LoginInput,
  ): Promise<AuthPayload> {
    return this.authService.login(input.email, input.password);
  }

  // Autentica via token OAuth (Google), criando a conta se necessário
  @Mutation(() => AuthPayload)
  async loginOAuth(
    @Args('input', new ZodValidationPipe(LoginOAuthSchema)) input: LoginOAuthInput,
  ): Promise<AuthPayload> {
    return this.authService.loginOAuth(input.token, input.provider);
  }
}
