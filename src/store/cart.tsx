import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import type { Product } from "@/data/products";
import { SelectedConfiguration } from "@/types/product-config";
import { toast } from "sonner";

// Расширенный тип для товара в корзине с конфигурацией
export type CartItem = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  finalPrice: number; // ВАЖНО: итоговая цена с учетом конфигурации
  image: string;
  category: string;
  qty: number;
  // Конфигурация товара
  configuration?: SelectedConfiguration;
  // Для отображения в UI
  assemblySelected?: boolean;
  assemblyPrice?: number;
  cartItemId?: string; // Для backend
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (p: Product, config?: SelectedConfiguration, finalPrice?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  loading: boolean;
};

const Ctx = createContext<CartCtx | null>(null);

const CART_STORAGE_KEY = 'mm05_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Загружаем корзину из localStorage при инициализации
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Сохраняем корзину в localStorage при каждом изменении
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  const add = useCallback((
    p: Product, 
    config?: SelectedConfiguration, 
    finalPrice?: number
  ) => {
    // КРИТИЧНО: finalPrice ОБЯЗАТЕЛЕН
    if (!finalPrice) {
      console.error("finalPrice is required for addToCart");
      finalPrice = p.price; // fallback
    }

    setItems((prev) => {
      // Проверяем, есть ли уже такой товар с такой же конфигурацией
      const existingIndex = prev.findIndex((i) => {
        if (i.id !== p.id) return false;
        // Если нет конфигурации, сравниваем только по ID
        if (!config && !i.configuration) return true;
        // Если есть конфигурация, сравниваем её
        return JSON.stringify(i.configuration) === JSON.stringify(config);
      });

      if (existingIndex >= 0) {
        // Увеличиваем количество существующего товара
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + 1,
        };
        return updated;
      }

      // Извлекаем данные о сборке из конфигурации
      const assemblySelected = (config?.options?.assembly as boolean) || false;
      const assemblyPrice = assemblySelected ? (p.assemblyPrice || 0) : 0;

      // Добавляем новый товар
      const newItem: CartItem = {
        id: p.id,
        name: p.name,
        slug: p.slug,
        basePrice: p.price,
        finalPrice: finalPrice, // ВСЕГДА используем переданную finalPrice
        image: p.image,
        category: p.category,
        qty: 1,
        configuration: config, // Сохраняем полную конфигурацию
        assemblySelected: assemblySelected,
        assemblyPrice: assemblyPrice,
      };

      return [...prev, newItem];
    });

    toast.success("Товар добавлен в корзину", {
      description: p.name,
      duration: 2000,
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Товар удален из корзины");
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) return remove(id);
    
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, 99) } : i))
    );
  }, [remove]);

  const clear = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.finalPrice, 0); // Используем finalPrice!

  return (
    <Ctx.Provider
      value={{
        items,
        count,
        total,
        add,
        remove,
        setQty,
        clear,
        isOpen,
        open: () => setOpen(true),
        close: () => setOpen(false),
        loading,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

export const formatPrice = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
