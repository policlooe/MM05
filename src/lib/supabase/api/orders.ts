/**
 * Orders API
 * Операции с заказами
 */

import { supabase, handleSupabaseError } from '../client';
import { clearCart } from './cart';
import type { Database } from '../types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export interface CreateOrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    city: string;
    street: string;
    building: string;
    apartment?: string;
    postalCode?: string;
    comment?: string;
  };
  customerNote?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  deliveryCost: number;
  discount?: number;
}

/**
 * Создать заказ
 */
export async function createOrder(orderData: CreateOrderData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Необходима авторизация');

    // Рассчитываем суммы
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const total = subtotal + orderData.deliveryCost - (orderData.discount || 0);

    // Создаем заказ
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        payment_status: 'pending',
        subtotal,
        delivery_cost: orderData.deliveryCost,
        discount: orderData.discount || 0,
        total,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        delivery_address: orderData.deliveryAddress,
        customer_note: orderData.customerNote,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Создаем позиции заказа
    const orderItems = await Promise.all(
      orderData.items.map(async (item) => {
        // Получаем снимок товара
        const { data: product } = await supabase
          .from('products')
          .select('name, slug, thumbnail_url, specifications')
          .eq('id', item.productId)
          .single();

        return {
          order_id: order.id,
          product_id: item.productId,
          product_snapshot: {
            name: product?.name,
            slug: product?.slug,
            image: product?.thumbnail_url,
            specifications: product?.specifications,
          },
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        };
      })
    );

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Обновляем количество продаж товаров
    await Promise.all(
      orderData.items.map((item) =>
        supabase.rpc('increment_sales_count', {
          product_id: item.productId,
          amount: item.quantity,
        })
      )
    );

    // Уменьшаем количество на складе
    await Promise.all(
      orderData.items.map((item) =>
        supabase.rpc('decrement_stock', {
          product_id: item.productId,
          amount: item.quantity,
        })
      )
    );

    // Очищаем корзину
    await clearCart();

    return { data: order, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Получить заказы текущего пользователя
 */
export async function getMyOrders() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Необходима авторизация');

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(id, name, slug, thumbnail_url)
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
 * Получить заказ по ID
 */
export async function getOrderById(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(id, name, slug, thumbnail_url)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Получить заказ по номеру
 */
export async function getOrderByNumber(orderNumber: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(id, name, slug, thumbnail_url)
        )
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Отменить заказ (только в статусе pending)
 */
export async function cancelOrder(orderId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Необходима авторизация');

    // Проверяем, что заказ принадлежит пользователю и в статусе pending
    const { data: order } = await supabase
      .from('orders')
      .select('status, user_id')
      .eq('id', orderId)
      .single();

    if (!order) throw new Error('Заказ не найден');
    if (order.user_id !== user.id) throw new Error('Нет доступа к заказу');
    if (order.status !== 'pending') {
      throw new Error('Можно отменить только заказы в статусе "Ожидает подтверждения"');
    }

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Возвращаем товары на склад
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    if (items) {
      await Promise.all(
        items.map((item) =>
          supabase.rpc('increment_stock', {
            product_id: item.product_id,
            amount: item.quantity,
          })
        )
      );
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Обновить статус заказа (только для админов)
 */
export async function updateOrderStatus(
  orderId: string,
  status: Database['public']['Enums']['order_status']
) {
  try {
    const updates: any = { status };

    // Устанавливаем соответствующие временные метки
    if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
    if (status === 'shipped') updates.shipped_at = new Date().toISOString();
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Получить все заказы (только для админов)
 */
export async function getAllOrders(filters?: {
  status?: string;
  paymentStatus?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        user:users(id, email, full_name),
        items:order_items(count)
      `, { count: 'exact' });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }

    query = query.order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count, error: null };
  } catch (error) {
    return { data: null, count: 0, error: handleSupabaseError(error) };
  }
}
