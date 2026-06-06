import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from "react";
import type { Product } from "@/data/products";
import { SelectedConfiguration } from "@/types/product-config";
import { toast } from "sonner";
import { ecommerce } from "@/lib/web-vitals";

// Расширенный тип для товара в корзине с конфигурацией
export type CartItem = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  finalPrice: number;
  image: string;
  category: string;
  qty: number;
  configuration?: SelectedConfiguration;
  assemblySelected?: boolean;
  assemblyPrice?: number;
  cartItemId?: string;
  // КРИТИЧНО: Уникальный ключ для позиции в корзине
  cartItemKey: string;
};

// КРИТИЧНО: Генерация уникального ключа для позиции корзины
function generateCartItemKey(productId: string, config?: SelectedConfiguration): string {
  if (!config) return productId;
  return `${productId}_${JSON.stringify(config)}`;
}

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
    const itemFinalPrice = finalPrice ?? p.price;

    const cartItemKey = generateCartItemKey(p.id, config);

    setItems((prev) => {
      // КРИТИЧНО: Ищем по уникальному ключу, а не только по ID
      const existingIndex = prev.findIndex((i) => i.cartItemKey === cartItemKey);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + 1,
        };
        return updated;
      }

      const assemblySelected = (config?.options?.assembly as boolean) || false;
      const assemblyPrice = assemblySelected ? (p.assemblyPrice || 0) : 0;

      const newItem: CartItem = {
        id: p.id,
        name: p.name,
        slug: p.slug,
        basePrice: p.price,
        finalPrice: itemFinalPrice,
        image: p.image,
        category: p.category,
        qty: 1,
        configuration: config,
        assemblySelected: assemblySelected,
        assemblyPrice: assemblyPrice,
        cartItemKey: cartItemKey, // КРИТИЧНО: Сохраняем уникальный ключ
      };

      return [...prev, newItem];
    });

    ecommerce.addToCart({
      id: p.id,
      name: p.name,
      price: itemFinalPrice,
      quantity: 1,
    });

    toast.success("Товар добавлен в корзину", {
      description: p.name,
      duration: 2000,
    });
  }, []);

  // КРИТИЧНО: Удаление и изменение количества по уникальному ключу
  const remove = useCallback((cartItemKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemKey !== cartItemKey));
    toast.success("Товар удален из корзины");
  }, []);

  const setQty = useCallback((cartItemKey: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.cartItemKey !== cartItemKey));
      toast.success("Товар удален из корзины");
      return;
    }
    
    setItems((prev) =>
      prev.map((i) => (i.cartItemKey === cartItemKey ? { ...i, qty: Math.min(qty, 99) } : i))
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  // КРИТИЧНО: Мемоизация count и total - пересчёт только при изменении items
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.qty * i.finalPrice, 0), [items]);

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
