import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { prisma } from '../lib/prisma.js';

const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const updateCartSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export class CartController {
  static async getCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      }

      const total = cart.items.reduce((sum: number, item: any) => {
        return sum + (item.product.price.toNumber() * item.quantity);
      }, 0);

      res.json({
        success: true,
        data: {
          ...cart,
          total,
        },
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch cart',
      });
    }
  }

  static async addToCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { productId, quantity } = addToCartSchema.parse(req.body);

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          error: 'Product not found',
        });
        return;
      }

      if (product.stockQuantity < quantity) {
        res.status(400).json({
          success: false,
          error: 'Insufficient stock',
        });
        return;
      }

      let cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
        });
      }

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }

      const updatedCart = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Product added to cart',
        data: updatedCart,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add to cart',
      });
    }
  }

  static async updateCartItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { itemId, quantity } = updateCartSchema.parse(req.body);

      const cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        res.status(404).json({
          success: false,
          error: 'Cart not found',
        });
        return;
      }

      const item = await prisma.cartItem.findFirst({
        where: {
          id: itemId,
          cartId: cart.id,
        },
        include: {
          product: true,
        },
      });

      if (!item) {
        res.status(404).json({
          success: false,
          error: 'Cart item not found',
        });
        return;
      }

      if (item.product.stockQuantity < quantity) {
        res.status(400).json({
          success: false,
          error: 'Insufficient stock',
        });
        return;
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });

      const updatedCart = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Cart updated',
        data: updatedCart,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update cart',
      });
    }
  }

  static async removeFromCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { itemId } = req.params;

      const cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        res.status(404).json({
          success: false,
          error: 'Cart not found',
        });
        return;
      }

      await prisma.cartItem.delete({
        where: {
          id: itemId as string,
        },
      });

      const updatedCart = await prisma.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Item removed from cart',
        data: updatedCart,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove from cart',
      });
    }
  }

  static async clearCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const cart = await prisma.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        res.status(404).json({
          success: false,
          error: 'Cart not found',
        });
        return;
      }

      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      res.json({
        success: true,
        message: 'Cart cleared',
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear cart',
      });
    }
  }
}
