// Serviço de autenticação — lida com registro, login e OAuth
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaUserRepository } from '../User/prisma-user.repository';
import { BcryptHashProvider } from '../Shared/bcrypt-hash.provider';
import { RegisterUseCase } from '../Enter/register';
import { AuthPayload } from './auth-payload.type';
import { User } from '../User/user';
import { Email } from '../Shared/email';
import { Password } from '../Shared/password';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: PrismaUserRepository,
    private hashProvider: BcryptHashProvider,
    private jwtService: JwtService,
  ) {}

  // Cria um novo usuário e retorna o token JWT
  async register(name: string, email: string, password: string): Promise<AuthPayload> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email já cadastrado');
    }

    const registerUseCase = new RegisterUseCase(this.userRepository, this.hashProvider);
    await registerUseCase.registerUser(0, email, password, password, name);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Falha ao criar usuário');
    }

    const accessToken = this.jwtService.sign({ sub: user.getId(), email: user.getEmail().getValue() });

    return {
      accessToken,
      user: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        createdAt: new Date(),
      },
    };
  }

  // Valida email/senha e retorna o token JWT
  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isMatch = this.hashProvider.compareHash(password, user.getPassword().getValue());
    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const accessToken = this.jwtService.sign({ sub: user.getId(), email: user.getEmail().getValue() });

    return {
      accessToken,
      user: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        createdAt: new Date(),
      },
    };
  }

  // Autentica via token Google OAuth — cria conta automaticamente se não existir
  async loginOAuth(token: string, provider: string): Promise<AuthPayload> {
    let email = '';
    let name = '';

    if (token.startsWith('mock_google_token_')) {
      // Fluxo mock para testes locais sem Google OAuth real
      email = token.replace('mock_google_token_', '');
      name = email.split('@')[0];
      name = name.charAt(0).toUpperCase() + name.slice(1);
    } else {
      // Fluxo real: valida o token com a API do Google
      try {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        if (!response.ok) {
          throw new UnauthorizedException('Token OAuth inválido');
        }
        const data = await response.json();
        email = data.email;
        name = data.name || data.given_name || email.split('@')[0];
      } catch (err) {
        throw new UnauthorizedException('Validação OAuth falhou: ' + err.message);
      }
    }

    if (!email) {
      throw new BadRequestException('Email não fornecido pelo provedor OAuth');
    }

    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Registra o usuário OAuth com senha aleatória (não será usada para login direto)
      const randomPassword = Math.random().toString(36).slice(-8) + 'A';
      const registerUseCase = new RegisterUseCase(this.userRepository, this.hashProvider);
      await registerUseCase.registerUser(0, email, randomPassword, randomPassword, name);
      user = await this.userRepository.findByEmail(email);
    }

    if (!user) {
      throw new UnauthorizedException('Falha na autenticação');
    }

    const accessToken = this.jwtService.sign({ sub: user.getId(), email: user.getEmail().getValue() });

    return {
      accessToken,
      user: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail().getValue(),
        createdAt: new Date(),
      },
    };
  }
}
