import { Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemIdParamSchema,
} from '../validators/cart.validator.js';

const router = Router();

router.get('/', authMiddleware, CartController.getCart);
router.post('/add', authMiddleware, validateBody(addToCartSchema), CartController.addToCart);
router.put('/update', authMiddleware, validateBody(updateCartItemSchema), CartController.updateCartItem);
router.delete('/remove/:itemId', authMiddleware, validateParams(cartItemIdParamSchema), CartController.removeFromCart);
router.delete('/clear', authMiddleware, CartController.clearCart);

export default router;
