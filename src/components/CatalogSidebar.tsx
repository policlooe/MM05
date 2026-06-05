import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { X, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { products, allCategories, type Category } from "@/data/products";
import { formatPrice, useCart } from "@/store/cart";
import { PremiumIconMark } from "@/components/PremiumIcon";
import { toast } from "sonner";
import { useCatalog } from "@/hooks/use-catalog";
import { useScrollLock } from "@/hooks/useScrollLock";

const filters = ["Все", ...allCategories] as const;
type Sort = "popular" | "price_asc" | "price_desc";

export function CatalogSidebar() {
  const { isOpen, close } = useCatalog();
  const { add } = useCart();
  const [active, setActive] = useState<Category | "Все">("Все");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [showFilters, setShowFilters] = useState(false);

  useScrollLock(isOpen);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (active !== "Все" && p.category !== active) return false;
      if (p.price > maxPrice) return false;
      if (q && !(`${p.name} ${p.shortDescription}`.toLowerCase().includes(q))) return false;
      return true;
    });
    
    // Сортировка
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    
    return list;
  }, [query, active, sort, maxPrice]);

  const reset = () => {
    setQuery("");
    setActive("Все");
    setSort("popular");
    setMaxPrice(200000);
  };

  const handleAddToCart = (product: typeof products[0]) => {
    add(product);
    toast.success("✓ Добавлено в корзину", { 
      description: product.name,
      duration: 2000
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="ios-fixed-overlay fixed inset-0 bg-black/50 z-[60]"
        onClick={close}
        data-scroll-overlay="true"
        aria-hidden="true"
      />

      {/* Sidebar - СЛЕВА */}
      <aside
        className="ios-fixed-panel fixed top-0 left-0 w-full sm:w-[520px] bg-surface z-[70] shadow-lg flex flex-col"
        role="complementary"
        aria-label="Каталог товаров"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-muted/25 to-transparent">
          <div className="flex items-center gap-3">
            <PremiumIconMark icon={LayoutGrid} size="sm" tone="accent" className="shrink-0" />
            <h2 className="text-lg font-semibold">Каталог товаров</h2>
          </div>
          <button
            onClick={close}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Закрыть каталог"
          >
            <X className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
          </button>
        </header>

        {/* Search */}
        <div className="px-6 pt-4 pb-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск товаров..."
            className="w-full px-4 py-2.5 bg-secondary border border-border/60 focus:border-accent/35 rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/18 transition-all"
            aria-label="Поиск товаров"
          />
        </div>

        {/* Filters Toggle */}
        <div className="px-6 pb-3 flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin flex-1" role="group" aria-label="Быстрые фильтры категорий">
            {filters.slice(0, 4).map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  active === f
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-transparent bg-secondary text-foreground hover:bg-muted hover:border-border"
                }`}
                aria-pressed={active === f}
                aria-label={`Фильтр: ${f}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-2 p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label={showFilters ? "Скрыть фильтры" : "Показать фильтры"}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="w-4 h-4 stroke-2" aria-hidden="true" />
          </button>
        </div>

        {/* Extended Filters */}
        {showFilters && (
            <div className="overflow-hidden border-b border-border">
              <div className="px-6 pb-4 space-y-4">
                {/* All Categories */}
                <div role="group" aria-labelledby="category-filter">
                  <h3 id="category-filter" className="text-xs font-medium text-muted-foreground mb-2">Все категории</h3>
                  <div className="flex flex-wrap gap-2">
                    {filters.map((f) => (
                      <button
                        key={f}
                        onClick={() => setActive(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          active === f
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-secondary text-foreground hover:bg-muted"
                        }`}
                        aria-pressed={active === f}
                        aria-label={`Категория: ${f}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div role="group" aria-labelledby="sort-filter">
                  <h3 id="sort-filter" className="text-xs font-medium text-muted-foreground mb-2">Сортировка</h3>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/18"
                    aria-label="Выберите сортировку"
                  >
                    <option value="popular">Популярные</option>
                    <option value="price_asc">Цена: по возрастанию</option>
                    <option value="price_desc">Цена: по убыванию</option>
                  </select>
                </div>

                {/* Price Range */}
                <div role="group" aria-labelledby="price-filter">
                  <h3 id="price-filter" className="text-xs font-medium text-muted-foreground mb-2">
                    Цена до: {formatPrice(maxPrice)}
                  </h3>
                  <input
                    type="range"
                    min="10000"
                    max="200000"
                    step="5000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full"
                    aria-label={`Максимальная цена: ${formatPrice(maxPrice)}`}
                    aria-valuemin={10000}
                    aria-valuemax={200000}
                    aria-valuenow={maxPrice}
                  />
                </div>

                {/* Reset */}
                <button
                  onClick={reset}
                  className="text-xs text-accent hover:text-accent-hover font-medium"
                  aria-label="Сбросить все фильтры"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          )}

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <p className="text-sm text-muted-foreground mb-3">
            Найдено: <span className="font-semibold text-foreground">{filtered.length}</span>
          </p>
          
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-3">Ничего не найдено</p>
              <button
                onClick={reset}
                className="text-accent hover:text-accent-hover text-sm font-medium"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <>
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="group bg-surface rounded-lg overflow-hidden border border-border hover:shadow-md transition-all"
                  >
                    <Link
                      to={`/product/${p.slug}`}
                      onClick={close}
                      className="block"
                    >
                      <div className="relative aspect-square bg-secondary overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {p.badge && (
                          <span className="absolute top-1.5 left-1.5 bg-background border border-border text-muted-foreground text-xs font-medium px-1.5 py-0.5 rounded-md">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="font-semibold text-sm mb-0.5">{formatPrice(p.price)}</p>
                        {p.oldPrice && (
                          <p className="text-xs text-muted-foreground line-through mb-1">
                            {formatPrice(p.oldPrice)}
                          </p>
                        )}
                        <h3 className="text-xs text-foreground/80 leading-tight line-clamp-2 mb-2">
                          {p.name}
                        </h3>
                      </div>
                    </Link>
                    <div className="px-2.5 pb-2.5">
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="w-full bg-secondary hover:bg-accent hover:text-accent-foreground text-foreground text-xs font-medium py-1.5 rounded-lg transition-colors"
                      >
                        В корзину
                      </button>
                    </div>
                  </div>
                ))}
              </>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <Link
            to="/catalog"
            onClick={close}
            className="block w-full text-center px-4 py-2.5 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-medium text-sm transition-colors"
          >
            Смотреть весь каталог →
          </Link>
        </div>
      </aside>
    </>
  );
}
