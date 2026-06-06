// Módulo de autenticação — agrupa JWT, Passport, estratégia e repositório de usuários
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';
import { PrismaUserRepository } from '../User/prisma-user.repository';
import { BcryptHashProvider } from '../Shared/bcrypt-hash.provider';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JWT com expiração de 7 dias — segredo lido do .env
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,          // Valida tokens nas requisições protegidas
    PrismaUserRepository, // Acesso ao banco para operações de usuário
    BcryptHashProvider,   // Hash e comparação de senhas
  ],
  exports: [AuthService, JwtStrategy, PrismaUserRepository, BcryptHashProvider, PassportModule],
})
export class AuthModule {}
