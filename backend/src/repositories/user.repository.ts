import { PrismaClient, User, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName?: string;
  phone?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  fullName?: string;
  phone?: string;
  role?: UserRole;
  lastLoginAt?: Date;
}

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  async findAll(skip: number = 0, take: number = 50): Promise<{ users: User[]; total: number }> {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return { users, total };
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}

export const userRepository = new UserRepository();
