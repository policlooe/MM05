import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service.js';

// JWT Payload interface
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Extended Request with user
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Расширение типа Request для добавления user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware для проверки JWT токена
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Получение токена из заголовка
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Authorization header is missing',
      });
      return;
    }

    // Проверка формата "Bearer <token>"
    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      res.status(401).json({
        error: 'Invalid authorization format. Use: Bearer <token>',
      });
      return;
    }

    // Верификация токена
    const payload = TokenService.verifyAccessToken(token);

    // Добавление данных пользователя в request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      error: 'Invalid or expired token',
      message: error.message,
    });
  }
};

/**
 * Middleware для проверки роли администратора
 */
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      error: 'Access denied. Admin role required.',
    });
    return;
  }

  next();
};

/**
 * Опциональная аутентификация (не требует токен, но добавляет user если есть)
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const [bearer, token] = authHeader.split(' ');

      if (bearer === 'Bearer' && token) {
        const payload = TokenService.verifyAccessToken(token);
        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        };
      }
    }

    next();
  } catch (error) {
    // Игнорируем ошибки для опциональной аутентификации
    next();
  }
};
