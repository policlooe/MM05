// Компонент загрузки отзывов с фото (Ozon style)

import { useState, useRef } from "react";
import { X, Plus, Star, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewUploaderProps {
  productId: string;
  productName: string;
  onSubmit?: (review: ReviewData) => void;
  className?: string;
}

export interface ReviewData {
  rating: number;
  text: string;
  images: File[];
}

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function ReviewUploader({ productId, productName, onSubmit, className }: ReviewUploaderProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработка выбора файлов
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Проверка количества
    if (images.length + files.length > MAX_IMAGES) {
      toast.error(`Максимум ${MAX_IMAGES} фотографий`);
      return;
    }

    // Проверка размера и типа
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} не является изображением`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name} слишком большой (макс. 5MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Создание превью
    const newPreviews: string[] = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages([...images, ...validFiles]);
    
    // Сброс input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Удаление фото
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Отправка отзыва
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Поставьте оценку");
      return;
    }

    if (text.trim().length < 10) {
      toast.error("Напишите отзыв (минимум 10 символов)");
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: ReviewData = {
        rating,
        text: text.trim(),
        images,
      };

      // Вызываем callback если есть
      if (onSubmit) {
        await onSubmit(reviewData);
      }

      // Успех
      toast.success("Отзыв отправлен на модерацию");
      
      // Сброс формы
      setRating(0);
      setText("");
      setImages([]);
      setImagePreviews([]);
    } catch (error) {
      toast.error("Не удалось отправить отзыв");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("bg-surface border border-border rounded-xl p-4", className)}>
      <h3 className="text-base font-semibold mb-3">Оставить отзыв</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Рейтинг */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Ваша оценка <span className="text-destructive">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={cn(
                    "w-7 h-7 transition-colors",
                    (hoverRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-none text-border"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Текст отзыва */}
        <div>
          <label htmlFor="review-text" className="text-sm font-medium mb-2 block">
            Ваш отзыв <span className="text-destructive">*</span>
          </label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Расскажите о своих впечатлениях от товара..."
            rows={4}
            maxLength={1000}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-y text-sm"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">
              Минимум 10 символов
            </span>
            <span className="text-xs text-muted-foreground">
              {text.length}/1000
            </span>
          </div>
        </div>

        {/* Загрузка фото */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Фотографии (до {MAX_IMAGES})
          </label>

          {/* Превью загруженных фото */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
            {imagePreviews.map((preview, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted border border-border group"
              >
                <img
                  src={preview}
                  alt={`Фото ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}

            {/* Кнопка добавления фото */}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent bg-muted/30 hover:bg-accent/5 flex flex-col items-center justify-center gap-1 transition-all group"
              >
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="text-[10px] text-muted-foreground group-hover:text-accent transition-colors">
                  Добавить
                </span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground">
            JPG, PNG, WEBP до 5MB каждое
          </p>
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || text.trim().length < 10}
          className={cn(
            "w-full py-2.5 rounded-lg font-medium text-sm transition-all",
            "bg-accent hover:bg-accent-hover text-accent-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "active:scale-[0.98]"
          )}
        >
          {isSubmitting ? "Отправка..." : "Отправить отзыв"}
        </button>
      </form>
    </div>
  );
}
