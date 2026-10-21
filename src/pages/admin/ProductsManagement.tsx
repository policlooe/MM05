import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  AlertCircle
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import api from "@/services/api";
import { toast } from "sonner";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  oldPrice?: number | string | null;
  thumbnailUrl?: string | null;
  images?: string[] | string | null;
  stockQuantity: number;
  isActive: boolean;
  category?: {
    name: string;
  } | null;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/products?limit=100");
      setProducts(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось загрузить товары");
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(
    new Set(products.map((product) => product.category?.name).filter(Boolean))
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (productId: string) => {
    // Мягкое удаление: товар скрывается из каталога, но остаётся в истории заказов
    if (confirm("Скрыть товар из каталога? Он останется в истории заказов и отзывах.")) {
      try {
        await api.delete(`/admin/products/${productId}`);
        setProducts(products.filter(p => p.id !== productId));
        toast.success("Товар скрыт из каталога");
      } catch (error) {
        console.error(error);
        toast.error("Не удалось скрыть товар");
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
  };

  const getProductImage = (product: AdminProduct) => {
    if (product.thumbnailUrl) return product.thumbnailUrl;
    if (Array.isArray(product.images)) return product.images[0];
    return "/og.jpg";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-semibold mb-2">Управление товарами</h1>
            <p className="text-muted-foreground">
              Всего товаров: {filteredProducts.length}
            </p>
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-3 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-semibold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить товар
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            >
              <option value="all">Все категории</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Товары не найдены</h3>
            <p className="text-muted-foreground mb-4">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Товар</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Категория</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Цена</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Статус</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-1 bg-secondary rounded-md text-xs font-medium">
                          {product.category?.name || "Без категории"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-sm">{formatPrice(Number(product.price))}</p>
                          {product.oldPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(Number(product.oldPrice))}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {product.isActive && product.stockQuantity > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            В наличии: {product.stockQuantity}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Нет в наличии
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${product.slug}`}
                            target="_blank"
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Просмотр"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Редактировать"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Alert */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 mb-1">
              Совет по управлению товарами
            </p>
            <p className="text-sm text-blue-700">
              Регулярно обновляйте информацию о наличии товаров и цены. 
              Используйте качественные фотографии и подробные описания для лучших продаж.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
