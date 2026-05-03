import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create-session', authMiddleware, CheckoutController.createCheckoutSession);

export default router;
