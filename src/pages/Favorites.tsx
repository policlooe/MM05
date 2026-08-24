import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useFavorites } from "@/store/favorites";
import { useCart, formatPrice } from "@/store/cart";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";

export default function Favorites() {
  const { favorites, remove } = useFavorites();
  const { add } = useCart();

  const handleAddToCart = (product: Product) => {
    add(product);
  };

  const handleRemove = (productId: string, productName: string) => {
    remove(productId);
    toast.success("Удалено из избранного", {
      description: productName,
      duration: 1500,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs />
      
      <main id="main-content" className="container-x py-6 pb-24 md:pb-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-accent fill-current" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold">
                Избранное
              </h1>
              <p className="text-sm text-muted-foreground">
                {favorites.length === 0
                  ? "Пока нет избранных товаров"
                  : `${favorites.length} ${favorites.length === 1 ? "товар" : favorites.length < 5 ? "товара" : "товаров"}`}
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-2xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-accent" />
            </div>
            <h2 className="font-serif text-xl font-semibold mb-3">
              Ваш список избранного пуст
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Добавляйте товары в избранное, нажимая на иконку сердечка на карточках товаров
            </p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition shadow-sm hover:shadow-accent"
            >
              Перейти в каталог
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {favorites.map((product, index) => (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition group"
                >
                  <Link to={`/product/${product.slug}`} className="block">
                    <div className="relative aspect-square bg-secondary overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.badge && (
                        <span className="absolute top-2 left-2 bg-background border border-border text-muted-foreground text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                          {product.badge}
                        </span>
                      )}
                      {product.inStock && (
                        <span className="absolute top-2 right-2 bg-accent/90 text-white text-xs font-semibold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          В наличии
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <p className="font-bold text-lg">{formatPrice(product.price)}</p>
                      {product.oldPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.oldPrice)}
                        </p>
                      )}
                    </div>

                    <Link to={`/product/${product.slug}`} className="block mb-3">
                      <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-2.5 rounded-lg transition shadow-sm hover:shadow-accent flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        В корзину
                      </button>
                      <button
                        onClick={() => handleRemove(product.id, product.name)}
                        className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center justify-center"
                        title="Удалить из избранного"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-muted border border-border rounded-xl font-semibold transition"
              >
                Продолжить покупки
              </Link>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
