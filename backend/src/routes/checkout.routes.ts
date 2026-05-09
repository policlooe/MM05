import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { createCheckoutSessionSchema } from '../validators/checkout.validator.js';

const router = Router();

router.post('/create-session', authMiddleware, validateBody(createCheckoutSessionSchema), CheckoutController.createCheckoutSession);

export default router;
