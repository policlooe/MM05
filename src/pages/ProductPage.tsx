import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ShoppingBag, MessageCircle, Check, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getProductBySlug } from "@/data/products";
import { formatPrice, useCart } from "@/store/cart";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Footer } from "@/components/Footer";
import { CartSidebar } from "@/components/CartSidebar";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { MobileNav } from "@/components/MobileNav";
import { ChatLauncher } from "@/components/ChatLauncher";
import { ProductReviews } from "@/components/ProductReviews";
import ImageViewer from "@/components/ImageViewer";
import { ProductConfiguratorV2 } from "@/components/ProductConfiguratorV2";
import { ProductConfiguratorCollapsible } from "@/components/ProductConfiguratorCollapsible";
import { SelectedConfiguration, calculateConfiguredPrice } from "@/types/product-config";
import { SelectedConfiguration as AdvancedSelectedConfiguration } from "@/types/product-configuration";
import { CONTACTS } from "@/lib/contacts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ecommerce } from "@/lib/web-vitals";
import { useRecentlyViewed } from "@/store/recentlyViewed";
import { SimilarProducts } from "@/components/SimilarProducts";
import { SEO } from "@/components/SEO";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const product = getProductBySlug(slug);
  const { add, open } = useCart();
  const { add: addToRecentlyViewed } = useRecentlyViewed();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const [selectedConfig, setSelectedConfig] = useState<SelectedConfiguration>({
    variants: {},
    options: {},
  });

  const [advancedConfig, setAdvancedConfig] = useState<AdvancedSelectedConfiguration>({
    variants: {},
    options: {},
  });

  const [finalPrice, setFinalPrice] = useState(0);

  const [assemblySelected, setAssemblySelected] = useState<boolean>(() => {
    if (!product) return false;
    try {
      const saved = localStorage.getItem(`mm05_assembly_${product.id}`);
      return saved === 'true';
    } catch (error) {
      console.error('Failed to load assembly state:', error);
      return false;
    }
  });

  const allImages = useMemo(() => {
    if (!product) return [];
    return [product.image, ...(product.gallery || [])];
  }, [product]);

  const handleConfigChange = (config: SelectedConfiguration, price: number) => {
    setSelectedConfig(config);
    const assemblyPrice = assemblySelected && product?.assemblyPrice ? product.assemblyPrice : 0;
    setFinalPrice(price + assemblyPrice);
  };

  const handleAdvancedConfigChange = (config: AdvancedSelectedConfiguration, price: number) => {
    setAdvancedConfig(config);
    setFinalPrice(price);
  };

  const handleImageChange = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  useEffect(() => {
    if (product) {
      let basePrice = product.price;
      if (product.configuration) {
        basePrice = calculateConfiguredPrice(product.price, product.configuration, selectedConfig);
      }
      const assemblyPrice = assemblySelected && product.assemblyPrice ? product.assemblyPrice : 0;
      setFinalPrice(basePrice + assemblyPrice);
    }
  }, [product, selectedConfig, assemblySelected]);

  const handleAssemblyToggle = () => {
    if (!product) return;
    const newValue = !assemblySelected;
    setAssemblySelected(newValue);
    try {
      localStorage.setItem(`mm05_assembly_${product.id}`, String(newValue));
    } catch (error) {
      console.error('Failed to save assembly state:', error);
    }
    let basePrice = product.price;
    if (product.configuration) {
      basePrice = calculateConfiguredPrice(product.price, product.configuration, selectedConfig);
    }
    const assemblyPrice = newValue && product.assemblyPrice ? product.assemblyPrice : 0;
    setFinalPrice(basePrice + assemblyPrice);
  };

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      
      // Track product view
      ecommerce.viewItem({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      });
    }
  }, [product]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Add to recently viewed
    if (product) {
      addToRecentlyViewed(product);
    }
  }, [slug, product, addToRecentlyViewed]);

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

  const wa = `${CONTACTS.whatsapp}?text=${encodeURIComponent(
    `Здравствуйте! Интересует "${product.name.replace(/[<>]/g, '')}" — ${formatPrice(product.price)}.`
  )}`;

  return (
    <div className="min-h-screen bg-background">
      {product && (
        <SEO
          title={product.name}
          description={product.description || `${product.name} из массива дерева. Цена: ${formatPrice(product.price)}`}
          image={product.image}
          url={`/product/${product.slug}`}
          type="product"
          keywords={[product.name, product.category, 'мебель из массива']}
        />
      )}
      <Navbar />
      <Breadcrumbs />
      <main className="container-x py-3 pb-20 md:pb-10">
        <div className="w-full max-w-[480px] mx-auto px-3 md:max-w-6xl md:px-4">
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
            <div className="flex flex-col w-full">
              <motion.div 
                className="bg-surface rounded-xl overflow-hidden border border-border aspect-square mb-3 cursor-pointer group relative w-full max-w-[100%]"
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

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent justify-center md:justify-start">
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
                        "shrink-0 bg-surface rounded-lg overflow-hidden border-2 transition-all aspect-square hover:opacity-80 cursor-pointer w-[64px] h-[64px]",
                        selectedImage === img 
                          ? "border-accent opacity-100 ring-2 ring-accent/20" 
                          : "border-border opacity-70"
                      )}
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

            <div className="flex flex-col w-full text-left gap-3 min-w-0">
              {product.badge && (
                <span className="inline-block border border-border bg-muted/50 text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-md mb-2">
                  {product.badge}
                </span>
              )}
              <p className="text-xs text-muted-foreground font-medium mb-1.5">{product.category}</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight break-words">{product.name}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed break-words max-w-2xl">
                {product.shortDescription}
              </p>

              <div className="w-full bg-surface border border-border rounded-xl p-3 shadow-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-serif text-2xl md:text-3xl font-bold text-accent">
                    {formatPrice(finalPrice)}
                  </span>
                  {product.oldPrice && finalPrice === product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>

                {!product.advancedConfiguration && product.assemblyPrice && product.assemblyPrice > 0 && (
                  <div className="pt-2 border-t border-border mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={assemblySelected}
                        onChange={handleAssemblyToggle}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium truncate">Сборка мебели</span>
                          <span className="text-xs font-semibold text-accent shrink-0">
                            +{formatPrice(product.assemblyPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          Профессиональная сборка на дому
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {product.advancedConfiguration ? (
                <div className="mb-3">
                  <ProductConfiguratorCollapsible
                    basePrice={product.price}
                    configuration={product.advancedConfiguration}
                    defaultImage={product.image}
                    onConfigChange={handleAdvancedConfigChange}
                    onImageChange={handleImageChange}
                  />
                </div>
              ) : product.configuration ? (
                <div className="mb-3">
                  <ProductConfiguratorV2
                    basePrice={product.price}
                    configuration={product.configuration}
                    onConfigChange={handleConfigChange}
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-1.5 text-xs mb-4">
                <span className="inline-flex items-center gap-1 border border-border bg-secondary/80 text-foreground px-2 py-1 rounded-md font-medium">
                  <Check className="w-3 h-3 stroke-2 text-accent shrink-0" /> {product.inStock ? "В наличии" : "Под заказ"}
                </span>
                <span className="inline-flex items-center gap-1 border border-border bg-secondary/80 px-2 py-1 rounded-md text-muted-foreground">
                  <Clock className="w-3 h-3 stroke-2 shrink-0" /> {product.leadTime}
                </span>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => {
                    const configToUse = product.advancedConfiguration 
                      ? advancedConfig
                      : product.configuration 
                        ? { ...selectedConfig, options: { ...selectedConfig.options, assembly: assemblySelected } }
                        : { variants: {}, options: { assembly: assemblySelected } };
                    add(product, configToUse as any, finalPrice);
                    toast.success("Добавлено в корзину", { description: product.name });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-foreground py-3 rounded-lg font-semibold text-sm transition-colors shadow-sm active:scale-[0.98]"
                >
                  <ShoppingBag className="w-4 h-4 stroke-2" aria-hidden="true" /> В корзину
                </button>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-secondary hover:bg-muted py-3 rounded-lg font-semibold text-sm transition-colors active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 stroke-2" aria-hidden="true" /> Написать в WhatsApp
                </a>
              </div>

              <section className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Описание</h2>
                <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                  {product.description}
                </p>
              </section>

              <section className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Характеристики</h2>
                <dl className="bg-surface border border-border rounded-lg divide-y divide-border">
                  {product.specs.map((s) => (
                    <div key={s.label} className="flex justify-between gap-3 px-3 py-2 text-xs">
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd className="font-medium text-right">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>

          {viewerOpen && (
            <ImageViewer
              images={allImages}
              currentIndex={currentImage}
              setIndex={setCurrentImage}
              onClose={() => setViewerOpen(false)}
            />
          )}

          <div className="mt-8">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent"
            >
              <ChevronLeft className="w-4 h-4 stroke-2" /> Вернуться в каталог
            </Link>
          </div>

          <div className="mt-8 max-w-6xl mx-auto">
            <ProductReviews productId={product.id} productName={product.name} />
          </div>
        </div>
      </main>
      
      <SimilarProducts currentProduct={product} limit={4} />
      
      <Footer />
      <CartSidebar />
      <CatalogSidebar />
      <MobileNav />
      <ChatLauncher />
    </div>
  );
}
