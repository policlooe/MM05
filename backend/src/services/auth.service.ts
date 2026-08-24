import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
import { TokenService } from './token.service.js';
import { prisma } from '../lib/prisma.js';

export interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  static async register(data: RegisterData) {
    const { email, password, fullName, phone } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        role: UserRole.USER,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = TokenService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await TokenService.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  static async login(data: LoginData) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = TokenService.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await TokenService.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  static async refresh(refreshToken: string) {
    const payload = TokenService.verifyRefreshToken(refreshToken);

    // Ротация: старый refresh инвалидируется, выдаётся новая пара токенов
    const rotated = await TokenService.rotateRefreshToken(refreshToken, {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    const accessToken = TokenService.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    return { accessToken, refreshToken: rotated.refreshToken };
  }

  static async logout(refreshToken: string) {
    if (refreshToken) {
      await TokenService.removeRefreshToken(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
