/**
 * Cart API
 * Операции с корзиной покупок
 */

import { supabase, handleSupabaseError } from '../client';
import type { Database } from '../types';

type CartItem = Database['public']['Tables']['cart_items']['Row'];
type CartItemInsert = Database['public']['Tables']['cart_items']['Insert'];

/**
 * Получить корзину текущего пользователя
 */
export async function getCart() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Необходима авторизация');

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          id,
          name,
          slug,
          price,
          old_price,
          thumbnail_url,
          stock_quantity,
          is_active
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Добавить товар в корзину
 */
export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Необходима авторизация');

    // Проверяем наличие товара
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('price, stock_quantity, is_active')
      .eq('id', productId)
      .single();

    if (productError) throw productError;
    if (!product.is_active) throw new Error('Товар недоступен');
    if (product.stock_quantity < quantity) {
      throw new Error('Недостаточно товара на складе');
    }

    // Проверяем, есть ли товар уже в корзине
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Обновляем количество
      const newQuantity = existing.quantity + quantity;
      if (product.stock_quantity < newQuantity) {
        throw new Error('Недостаточно товара на складе');
      }

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      // Добавляем новый товар
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
          price_at_add: product.price,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Обновить количество товара в корзине
 */
export async function updateCartItem(cartItemId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      return await removeFromCart(cartItemId);
    }

    // Проверяем наличие на складе
    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('product_id')
      .eq('id', cartItemId)
      .single();

    if (cartItem) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', cartItem.product_id)
        .single();

      if (product && product.stock_quantity < quantity) {
        throw new Error('Недостаточно товара на складе');
      }
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Удалить товар из корзины
 */
export async function removeFromCart(cartItemId: string) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: handleSupabaseError(error) };
  }
}

/**
 * Очистить всю корзину
 */
export async function clearCart() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Необходима авторизация');

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: handleSupabaseError(error) };
  }
}

/**
 * Получить количество товаров в корзине
 */
export async function getCartCount() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { count: 0, error: null };

    const { count, error } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    return { count: 0, error: handleSupabaseError(error) };
  }
}

/**
 * Получить общую сумму корзины
 */
export async function getCartTotal() {
  try {
    const { data: cart, error } = await getCart();
    if (error || !cart) return { total: 0, error };

    const total = cart.reduce((sum, item) => {
      const price = item.product?.price || item.price_at_add;
      return sum + (price * item.quantity);
    }, 0);

    return { total, error: null };
  } catch (error) {
    return { total: 0, error: handleSupabaseError(error) };
  }
}
