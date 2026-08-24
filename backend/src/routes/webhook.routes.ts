import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';

const router = Router();

// CRITICAL: This route receives raw body from app.ts
router.post('/', WebhookController.handleStripeWebhook);

// Вебхук ЮKassa (тоже raw body из app.ts)
router.post('/yookassa', WebhookController.handleYookassaWebhook);

export default router;
