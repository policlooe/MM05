import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { OrderCreateController } from '../controllers/order.create.controller.js';
import { InvoiceController } from '../controllers/invoice.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Создание заказа (доступно всем, включая гостей)
router.post('/', OrderCreateController.createOrder);

// Получение заказов пользователя (требует авторизации)
router.get('/', authMiddleware, OrderController.getUserOrders);
router.get('/:id', authMiddleware, OrderController.getOrderById);

// Накладная (доступна всем по ID заказа)
router.get('/:id/invoice', InvoiceController.generateInvoiceHTML);

// Админские роуты
router.get('/admin/all', authMiddleware, adminMiddleware, OrderController.getAllOrders);
router.patch('/:id/status', authMiddleware, adminMiddleware, OrderController.updateOrderStatus);

export default router;
