import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware.js';
import {
  createCheckoutSessionSchema,
  sessionIdParamSchema,
  createRefundSchema,
} from '../validators/payment.validator.js';

const router = Router();

/**
 * @route   POST /api/payment/create-checkout-session
 * @desc    Create Stripe checkout session
 * @access  Private
 */
router.post(
  '/create-checkout-session',
  optionalAuthMiddleware,
  validateBody(createCheckoutSessionSchema),
  (req, res, next) => paymentController.createCheckoutSession(req, res, next)
);

/**
 * @route   GET /api/payment/session/:sessionId
 * @desc    Get checkout session status
 * @access  Private
 */
router.get(
  '/session/:sessionId',
  authMiddleware,
  validateParams(sessionIdParamSchema),
  (req, res, next) => paymentController.getSessionStatus(req, res, next)
);

/**
 * @route   POST /api/payment/refund
 * @desc    Create refund for an order
 * @access  Private (Admin only)
 */
router.post(
  '/refund',
  authMiddleware,
  adminMiddleware,
  validateBody(createRefundSchema),
  (req, res, next) => paymentController.createRefund(req, res, next)
);

export default router;
