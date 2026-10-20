import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Plus, Save, Trash2, X } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import api from "@/services/api";
import { toast } from "sonner";

interface ProductFormState {
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  assemblyPrice?: number;
  thumbnailUrl: string;
  images: string[];
  badge: string;
  shortDescription: string;
  description: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
}

const emptyProduct: ProductFormState = {
  name: "",
  slug: "",
  price: 0,
  oldPrice: undefined,
  assemblyPrice: undefined,
  thumbnailUrl: "",
  images: [],
  badge: "",
  shortDescription: "",
  description: "",
  stockQuantity: 0,
  isActive: true,
  isFeatured: false,
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/[а-яё]/gi, (char) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
        и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
        с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh",
        щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[char.toLowerCase()] ?? "";
    })
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Роут /admin/products/new объявлен БЕЗ :id, поэтому id === undefined —
  // раньше такой заход считался редактированием и PUT уходил на /undefined.
  const isNew = !id || id === "new";
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductFormState>(emptyProduct);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (isNew || !id) return;

      try {
        setLoading(true);
        const response = await api.get(`/admin/products/${id}`);
        const item = response.data.data;
        const images = Array.isArray(item.images) ? item.images : [];

        setProduct({
          name: item.name ?? "",
          slug: item.slug ?? "",
          price: Number(item.price ?? 0),
          oldPrice: item.oldPrice ? Number(item.oldPrice) : undefined,
          assemblyPrice: item.assemblyPrice ? Number(item.assemblyPrice) : undefined,
          thumbnailUrl: item.thumbnailUrl ?? images[0] ?? "",
          images,
          badge: item.badge ?? "",
          shortDescription: item.shortDescription ?? "",
          description: item.description ?? "",
          stockQuantity: item.stockQuantity ?? 0,
          isActive: item.isActive ?? true,
          isFeatured: item.isFeatured ?? false,
        });
      } catch (error) {
        console.error(error);
        toast.error("Товар не найден");
        navigate("/admin/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isNew, navigate]);

  const updateProduct = (patch: Partial<ProductFormState>) => {
    setProduct((current) => ({ ...current, ...patch }));
  };

  const handleNameChange = (name: string) => {
    updateProduct({ name, ...(isNew && !product.slug ? { slug: slugify(name) } : {}) });
  };

  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) return;

    try {
      new URL(url);
    } catch {
      toast.error("Введите корректный URL изображения");
      return;
    }

    const images = [...product.images, url];
    updateProduct({ images, thumbnailUrl: product.thumbnailUrl || url });
    setImageUrl("");
  };

  const removeImage = (index: number) => {
    const images = product.images.filter((_, itemIndex) => itemIndex !== index);
    updateProduct({
      images,
      thumbnailUrl: product.thumbnailUrl === product.images[index] ? images[0] ?? "" : product.thumbnailUrl,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product.name.trim() || !product.slug.trim() || !product.description.trim()) {
      toast.error("Заполните название, slug и описание");
      return;
    }

    if (product.description.trim().length < 10) {
      toast.error("Описание должно содержать минимум 10 символов");
      return;
    }

    if (product.price <= 0) {
      toast.error("Цена должна быть больше нуля");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: product.name.trim(),
        slug: product.slug.trim(),
        price: product.price,
        oldPrice: product.oldPrice || null,
        assemblyPrice: product.assemblyPrice || null,
        thumbnailUrl: product.thumbnailUrl || product.images[0] || null,
        images: product.images,
        badge: product.badge || null,
        shortDescription: product.shortDescription || undefined,
        description: product.description,
        stockQuantity: product.stockQuantity,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      };

      if (isNew) {
        await api.post("/admin/products", payload);
      } else {
        await api.put(`/admin/products/${id}`, payload);
      }

      toast.success(isNew ? "Товар создан" : "Товар обновлен");
      navigate("/admin/products");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Ошибка при сохранении товара");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isNew) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container-x py-6 pb-24 md:pb-10 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-x py-6 pb-24 md:pb-10 max-w-4xl">
        <div className="mb-6">
          <Link to="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-4">
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
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Основная информация</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название товара *</label>
                <input
                  type="text"
                  required
                  value={product.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <input
                  type="text"
                  required
                  value={product.slug}
                  onChange={(e) => updateProduct({ slug: slugify(e.target.value) })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Цена *</label>
                  <input type="number" required min="1" value={product.price} onChange={(e) => updateProduct({ price: Number(e.target.value) })} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Старая цена</label>
                  <input type="number" min="0" value={product.oldPrice || ""} onChange={(e) => updateProduct({ oldPrice: Number(e.target.value) || undefined })} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Цена сборки</label>
                  <input type="number" min="0" value={product.assemblyPrice || ""} onChange={(e) => updateProduct({ assemblyPrice: Number(e.target.value) || undefined })} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Краткое описание</label>
                <input
                  type="text"
                  value={product.shortDescription}
                  onChange={(e) => updateProduct({ shortDescription: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Полное описание *</label>
                <textarea
                  required
                  rows={5}
                  value={product.description}
                  onChange={(e) => updateProduct({ description: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-y"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Изображения</h2>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
              <button type="button" onClick={addImage} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-muted border border-border rounded-lg text-sm">
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div key={image} className="relative group">
                  <img src={image} alt="" className="w-full h-32 object-cover rounded-lg border border-border" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Настройки</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Остаток</label>
                <input type="number" min="0" value={product.stockQuantity} onChange={(e) => updateProduct({ stockQuantity: Number(e.target.value) })} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Бейдж</label>
                <input type="text" value={product.badge} onChange={(e) => updateProduct({ badge: e.target.value })} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent" />
              </div>
              <div className="flex items-end gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={product.isActive} onChange={(e) => updateProduct({ isActive: e.target.checked })} />
                  Активен
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={product.isFeatured} onChange={(e) => updateProduct({ isFeatured: e.target.checked })} />
                  Рекомендуемый
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Link to="/admin/products" className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-muted border border-border rounded-lg font-semibold text-sm transition-colors">
              <X className="w-4 h-4" />
              Отмена
            </Link>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-semibold text-sm transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" />
              {loading ? "Сохранение..." : isNew ? "Создать товар" : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
