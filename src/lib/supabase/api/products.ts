/**
 * Products API
 * CRUD операции с товарами
 */

import { supabase, handleSupabaseError } from '../client';
import type { Database } from '../types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'created_at' | 'sales_count';
}

/**
 * Получить список товаров с фильтрами
 */
export async function getProducts(filters: ProductFilters = {}) {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug)
      `, { count: 'exact' });

    // Фильтры
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.inStock) {
      query = query.gt('stock_quantity', 0);
    }

    if (filters.featured) {
      query = query.eq('is_featured', true);
    }

    // Сортировка
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'sales_count':
        query = query.order('sales_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Пагинация
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count, error: null };
  } catch (error) {
    return { data: null, count: 0, error: handleSupabaseError(error) };
  }
}

/**
 * Получить товар по slug
 */
export async function getProductBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;

    // Увеличиваем счетчик просмотров
    if (data) {
      await supabase
        .from('products')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', data.id);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Получить товар по ID
 */
export async function getProductById(id: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Создать товар (только для админов)
 */
export async function createProduct(product: ProductInsert) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Необходима авторизация');

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Обновить товар (только для админов)
 */
export async function updateProduct(id: string, updates: ProductUpdate) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Удалить товар (только для админов)
 */
export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: handleSupabaseError(error) };
  }
}

/**
 * Загрузить изображение товара
 */
export async function uploadProductImage(file: File, productId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Получаем публичный URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return { data: { path: data.path, url: publicUrl }, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

/**
 * Удалить изображение товара
 */
export async function deleteProductImage(path: string) {
  try {
    const { error } = await supabase.storage
      .from('products')
      .remove([path]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: handleSupabaseError(error) };
  }
}

/**
 * Получить похожие товары
 */
export async function getSimilarProducts(productId: string, categoryId: string, limit = 4) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .eq('is_active', true)
      .gt('stock_quantity', 0)
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}
