import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/services/api';
import { toast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  slug: z.string().min(1, 'Slug обязателен'),
  description: z.string().optional(),
  price: z.number().min(0, 'Цена должна быть положительной'),
  oldPrice: z.number().optional(),
  assemblyPrice: z.number().optional(),
  stockQuantity: z.number().min(0, 'Количество не может быть отрицательным'),
  categoryId: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  weight: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      isFeatured: false,
      stockQuantity: 0,
    },
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/products/${id}`);
      const product = response.data.data;

      Object.keys(product).forEach((key) => {
        if (key === 'price' || key === 'oldPrice' || key === 'assemblyPrice') {
          setValue(key as any, product[key] ? Number(product[key]) / 100 : 0);
        } else {
          setValue(key as any, product[key]);
        }
      });

      if (product.images) {
        setImages(product.images);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить товар',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      setLoading(true);

      const payload = {
        ...data,
        price: Math.round(data.price * 100),
        oldPrice: data.oldPrice ? Math.round(data.oldPrice * 100) : null,
        assemblyPrice: data.assemblyPrice ? Math.round(data.assemblyPrice * 100) : null,
        images,
      };

      if (isEdit) {
        await api.put(`/admin/products/${id}`, payload);
        toast({
          title: 'Успешно',
          description: 'Товар обновлен',
        });
      } else {
        await api.post('/admin/products', payload);
        toast({
          title: 'Успешно',
          description: 'Товар создан',
        });
      }

      navigate('/admin/products');
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.response?.data?.message || 'Не удалось сохранить товар',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });

      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImages([...images, ...response.data.data.urls]);
      toast({
        title: 'Успешно',
        description: 'Изображения загружены',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить изображения',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (loading && isEdit) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад к товарам
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Редактировать товар' : 'Создать товар'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? 'Обновите информацию о товаре' : 'Добавьте новый товар в каталог'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Основная информация */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Основная информация</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Например: Кровать двуспальная"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="krovat-dvuspalnaya"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Подробное описание товара"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Категория</Label>
              <Select
                onValueChange={(value) => setValue('categoryId', value)}
                defaultValue={watch('categoryId')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Цены */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Цены</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Цена (₽) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="oldPrice">Старая цена (₽)</Label>
                <Input
                  id="oldPrice"
                  type="number"
                  step="0.01"
                  {...register('oldPrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assemblyPrice">Цена сборки (₽)</Label>
                <Input
                  id="assemblyPrice"
                  type="number"
                  step="0.01"
                  {...register('assemblyPrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Характеристики */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Характеристики</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dimensions">Размеры</Label>
                <Input
                  id="dimensions"
                  {...register('dimensions')}
                  placeholder="200x180x90 см"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">Материал</Label>
                <Input
                  id="material"
                  {...register('material')}
                  placeholder="Массив сосны"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Вес</Label>
                <Input
                  id="weight"
                  {...register('weight')}
                  placeholder="50 кг"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Количество на складе *</Label>
              <Input
                id="stockQuantity"
                type="number"
                {...register('stockQuantity', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.stockQuantity && (
                <p className="text-sm text-destructive">{errors.stockQuantity.message}</p>
              )}
            </div>
          </div>

          {/* Изображения */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Изображения</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {uploadingImage ? 'Загрузка...' : 'Загрузить'}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          {/* Настройки */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Настройки</h2>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isActive">Активен</Label>
                <p className="text-sm text-muted-foreground">
                  Товар будет виден в каталоге
                </p>
              </div>
              <Switch
                id="isActive"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isFeatured">Рекомендуемый</Label>
                <p className="text-sm text-muted-foreground">
                  Показывать на главной странице
                </p>
              </div>
              <Switch
                id="isFeatured"
                checked={watch('isFeatured')}
                onCheckedChange={(checked) => setValue('isFeatured', checked)}
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent-hover">
              {loading ? 'Сохранение...' : isEdit ? 'Обновить товар' : 'Создать товар'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
