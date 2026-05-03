/**
 * Supabase Client Configuration
 * Production-ready setup with TypeScript
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Создаем типизированный клиент
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application-name': 'MM05-Furniture-Store',
    },
  },
});

// Хелпер для проверки роли администратора
export async function isAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !data) return false;
  return data.role === 'admin';
}

// Хелпер для получения текущего пользователя
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

// Хелпер для обработки ошибок Supabase
export function handleSupabaseError(error: any): string {
  if (!error) return 'Неизвестная ошибка';
  
  // Специфичные ошибки Postgres
  if (error.code === '23505') return 'Запись с такими данными уже существует';
  if (error.code === '23503') return 'Связанная запись не найдена';
  if (error.code === '23514') return 'Данные не прошли валидацию';
  
  // Ошибки аутентификации
  if (error.message?.includes('Invalid login credentials')) {
    return 'Неверный email или пароль';
  }
  if (error.message?.includes('Email not confirmed')) {
    return 'Email не подтвержден';
  }
  
  return error.message || 'Произошла ошибка';
}

export default supabase;
