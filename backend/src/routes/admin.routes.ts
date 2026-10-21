import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware.js';
import { idParamSchema, paginationSchema, statsQuerySchema, ordersQuerySchema, productsQuerySchema } from '../validators/admin.validator.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';
import { updateOrderStatusSchema } from '../validators/order.validator.js';

const router = Router();

// Все роуты требуют аутентификации и роль ADMIN
router.use(authMiddleware, adminMiddleware);

// Товары
router.get('/products', validateQuery(productsQuerySchema), AdminController.getAllProducts);
router.get('/products/:id', validateParams(idParamSchema), AdminController.getProductById);
router.post('/products', validateBody(createProductSchema), AdminController.createProduct);
router.put('/products/:id', validateParams(idParamSchema), validateBody(updateProductSchema), AdminController.updateProduct);
router.delete('/products/:id', validateParams(idParamSchema), AdminController.deleteProduct);

// Категории (справочник для формы товара)
router.get('/categories', AdminController.getCategories);

// Заказы
router.get('/orders', validateQuery(ordersQuerySchema), AdminController.getAllOrders);
router.get('/orders/:id', validateParams(idParamSchema), AdminController.getOrderById);
router.put('/orders/:id/status', validateParams(idParamSchema), validateBody(updateOrderStatusSchema), AdminController.updateOrderStatus);

// Пользователи
router.get('/users', validateQuery(paginationSchema), AdminController.getAllUsers);

// Статистика
router.get('/stats', validateQuery(statsQuerySchema), AdminController.getStats);

export default router;
