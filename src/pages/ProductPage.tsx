import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ShoppingBag, MessageCircle, Check, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getProductBySlug } from "@/data/products";
import { formatPrice, useCart } from "@/store/cart";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";
import { ProductReviews } from "@/components/ProductReviews";
import ImageViewer from "@/components/ImageViewer";
import { ProductConfigurator } from "@/components/ProductConfigurator";
import { SelectedConfiguration, calculateConfiguredPrice } from "@/types/product-config";
import { CONTACTS } from "@/lib/contacts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const product = getProductBySlug(slug);
  const { add, open } = useCart();
  const navigate = useNavigate();
  
  // Состояние для выбранного изображения в галерее
  const [selectedImage, setSelectedImage] = useState<string>("");
  
  // Состояние для ImageViewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  
  // Состояние для конфигурации товара
  const [selectedConfig, setSelectedConfig] = useState<SelectedConfiguration>({
    variants: {},
    options: {},
  });
  const [finalPrice, setFinalPrice] = useState(0);
  
  // Состояние для сборки (отдельно от конфигуратора)
  const [assemblySelected, setAssemblySelected] = useState<boolean>(() => {
    // Загружаем из localStorage при инициализации
    if (product) {
      const saved = localStorage.getItem(`mm05_assembly_${product.id}`);
      return saved === 'true';
    }
    return false;
  });

  // Все изображения товара (основное + галерея)
  const allImages = useMemo(() => {
    if (!product) return [];
    return [product.image, ...(product.gallery || [])];
  }, [product]);

  // Обработчик изменения конфигурации
  const handleConfigChange = (config: SelectedConfiguration, price: number) => {
    setSelectedConfig(config);
    
    // Добавляем цену сборки к базовой цене конфигурации
    const assemblyPrice = assemblySelected && product?.assemblyPrice ? product.assemblyPrice : 0;
    setFinalPrice(price + assemblyPrice);
  };

  // Инициализация цены при загрузке товара
  useEffect(() => {
    if (product) {
      let basePrice = product.price;
      
      if (product.configuration) {
        // Если есть конфигуратор, цена будет установлена через handleConfigChange
        basePrice = calculateConfiguredPrice(product.price, product.configuration, selectedConfig);
      }
      
      // Добавляем цену сборки, если выбрана
      const assemblyPrice = assemblySelected && product.assemblyPrice ? product.assemblyPrice : 0;
      setFinalPrice(basePrice + assemblyPrice);
    }
  }, [product, selectedConfig, assemblySelected]);
  
  // Обработчик переключения сборки
  const handleAssemblyToggle = () => {
    if (!product) return;
    
    const newValue = !assemblySelected;
    setAssemblySelected(newValue);
    
    // Сохраняем в localStorage
    localStorage.setItem(`mm05_assembly_${product.id}`, String(newValue));
    
    // Пересчитываем цену
    let basePrice = product.price;
    if (product.configuration) {
      basePrice = calculateConfiguredPrice(product.price, product.configuration, selectedConfig);
    }
    const assemblyPrice = newValue && product.assemblyPrice ? product.assemblyPrice : 0;
    setFinalPrice(basePrice + assemblyPrice);
  };

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

  // Открытие viewer
  const openViewer = (imageUrl: string) => {
    const index = allImages.indexOf(imageUrl);
    setCurrentImage(index >= 0 ? index : 0);
    setViewerOpen(true);
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

  const wa = `${CONTACTS.whatsapp}?text=${encodeURIComponent(`Здравствуйте! Интересует "${product.name}" — ${formatPrice(product.price)}.`)}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-x py-4 pb-24 md:pb-10">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Фото с галереей */}
          <div>
            {/* Основное фото - кликабельное для lightbox */}
            <motion.div 
              className="bg-surface rounded-xl overflow-hidden border border-border aspect-square mb-3 cursor-pointer group relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => openViewer(selectedImage)}
            >
              <img
                src={selectedImage}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Индикатор увеличения */}
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

            {/* Галерея миниатюр - горизонтальная прокрутка */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                {allImages.map((img, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setCurrentImage(index);
                      setViewerOpen(true);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "shrink-0 bg-surface rounded-lg overflow-hidden border-2 transition-all aspect-square hover:opacity-80 cursor-pointer",
                      selectedImage === img ? "border-accent opacity-100 ring-2 ring-accent/20" : "border-border opacity-70"
                    )}
                    style={{ width: '80px', height: '80px' }}
                  >
                    <img
                      src={img}
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
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl md:text-4xl font-semibold text-accent">
                  {formatPrice(finalPrice)}
                </span>
                {product.oldPrice && finalPrice === product.price && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
              
              {/* Опция сборки */}
              {product.assemblyPrice && product.assemblyPrice > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={assemblySelected}
                        onChange={handleAssemblyToggle}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">Сборка мебели</span>
                        <span className="text-sm text-accent font-semibold">
                          +{formatPrice(product.assemblyPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Профессиональная сборка на дому
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Конфигуратор товара (если есть) */}
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
                <Check className="w-3.5 h-3.5 stroke-[1.15] text-accent shrink-0" /> {product.inStock ? "В наличии" : "Под заказ"}
              </span>
              <span className="inline-flex items-center gap-1.5 border border-border bg-secondary/80 px-3 py-1.5 rounded-md text-muted-foreground">
                <Clock className="w-3.5 h-3.5 stroke-[1.15] shrink-0" /> Срок: {product.leadTime}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <motion.button
                onClick={() => {
                  // Создаем конфигурацию с учетом сборки
                  const configWithAssembly: SelectedConfiguration = product.configuration 
                    ? { ...selectedConfig, options: { ...selectedConfig.options, assembly: assemblySelected } }
                    : { variants: {}, options: { assembly: assemblySelected } };
                  
                  // Передаем конфигурацию и финальную цену в корзину
                  add(product, configWithAssembly, finalPrice);
                  toast.success("Добавлено в корзину", { description: product.name });
                }}
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

            {/* Описание */}
            <section className="mb-6">
              <h2 className="font-serif text-xl font-semibold mb-2">Описание</h2>
              <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                {product.description}
              </p>
            </section>

            {/* Характеристики */}
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

        {/* ImageViewer для полноэкранного просмотра */}
        {viewerOpen && (
          <ImageViewer
            images={allImages}
            currentIndex={currentImage}
            setIndex={setCurrentImage}
            onClose={() => setViewerOpen(false)}
          />
        )}

        {/* Хлебные крошки после основного блока */}
        <div className="mt-8">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent"
          >
            <ChevronLeft className="w-4 h-4 stroke-[1.15]" /> Вернуться в каталог
          </Link>
        </div>

        {/* Блок отзывов */}
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
