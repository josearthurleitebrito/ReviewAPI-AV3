// Estratégia JWT do Passport — valida o token e carrega o usuário no contexto da requisição
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaUserRepository } from '../User/prisma-user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userRepository: PrismaUserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Lê o token do header Authorization
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
    });
  }

  // Chamado automaticamente após a assinatura ser verificada
  // Retorna o User que será injetado pelo @CurrentUser() nos resolvers
  async validate(payload: any) {
    const user = await this.userRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
