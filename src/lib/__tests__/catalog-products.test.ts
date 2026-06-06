import { describe, expect, it } from "vitest";
import {
  getCatalogProducts,
  hasCatalogDiscount,
  type CatalogSort,
} from "@/lib/catalog-products";
import type { Product } from "@/data/products";

const makeProduct = (overrides: Partial<Product> & Pick<Product, "id" | "name" | "category" | "price">): Product => ({
  slug: overrides.id,
  image: "",
  shortDescription: "",
  description: "",
  specs: [],
  leadTime: "",
  inStock: true,
  ...overrides,
});

const products: Product[] = [
  makeProduct({ id: "bed-premium", name: "Премиум кровать", category: "Кровати", price: 90000, oldPrice: 110000 }),
  makeProduct({ id: "table-basic", name: "Рабочий стол", category: "Столы", price: 21000 }),
  makeProduct({ id: "chair", name: "Кресло", category: "Кресла", price: 24000 }),
  makeProduct({ id: "bed-basic", name: "Базовая кровать", category: "Кровати", price: 39000 }),
];

describe("getCatalogProducts", () => {
  it.each([
    ["price_asc", ["table-basic", "chair", "bed-basic", "bed-premium"]],
    ["price_desc", ["bed-premium", "bed-basic", "chair", "table-basic"]],
  ] satisfies Array<[CatalogSort, string[]]>)("sorts products by %s even when promo products exist", (sort, ids) => {
    expect(getCatalogProducts({ products, sort, promoFirst: true }).map((product) => product.id)).toEqual(ids);
  });

  it("keeps promo products first only for the default popular sort", () => {
    expect(getCatalogProducts({ products, promoFirst: true }).map((product) => product.id)).toEqual([
      "bed-premium",
      "table-basic",
      "chair",
      "bed-basic",
    ]);
  });

  it("filters by category, query, and max price before sorting", () => {
    expect(
      getCatalogProducts({
        products,
        active: "Кровати",
        query: "кровать",
        maxPrice: 50000,
        sort: "price_asc",
      }).map((product) => product.id)
    ).toEqual(["bed-basic"]);
  });

  it("detects real discount products", () => {
    expect(hasCatalogDiscount(products[0])).toBe(true);
    expect(hasCatalogDiscount(products[1])).toBe(false);
  });
});
