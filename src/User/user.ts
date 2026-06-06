// Entidade de domínio do usuário — contém apenas os dados e comportamentos essenciais
import { Email } from '../Shared/email';
import { Password } from '../Shared/password';

export class User {
  constructor(
    private readonly id: number,
    private name: string,
    private email: Email,
    private password: Password,
  ) {
    this.validateName(name);
  }

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
  }

  // Troca a senha — exige que seja diferente da atual
  changePassword(newPassword: Password): void {
    if (newPassword === this.password) {
      throw new Error('A nova senha deve ser diferente da atual.');
    }
    this.password = newPassword;
  }

  // Atualiza o nome com validação
  changeName(newName: string): void {
    this.validateName(newName);
    this.name = newName;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('O nome não pode ser vazio.');
    }
  }
}
