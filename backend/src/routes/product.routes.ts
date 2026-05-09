import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productPaginationSchema,
} from '../validators/product.validator.js';

const router = Router();

router.get('/', validateQuery(productPaginationSchema), ProductController.getAllProducts);
router.get('/:id', validateParams(productIdParamSchema), ProductController.getProductById);
router.post('/', authMiddleware, adminMiddleware, validateBody(createProductSchema), ProductController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, validateParams(productIdParamSchema), validateBody(updateProductSchema), ProductController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, validateParams(productIdParamSchema), ProductController.deleteProduct);

export default router;
