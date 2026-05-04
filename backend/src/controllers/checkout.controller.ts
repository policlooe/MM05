import { Response } from 'express';
import { PrismaClient, PaymentStatus, OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { AuthRequest } from '../middleware/auth.middleware.js';

const prisma = new PrismaClient();

// Инициализируем Stripe только если есть валидный ключ
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey && stripeKey.startsWith('sk_') 
  ? new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })
  : null;

export class CheckoutController {
  static async createCheckoutSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Проверяем, что Stripe настроен
      if (!stripe) {
        res.status(503).json({
          success: false,
          error: 'Payment system is not configured. Please add valid Stripe keys to .env',
        });
        return;
      }

      const userId = req.user!.userId;

      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Cart is empty',
        });
        return;
      }

      // Check stock availability
      for (const item of cart.items) {
        if (item.product.stockQuantity < item.quantity) {
          res.status(400).json({
            success: false,
            error: `Insufficient stock for ${item.product.name}`,
          });
          return;
        }
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Calculate totals
      const subtotal = cart.items.reduce((sum: number, item: any) => {
        return sum + (item.product.price.toNumber() * item.quantity);
      }, 0);

      const deliveryCost = 0; // Add delivery calculation logic
      const discount = 0; // Add discount logic
      const total = subtotal + deliveryCost - discount;

      // Generate order number
      const orderNumber = `MM05-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order
      const order = await prisma.order.create({
        data: {
          userId,
          orderNumber,
          status: OrderStatus.NEW,
          paymentStatus: PaymentStatus.PENDING,
          subtotal,
          deliveryCost,
          discount,
          total,
          customerName: user.fullName || user.email,
          customerEmail: user.email,
          customerPhone: user.phone || '',
          deliveryAddress: 'Адрес не указан',
        },
      });

      // Create order items
      await Promise.all(
        cart.items.map((item: any) =>
          prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.product.id,
              productSnapshot: item.product as any,
              quantity: item.quantity,
              price: item.product.price,
              total: item.product.price.toNumber() * item.quantity,
            },
          })
        )
      );

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cart.items.map((item: any) => ({
          price_data: {
            currency: 'rub',
            product_data: {
              name: item.product.name,
              description: item.product.shortDescription || undefined,
              images: item.product.thumbnailUrl ? [item.product.thumbnailUrl] : undefined,
            },
            unit_amount: Math.round(item.product.price.toNumber() * 100),
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        customer_email: user.email,
        metadata: {
          orderId: order.id,
          userId: user.id,
        },
      });

      // Update order with Stripe session ID
      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });

      // Clear cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      });
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create checkout session',
      });
    }
  }
}
