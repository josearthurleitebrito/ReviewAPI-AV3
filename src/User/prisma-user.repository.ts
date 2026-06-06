import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from '../Interface/IUserRepository';
import { User } from './user';
import { Email } from '../Shared/email';
import { Password } from '../Shared/password';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(user: User): Promise<void> {
    await this.prisma.user.create({
      data: {
        name: user.getName(),
        email: user.getEmail().getValue(),
        password: user.getPassword().getValue(),
      },
    });
  }

  async deleteUser(userId: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  }

  async updateUserEmail(userId: number, newEmail: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });
  }

  // Extra helper methods needed for Authentication flow
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;

    return new User(
      user.id,
      user.name,
      new Email(user.email),
      new Password(user.password),
    );
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;

    return new User(
      user.id,
      user.name,
      new Email(user.email),
      new Password(user.password),
    );
  }
}
