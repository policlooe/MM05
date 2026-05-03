import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.middleware.js';
import { validate, registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator.js';

const router = Router();

// Регистрация
router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  AuthController.register
);

// Логин
router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  AuthController.login
);

// Обновление токена
router.post(
  '/refresh',
  validate(refreshSchema),
  AuthController.refresh
);

// Выход
router.post(
  '/logout',
  AuthController.logout
);

// Получение текущего пользователя
router.get(
  '/me',
  authMiddleware,
  AuthController.getCurrentUser
);

export default router;
