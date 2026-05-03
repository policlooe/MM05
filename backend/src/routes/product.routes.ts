import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', authMiddleware, adminMiddleware, ProductController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, ProductController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, ProductController.deleteProduct);

export default router;
