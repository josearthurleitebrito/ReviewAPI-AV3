// Interface do repositório de usuários — implementada pelo PrismaUserRepository
import { User } from '../User/user';

export interface IUserRepository {
  createUser(user: User): void;
  deleteUser(userId: number): void;
  updateUserPassword(userId: number, newPassword: string): void;
  updateUserEmail(userId: number, newEmail: string): void;
}
