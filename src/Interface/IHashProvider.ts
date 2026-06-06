// Interface para o provedor de hash — implementada pelo BcryptHashProvider
import { Password } from '../Shared/password';

export interface IHashProvider {
  compareHash(password: string, hashedPassword: string): boolean;
  hash(password: string): Password;
}
