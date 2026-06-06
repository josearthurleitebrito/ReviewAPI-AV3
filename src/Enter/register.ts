// Caso de uso de registro — orquestra validação, hash de senha e criação do usuário
import { Email } from '../Shared/email';
import { Password } from '../Shared/password';
import { IUserRepository } from '../Interface/IUserRepository';
import { IHashProvider } from '../Interface/IHashProvider';
import { User } from '../User/user';

export class RegisterUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashProvider: IHashProvider,
  ) {
    this.userRepository = userRepository;
    this.hashProvider = hashProvider;
  }

  async registerUser(
    id: number,
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
  ): Promise<void> {
    // Valida que senha e confirmação são iguais
    if (password !== confirmPassword) {
      throw new Error('As senhas não coincidem');
    }

    if (!name) throw new Error('Nome é obrigatório');
    if (!email) throw new Error('E-mail é obrigatório');
    if (!password) throw new Error('Senha é obrigatória');

    // Instancia Value Objects — validam o formato internamente
    const emailVO = new Email(email);
    const passwordVO = new Password(password);

    // Gera o hash bcrypt antes de persistir
    const hashedPassword = this.hashProvider.hash(passwordVO.getValue());

    const user = new User(id, name, emailVO, hashedPassword);

    // eslint-disable-next-line @typescript-eslint/await-thenable
    await this.userRepository.createUser(user);
  }
}
