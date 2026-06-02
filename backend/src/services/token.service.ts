import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

// Fail-fast: JWT secrets are required
if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error('CRITICAL: JWT_ACCESS_SECRET environment variable is not set. Application cannot start without it.');
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('CRITICAL: JWT_REFRESH_SECRET environment variable is not set. Application cannot start without it.');
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class TokenService {
  /**
   * Генерация access токена
   */
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Генерация refresh токена
   */
  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Генерация пары токенов
   */
  static generateTokenPair(payload: TokenPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Верификация access токена
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Верификация refresh токена
   */
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Сохранение refresh токена в БД
   */
  static async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    return await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Удаление refresh токена
   */
  static async removeRefreshToken(token: string) {
    return await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  /**
   * Проверка существования refresh токена
   */
  static async findRefreshToken(token: string) {
    return await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Удаление всех refresh токенов пользователя
   */
  static async removeAllUserTokens(userId: string) {
    return await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Очистка истекших токенов
   */
  static async cleanExpiredTokens() {
    return await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
