// Implementação do IHashProvider usando bcrypt — faz hash e comparação de senhas
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IHashProvider } from '../Interface/IHashProvider';
import { Password } from './password';

@Injectable()
export class BcryptHashProvider implements IHashProvider {
  // Compara uma senha em texto puro com o hash armazenado no banco
  compareHash(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  }

  // Gera um hash bcrypt com salt de custo 10 e retorna como Value Object Password
  hash(password: string): Password {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return new Password(hash);
  }
}
