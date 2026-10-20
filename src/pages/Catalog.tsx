import { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { products, allCategories, type Category } from "@/data/products";
import { formatPrice } from "@/store/cart";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CartSidebar } from "@/components/CartSidebar";
import { MobileNav } from "@/components/MobileNav";
import { SEO } from "@/components/SEO";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import {
  DEFAULT_CATALOG_CATEGORY,
  DEFAULT_CATALOG_MAX_PRICE,
  DEFAULT_CATALOG_SORT,
  getCatalogProducts,
  type CatalogCategoryFilter,
  type CatalogSort,
} from "@/lib/catalog-products";

// Lazy load heavy components
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const ChatLauncher = lazy(() => import("@/components/ChatLauncher").then(m => ({ default: m.ChatLauncher })));

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("search") ?? params.get("q") ?? "");
  const initialCat = params.get("cat") as Category | null;
  const showPromo = params.get("promo") === "true";
  const [active, setActive] = useState<CatalogCategoryFilter>(
    initialCat && (allCategories as readonly string[]).includes(initialCat) ? initialCat : DEFAULT_CATALOG_CATEGORY
  );
  const [sort, setSort] = useState<CatalogSort>(DEFAULT_CATALOG_SORT);
  const [maxPrice, setMaxPrice] = useState<number>(DEFAULT_CATALOG_MAX_PRICE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Прокрутка вверх при открытии страницы каталога
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Реакция на смену query-параметров (например при переходе из шапки)
  useEffect(() => {
    const q = params.get("search") ?? params.get("q");
    const c = params.get("cat") as Category | null;
    setQuery(q ?? "");
    setActive(c && (allCategories as readonly string[]).includes(c) ? c : DEFAULT_CATALOG_CATEGORY);
  }, [params]);

  const filtered = useMemo(() => {
    return getCatalogProducts({
      products,
      query,
      active,
      sort,
      maxPrice,
      promoFirst: showPromo,
    });
  }, [query, active, sort, maxPrice, showPromo]);

  const reset = () => {
    setQuery("");
    setActive(DEFAULT_CATALOG_CATEGORY);
    setSort(DEFAULT_CATALOG_SORT);
    setMaxPrice(DEFAULT_CATALOG_MAX_PRICE);
    setParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Каталог мебели"
        description="Полный каталог мебели из массива дерева. Кровати, шкафы, столы, стулья, кресла, беседки. Более 100 моделей."
        keywords={['каталог мебели', 'купить мебель', 'мебель из массива']}
        url="/catalog"
      />
      <Navbar />
      <Breadcrumbs />
      <main id="main-content" className="container-x py-6 pb-24 md:pb-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl md:text-5xl font-bold">Каталог</h1>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="md:hidden flex items-center gap-2 text-sm bg-secondary border border-border px-3 py-2 rounded-lg"
            aria-label="Фильтры"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-2" />
            Фильтры
          </button>
        </div>

        {/* Поиск */}
        <form className="relative mb-4" role="search" onSubmit={(event) => event.preventDefault()}>
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 stroke-2 text-muted-foreground/90" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию, категории..."
            maxLength={80}
            aria-label="Поиск товаров"
            className="w-full bg-secondary border border-transparent focus:border-accent/25 rounded-lg pl-11 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-accent"
              aria-label="Очистить"
            >
              <X className="w-4 h-4 stroke-2" />
            </button>
          )}
        </form>

        <div className="grid md:grid-cols-[260px_1fr] gap-6">
          {/* Фильтры */}
          <aside
            className={`${filtersOpen ? "block" : "hidden"} md:block bg-surface border border-border rounded-xl p-4 h-fit md:sticky md:top-32`}
          >
            <div className="mb-5">
              <p className="text-xs uppercase font-semibold tracking-wider text-muted-foreground mb-2">Категория</p>
              <div className="flex flex-wrap gap-2">
                {(["Все", ...allCategories] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setActive(c)}
                    aria-pressed={active === c}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      active === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-transparent bg-secondary text-foreground hover:bg-muted hover:border-border"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs uppercase font-semibold tracking-wider text-muted-foreground mb-2">
                Цена до {formatPrice(maxPrice)}
              </p>
              <input
                type="range"
                min={10000}
                max={200000}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full"
                aria-label="Максимальная цена"
              />
            </div>

            <div className="mb-5">
              <p className="text-xs uppercase font-semibold tracking-wider text-muted-foreground mb-2">Сортировка</p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as CatalogSort)}
                aria-label="Сортировка товаров"
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              >
                <option value="popular">По популярности</option>
                <option value="price_asc">Сначала дешёвые</option>
                <option value="price_desc">Сначала дорогие</option>
              </select>
            </div>

            <button
              onClick={reset}
              className="w-full text-xs text-muted-foreground hover:text-accent transition-colors py-2"
            >
              Сбросить фильтры
            </button>
          </aside>

          {/* Сетка товаров */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Найдено: <span className="font-semibold text-foreground">{filtered.length}</span>
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-xl border border-border">
                <p className="text-muted-foreground mb-3">Ничего не найдено</p>
                <button
                  onClick={reset}
                  className="text-accent hover:text-accent-hover text-sm font-medium"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 stagger-in">
                {filtered.map((p) => (
                  <article
                    key={p.id}
                  >
                    <Link
                      to={`/product/${p.slug}`}
                      className="group bg-surface rounded-lg overflow-hidden border border-border hover:shadow-lg transition block"
                    >
                      <div className="relative aspect-square bg-secondary overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          width={400}
                          height={400}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {p.badge && (
                          <span className="absolute top-2 left-2 bg-background border border-border text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-md">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-3 md:p-4">
                        <p className="font-bold text-base mb-1">{formatPrice(p.price)}</p>
                        {p.oldPrice && (
                          <p className="text-sm text-muted-foreground line-through mb-1">{formatPrice(p.oldPrice)}</p>
                        )}
                      <h3 className="text-sm text-foreground leading-tight line-clamp-2 font-medium">{p.name}</h3>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Footer />
      </Suspense>
      <CartSidebar />
      <CatalogSidebar />
      <MobileNav />
      <Suspense fallback={null}>
        <ChatLauncher />
      </Suspense>
    </div>
  );
}
