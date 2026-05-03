import { Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, CartController.getCart);
router.post('/add', authMiddleware, CartController.addToCart);
router.put('/update', authMiddleware, CartController.updateCartItem);
router.delete('/remove/:itemId', authMiddleware, CartController.removeFromCart);
router.delete('/clear', authMiddleware, CartController.clearCart);

export default router;
