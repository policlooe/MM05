import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

interface RecentlyViewedState {
  products: Product[];
  add: (product: Product) => void;
  clear: () => void;
}

const MAX_RECENT_PRODUCTS = 12;

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      products: [],
      
      add: (product) => {
        set((state) => {
          // Удаляем товар если он уже есть
          const filtered = state.products.filter((p) => p.id !== product.id);
          
          // Добавляем в начало
          const updated = [product, ...filtered];
          
          // Ограничиваем количество
          return { products: updated.slice(0, MAX_RECENT_PRODUCTS) };
        });
      },
      
      clear: () => {
        set({ products: [] });
      },
    }),
    {
      name: "mm05-recently-viewed",
    }
  )
);
