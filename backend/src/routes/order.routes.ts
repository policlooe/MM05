import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { OrderCreateController } from '../controllers/order.create.controller.js';
import { InvoiceController } from '../controllers/invoice.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
  orderPaginationSchema,
} from '../validators/order.validator.js';

const router = Router();

// Создание заказа (доступно всем, включая гостей)
router.post('/', validateBody(createOrderSchema), OrderCreateController.createOrder);

// Получение заказов пользователя (требует авторизации)
router.get('/', authMiddleware, validateQuery(orderPaginationSchema), OrderController.getUserOrders);
router.get('/:id', authMiddleware, validateParams(orderIdParamSchema), OrderController.getOrderById);

// Накладная (доступна всем по ID заказа)
router.get('/:id/invoice', validateParams(orderIdParamSchema), InvoiceController.generateInvoiceHTML);

// Админские роуты
router.get('/admin/all', authMiddleware, adminMiddleware, validateQuery(orderPaginationSchema), OrderController.getAllOrders);
router.patch('/:id/status', authMiddleware, adminMiddleware, validateParams(orderIdParamSchema), validateBody(updateOrderStatusSchema), OrderController.updateOrderStatus);

export default router;
