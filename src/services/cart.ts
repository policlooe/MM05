import api from './api';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbnailUrl: string | null;
    shortDescription: string | null;
    stockQuantity: number;
  };
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
  total: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  itemId: string;
  quantity: number;
}

export const cartService = {
  /**
   * Get user cart
   */
  async getCart(): Promise<{ success: boolean; data: Cart }> {
    const { data } = await api.get('/cart');
    return data;
  },

  /**
   * Add product to cart
   */
  async addToCart(productId: string, quantity: number = 1): Promise<{ success: boolean; data: Cart }> {
    const { data } = await api.post('/cart/add', { productId, quantity });
    return data;
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId: string, quantity: number): Promise<{ success: boolean; data: Cart }> {
    const { data } = await api.put('/cart/update', { itemId, quantity });
    return data;
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<{ success: boolean; data: Cart }> {
    const { data } = await api.delete(`/cart/remove/${itemId}`);
    return data;
  },

  /**
   * Clear cart
   */
  async clearCart(): Promise<{ success: boolean }> {
    const { data } = await api.delete('/cart/clear');
    return data;
  },
};
