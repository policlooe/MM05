import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = Router();

// CRITICAL: This route receives raw body from app.ts
router.post('/', WebhookController.handleStripeWebhook);

export default router;
