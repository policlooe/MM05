import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator.js';

const router = Router();

// Регистрация
router.post(
  '/register',
  registerLimiter,
  validateBody(registerSchema),
  AuthController.register
);

// Логин
router.post(
  '/login',
  loginLimiter,
  validateBody(loginSchema),
  AuthController.login
);

// Обновление токена
router.post(
  '/refresh',
  validateBody(refreshSchema),
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
