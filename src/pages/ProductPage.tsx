import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ShoppingBag, MessageCircle, Check, Clock, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { getProductBySlug } from "@/data/products";
import { formatPrice, useCart } from "@/store/cart";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";
import { ProductReviews } from "@/components/ProductReviews";
import { ImageLightbox } from "@/components/ImageLightbox";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { SelectedConfiguration, calculateConfiguredPrice } from "@/types/product-config";
import { CONTACTS } from "@/lib/contacts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ASSEMBLY_STORAGE_PREFIX = "mm05_assembly_";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const product = getProductBySlug(slug);
  const { add } = useCart();
  const navigate = useNavigate();

  // Состояние для выбранного изображения в галерее
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Состояние для lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Состояние для конфигурации товара (Amazon-level конфигуратор)
  const [selectedConfig, setSelectedConfig] = useState<SelectedConfiguration>({
    variants: {},
    options: {},
  });
  const [finalPrice, setFinalPrice] = useState(0);

  // Состояние для отдельного toggle "Сборка" — только для товаров без полного конфигуратора
  const [assemblyToggle, setAssemblyToggle] = useState<boolean>(false);

  // Все изображения товара (основное + галерея)
  const allImages = useMemo(() => {
    if (!product) return [];
    return [product.image, ...(product.gallery || [])];
  }, [product]);

  // Показывать ли отдельный toggle сборки (если нет полного конфигуратора, но есть assemblyPrice)
  const showSimpleAssemblyToggle = Boolean(
    product && !product.configuration && product.assemblyPrice && product.assemblyPrice > 0
  );

  // Загрузка сохранённого состояния "сборка" из localStorage при загрузке товара
  useEffect(() => {
    if (!product || !showSimpleAssemblyToggle) return;
    try {
      const saved = localStorage.getItem(`${ASSEMBLY_STORAGE_PREFIX}${product.id}`);
      setAssemblyToggle(saved === "1");
    } catch {
      setAssemblyToggle(false);
    }
  }, [product, showSimpleAssemblyToggle]);

  // Сохранение состояния "сборка" в localStorage
  useEffect(() => {
    if (!product || !showSimpleAssemblyToggle) return;
    try {
      localStorage.setItem(
        `${ASSEMBLY_STORAGE_PREFIX}${product.id}`,
        assemblyToggle ? "1" : "0"
      );
    } catch {
      // ignore
    }
  }, [assemblyToggle, product, showSimpleAssemblyToggle]);

  // Обработчик изменения конфигурации (от Amazon-level конфигуратора)
  const handleConfigChange = (config: SelectedConfiguration, price: number) => {
    setSelectedConfig(config);
    setFinalPrice(price);
  };

  // Инициализация и пересчёт цены
  useEffect(() => {
    if (!product) return;

    if (product.configuration) {
      // Если есть полный конфигуратор, цена устанавливается через handleConfigChange
      const initialPrice = calculateConfiguredPrice(
        product.price,
        product.configuration,
        selectedConfig
      );
      setFinalPrice(initialPrice);
    } else if (showSimpleAssemblyToggle) {
      // Простой toggle сборки: цена = базовая + (сборка если выбрана)
      const assemblyCost = assemblyToggle ? product.assemblyPrice || 0 : 0;
      setFinalPrice(product.price + assemblyCost);
    } else {
      setFinalPrice(product.price);
    }
  }, [product, assemblyToggle, showSimpleAssemblyToggle]);

  // Устанавливаем основное изображение при загрузке товара
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
    }
  }, [product]);

  // Прокрутка вверх при открытии страницы товара
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Открытие lightbox
  const openLightbox = (imageUrl: string) => {
    const index = allImages.indexOf(imageUrl);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container-x py-16 text-center">
          <h1 className="font-serif text-2xl mb-4">Товар не найден</h1>
          <button
            onClick={() => navigate("/catalog")}
            className="text-accent hover:text-accent-hover font-medium"
          >
            ← Вернуться в каталог
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const wa = `${CONTACTS.whatsapp}?text=${encodeURIComponent(
    `Здравствуйте! Интересует "${product.name}" — ${formatPrice(product.price)}.`
  )}`;

  const handleAddToCart = () => {
    if (product.configuration) {
      // Полный конфигуратор: передаём всю выбранную конфигурацию
      add(product, selectedConfig, finalPrice);
    } else if (showSimpleAssemblyToggle && assemblyToggle) {
      // Простой toggle сборки выбран: формируем синтетическую конфигурацию
      add(product, { variants: {}, options: { assembly: true } }, finalPrice);
    } else {
      // Без опций
      add(product, undefined, finalPrice);
    }
    toast.success("Добавлено в корзину", { description: product.name });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-x py-4 pb-24 md:pb-10">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Фото с галереей */}
          <div>
            <motion.div
              className="bg-surface rounded-xl overflow-hidden border border-border aspect-square mb-3 cursor-pointer group relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => openLightbox(selectedImage)}
            >
              <img
                src={selectedImage || "/placeholder.svg"}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Нажмите для увеличения
                </motion.div>
              </div>
            </motion.div>

            {/* Галерея миниатюр */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {allImages.map((img, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "shrink-0 bg-surface rounded-lg overflow-hidden border-2 transition-all aspect-square hover:opacity-80 cursor-pointer",
                      selectedImage === img
                        ? "border-accent opacity-100 ring-2 ring-accent/20"
                        : "border-border opacity-70"
                    )}
                    style={{ width: "80px", height: "80px" }}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} - фото ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Инфо */}
          <div>
            {product.badge && (
              <span className="inline-block border border-border bg-muted/50 text-muted-foreground text-[11px] font-medium px-2 py-0.5 rounded-md mb-3">
                {product.badge}
              </span>
            )}
            <p className="text-xs text-muted-foreground font-medium mb-2">{product.category}</p>
            <h1 className="font-serif text-2xl md:text-4xl font-semibold mb-3">{product.name}</h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-5">
              {product.shortDescription}
            </p>

            {/* Блок цены */}
            <div className="bg-surface border border-border rounded-xl p-4 mb-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <motion.span
                  key={finalPrice}
                  initial={{ scale: 1.05, opacity: 0.85 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="font-serif text-3xl md:text-4xl font-semibold text-accent"
                >
                  {formatPrice(finalPrice)}
                </motion.span>
                {product.oldPrice && finalPrice === product.price && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
                {showSimpleAssemblyToggle && assemblyToggle && (
                  <span className="text-xs text-muted-foreground">
                    Базовая: {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Простой toggle "Сборка" — для товаров без полного конфигуратора */}
            {showSimpleAssemblyToggle && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-xl border p-4 mb-5 transition-all",
                  assemblyToggle
                    ? "bg-accent/5 border-accent/30"
                    : "bg-surface border-border"
                )}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={assemblyToggle}
                      onChange={(e) => setAssemblyToggle(e.target.checked)}
                      className="peer sr-only"
                      aria-label="Добавить сборку"
                    />
                    <div className="w-11 h-6 bg-secondary rounded-full peer-checked:bg-accent transition-colors border border-border peer-checked:border-accent" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-accent" />
                        Сборка мебели
                      </span>
                      <span className="font-semibold text-sm text-accent whitespace-nowrap">
                        +{formatPrice(product.assemblyPrice || 0)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Профессиональная сборка на дому опытным мастером. Включено в итоговую цену
                      при оформлении заказа.
                    </p>
                  </div>
                </label>
              </motion.div>
            )}

            {/* Полный конфигуратор товара (если есть) */}
            {product.configuration && (
              <div className="mb-5">
                <ProductConfigurator
                  basePrice={product.price}
                  configuration={product.configuration}
                  onConfigChange={handleConfigChange}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs mb-6">
              <span className="inline-flex items-center gap-1.5 border border-border bg-secondary/80 text-foreground px-3 py-1.5 rounded-md font-medium">
                <Check className="w-3.5 h-3.5 stroke-[1.15] text-accent shrink-0" />{" "}
                {product.inStock ? "В наличии" : "Под заказ"}
              </span>
              <span className="inline-flex items-center gap-1.5 border border-border bg-secondary/80 px-3 py-1.5 rounded-md text-muted-foreground">
                <Clock className="w-3.5 h-3.5 stroke-[1.15] shrink-0" /> Срок: {product.leadTime}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-accent text-primary-foreground py-4 rounded-lg font-semibold text-sm transition-colors shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.15]" /> В корзину
              </motion.button>
              <motion.a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary hover:bg-muted py-4 rounded-lg font-semibold text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4 stroke-[1.15]" /> Написать в WhatsApp
              </motion.a>
            </div>

            <section className="mb-6">
              <h2 className="font-serif text-xl font-semibold mb-2">Описание</h2>
              <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                {product.description}
              </p>
            </section>

            <section className="mb-6">
              <h2 className="font-serif text-xl font-semibold mb-3">Характеристики</h2>
              <dl className="bg-surface border border-border rounded-xl divide-y divide-border">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-3 px-4 py-3 text-sm">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="font-medium text-right">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        <ImageLightbox
          images={allImages}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          productName={product.name}
        />

        <div className="mt-8">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent"
          >
            <ChevronLeft className="w-4 h-4 stroke-[1.15]" /> Вернуться в каталог
          </Link>
        </div>

        <div className="mt-8">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
      </main>
      <Footer />
      <CartSidebar />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
}
