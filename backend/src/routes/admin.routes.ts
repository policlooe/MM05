import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Все роуты требуют аутентификации и роль ADMIN
router.use(authMiddleware, adminMiddleware);

// Товары
router.get('/products', AdminController.getAllProducts);
router.post('/products', AdminController.createProduct);
router.put('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Заказы
router.get('/orders', AdminController.getAllOrders);
router.put('/orders/:id/status', AdminController.updateOrderStatus);

// Пользователи
router.get('/users', AdminController.getAllUsers);

// Статистика
router.get('/stats', AdminController.getStats);

export default router;
