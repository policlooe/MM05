import type { Category, Product } from "@/data/products";

export type CatalogCategoryFilter = Category | "Все";
export type CatalogSort = "popular" | "price_asc" | "price_desc";

export const DEFAULT_CATALOG_MAX_PRICE = 200000;
export const DEFAULT_CATALOG_SORT: CatalogSort = "popular";
export const DEFAULT_CATALOG_CATEGORY: CatalogCategoryFilter = "Все";

type CatalogProductOptions = {
  products: readonly Product[];
  query?: string;
  active?: CatalogCategoryFilter;
  sort?: CatalogSort;
  maxPrice?: number;
  promoFirst?: boolean;
};

export function hasCatalogDiscount(product: Product) {
  return typeof product.oldPrice === "number" && product.oldPrice > product.price;
}

export function getCatalogProducts({
  products,
  query = "",
  active = DEFAULT_CATALOG_CATEGORY,
  sort = DEFAULT_CATALOG_SORT,
  maxPrice = DEFAULT_CATALOG_MAX_PRICE,
  promoFirst = false,
}: CatalogProductOptions) {
  const normalizedQuery = query.trim().toLowerCase();

  const list = products.filter((product) => {
    if (active !== "Все" && product.category !== active) return false;
    if (product.price > maxPrice) return false;

    if (normalizedQuery) {
      const searchText = `${product.name} ${product.shortDescription} ${product.category}`.toLowerCase();
      if (!searchText.includes(normalizedQuery)) return false;
    }

    return true;
  });

  if (sort === "price_asc") {
    return [...list].sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "ru"));
  }

  if (sort === "price_desc") {
    return [...list].sort((a, b) => b.price - a.price || a.name.localeCompare(b.name, "ru"));
  }

  if (promoFirst) {
    return [...list].sort((a, b) => Number(hasCatalogDiscount(b)) - Number(hasCatalogDiscount(a)));
  }

  return list;
}
