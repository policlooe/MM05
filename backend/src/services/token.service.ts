import crypto from 'crypto';
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

/**
 * Refresh-токены хранятся в БД только в виде SHA-256 хэша:
 * утечка БД не даёт пригодных для использования токенов.
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

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
   * Сохранение refresh токена в БД (только хэш)
   */
  static async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

    // Периодическая фоновая очистка истёкших токенов (5% запросов)
    if (Math.random() < 0.05) {
      void this.cleanExpiredTokens().catch(() => undefined);
    }

    return await prisma.refreshToken.create({
      data: {
        userId,
        token: hashToken(token),
        expiresAt,
      },
    });
  }

  /**
   * Ротация refresh токена: старый инвалидируется, выдаётся новый.
   * Возвращает payload пользователя и сырой новый refresh-токен.
   */
  static async rotateRefreshToken(
    oldToken: string,
    payload: TokenPayload
  ): Promise<{ refreshToken: string; expiresAt: Date }> {
    const tokenHash = hashToken(oldToken);

    return await prisma.$transaction(async (tx) => {
      const existing = await tx.refreshToken.findUnique({
        where: { token: tokenHash },
        select: { id: true, userId: true, expiresAt: true },
      });

      if (!existing || existing.userId !== payload.userId) {
        throw new Error('Invalid refresh token');
      }

      if (existing.expiresAt < new Date()) {
        await tx.refreshToken.delete({ where: { id: existing.id } });
        throw new Error('Refresh token expired');
      }

      const newRefreshToken = this.generateRefreshToken(payload);
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      await tx.refreshToken.update({
        where: { id: existing.id },
        data: {
          token: hashToken(newRefreshToken),
          expiresAt: newExpiresAt,
        },
      });

      return { refreshToken: newRefreshToken, expiresAt: newExpiresAt };
    });
  }

  /**
   * Удаление refresh токена
   */
  static async removeRefreshToken(token: string) {
    return await prisma.refreshToken.deleteMany({
      where: { token: hashToken(token) },
    });
  }

  /**
   * Проверка существования refresh токена
   */
  static async findRefreshToken(token: string) {
    return await prisma.refreshToken.findUnique({
      where: { token: hashToken(token) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            role: true,
          },
        },
      },
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
