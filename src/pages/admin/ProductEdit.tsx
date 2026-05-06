import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Save, 
  X, 
  Upload, 
  Trash2,
  ChevronLeft,
  AlertCircle,
  Plus
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";
import type { Product, Category } from "@/data/products";
import { toast } from "sonner";

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    category: "Кровати" as Category,
    price: 0,
    oldPrice: 0,
    image: "",
    gallery: [],
    badge: "",
    shortDescription: "",
    description: "",
    specs: [],
    leadTime: "10–14 дней",
    inStock: true,
    assemblyPrice: 0,
  });

  useEffect(() => {
    if (!isNew && id) {
      const existingProduct = products.find(p => p.id === id);
      if (existingProduct) {
        setProduct(existingProduct);
      } else {
        toast.error("Товар не найден");
        navigate("/admin/products");
      }
    }
  }, [id, isNew, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: API call to save product
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(isNew ? "Товар создан" : "Товар обновлен");
      navigate("/admin/products");
    } catch (error) {
      toast.error("Ошибка при сохранении товара");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpec = () => {
    setProduct({
      ...product,
      specs: [...(product.specs || []), { label: "", value: "" }]
    });
  };

  const handleRemoveSpec = (index: number) => {
    setProduct({
      ...product,
      specs: product.specs?.filter((_, i) => i !== index)
    });
  };

  const handleSpecChange = (index: number, field: "label" | "value", value: string) => {
    const newSpecs = [...(product.specs || [])];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setProduct({ ...product, specs: newSpecs });
  };

  const categories: Category[] = ["Кровати", "Шкафы", "Столы", "Кресла", "Беседки", "Тумбы"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-x py-6 pb-24 md:pb-10 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад к товарам
          </Link>
          <h1 className="font-serif text-3xl font-semibold mb-2">
            {isNew ? "Добавить товар" : "Редактировать товар"}
          </h1>
          <p className="text-muted-foreground">
            {isNew ? "Создайте новый товар для каталога" : `Редактирование: ${product.name}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Основная информация</h2>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Название товара <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  placeholder="Например: Кровать «Альмак»"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Категория <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={product.category}
                  onChange={(e) => setProduct({ ...product, category: e.target.value as Category })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Цена <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="46500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Старая цена (опционально)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={product.oldPrice || ""}
                    onChange={(e) => setProduct({ ...product, oldPrice: Number(e.target.value) || undefined })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="56000"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Краткое описание <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={product.shortDescription}
                  onChange={(e) => setProduct({ ...product, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  placeholder="Двуспальная кровать из массива дуба..."
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Полное описание <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                  placeholder="Подробное описание товара..."
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Характеристики</h2>
              <button
                type="button"
                onClick={handleAddSpec}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>

            <div className="space-y-3">
              {product.specs?.map((spec, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={spec.label}
                    onChange={(e) => handleSpecChange(index, "label", e.target.value)}
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="Название (например: Материал)"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="Значение (например: Массив дуба)"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(index)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!product.specs || product.specs.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Нет характеристик. Нажмите "Добавить" чтобы создать.
                </p>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Дополнительная информация</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Срок изготовления
                  </label>
                  <input
                    type="text"
                    value={product.leadTime}
                    onChange={(e) => setProduct({ ...product, leadTime: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="10–14 дней"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Цена сборки
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={product.assemblyPrice || ""}
                    onChange={(e) => setProduct({ ...product, assemblyPrice: Number(e.target.value) || undefined })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="3500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Бейдж (опционально)
                  </label>
                  <input
                    type="text"
                    value={product.badge || ""}
                    onChange={(e) => setProduct({ ...product, badge: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    placeholder="Хит, Новинка, Скидка"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={product.inStock}
                      onChange={(e) => setProduct({ ...product, inStock: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-accent focus:ring-2 focus:ring-accent/20"
                    />
                    <span className="text-sm font-medium">В наличии</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-muted border border-border rounded-lg font-semibold text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Отмена
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isNew ? "Создать товар" : "Сохранить изменения"}
                </>
              )}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
