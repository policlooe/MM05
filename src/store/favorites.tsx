import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

interface FavoritesState {
  favorites: Product[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clear: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      add: (product) => {
        set((state) => {
          // Проверяем, нет ли уже в избранном
          if (state.favorites.some((p) => p.id === product.id)) {
            return state;
          }
          return { favorites: [...state.favorites, product] };
        });
      },
      
      remove: (productId) => {
        set((state) => ({
          favorites: state.favorites.filter((p) => p.id !== productId),
        }));
      },
      
      isFavorite: (productId) => {
        return get().favorites.some((p) => p.id === productId);
      },
      
      clear: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: "mm05-favorites",
    }
  )
);
