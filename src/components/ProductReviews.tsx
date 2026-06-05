import { useState, useEffect, useMemo } from "react";
import { Star, User as UserIcon, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewUploader, type ReviewData } from "./ReviewUploader";

// Тип для отзыва
interface Review {
  id: string;
  productId: string; // ID товара, к которому привязан отзыв
  userName: string;
  rating: number;
  text: string;
  date: string;
  images?: string[]; // Base64 encoded images
}

// Тип для сортировки
type SortType = "newest" | "highest" | "lowest";

interface ProductReviewsProps {
  productId: string; // ID товара для фильтрации отзывов
  productName: string; // Название товара для отображения
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  // Состояние для всех отзывов (из localStorage)
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  
  // Состояние для формы нового отзыва
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  
  // Состояние для сортировки
  const [sortBy, setSortBy] = useState<SortType>("newest");
  
  // Состояние для показа формы
  const [showForm, setShowForm] = useState(false);

  // Загрузка всех отзывов из localStorage при монтировании компонента
  useEffect(() => {
    const savedReviews = localStorage.getItem("mm05-reviews");
    if (savedReviews) {
      try {
        setAllReviews(JSON.parse(savedReviews));
      } catch (error) {
        console.error("Ошибка загрузки отзывов:", error);
      }
    }
  }, []);

  // Сохранение отзывов в localStorage при изменении
  useEffect(() => {
    if (allReviews.length > 0) {
      localStorage.setItem("mm05-reviews", JSON.stringify(allReviews));
    }
  }, [allReviews]);

  // Фильтрация отзывов для текущего товара
  const productReviews = useMemo(() => {
    return allReviews.filter((review) => review.productId === productId);
  }, [allReviews, productId]);

  // Вычисление среднего рейтинга для текущего товара
  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / productReviews.length;
  }, [productReviews]);

  // Сортировка отзывов
  const sortedReviews = useMemo(() => {
    const sorted = [...productReviews];
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [productReviews, sortBy]);

  // Обработка отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (!userName.trim()) {
      alert("Пожалуйста, введите ваше имя");
      return;
    }
    if (rating === 0) {
      alert("Пожалуйста, поставьте оценку");
      return;
    }
    if (!reviewText.trim()) {
      alert("Пожалуйста, напишите отзыв");
      return;
    }

    // Создание нового отзыва
    const newReview: Review = {
      id: Date.now().toString(),
      productId, // Привязываем к текущему товару
      userName: userName.trim(),
      rating,
      text: reviewText.trim(),
      date: new Date().toISOString(),
    };

    // Добавление отзыва в общий список
    setAllReviews([newReview, ...allReviews]);

    // Очистка формы
    setUserName("");
    setRating(0);
    setReviewText("");
    setShowForm(false);
  };

  // Компонент звезды для отображения рейтинга
  const StarDisplay = ({ filled }: { filled: boolean }) => (
    <Star
      className={cn(
        "w-4 h-4 transition-colors",
        filled ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
      )}
    />
  );

  // Компонент интерактивной звезды для формы
  const StarInput = ({ index }: { index: number }) => {
    const filled = (hoverRating || rating) >= index;
    return (
      <button
        type="button"
        onMouseEnter={() => setHoverRating(index)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setRating(index)}
        className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/40 rounded"
        aria-label={`Поставить оценку ${index} из 5`}
      >
        <Star
          className={cn(
            "w-8 h-8 transition-all",
            filled ? "fill-amber-400 text-amber-400" : "fill-muted/30 text-muted hover:text-amber-300"
          )}
        />
      </button>
    );
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Сегодня";
    if (diffDays === 1) return "Вчера";
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section className="mt-8 pt-8 border-t border-border">
      {/* Заголовок и статистика */}
      <div className="mb-6">
        <h2 className="font-serif text-xl md:text-2xl font-semibold mb-4">Отзывы о товаре</h2>
        
        {/* Средний рейтинг */}
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Общая оценка */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground mb-1">
                  {productReviews.length > 0 ? averageRating.toFixed(1) : "—"}
                </div>
                <div className="flex gap-1 justify-center mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarDisplay key={star} filled={star <= averageRating} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {productReviews.length} {productReviews.length === 1 ? "отзыв" : productReviews.length < 5 ? "отзыва" : "отзывов"}
                </p>
              </div>

              {/* Распределение оценок */}
              {productReviews.length > 0 && (
                <div className="flex-1 space-y-1.5 min-w-[180px]">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = productReviews.filter((r) => r.rating === star).length;
                    const percentage = productReviews.length > 0 ? (count / productReviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground w-3">{star}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Кнопка добавить отзыв */}
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-semibold transition-colors shadow-sm text-sm whitespace-nowrap"
            >
              {showForm ? "Отменить" : "Написать отзыв"}
            </button>
          </div>
        </div>
      </div>

      {/* Форма добавления отзыва */}
      {showForm && (
        <div className="mb-6 animate-fade-in-up">
          <ReviewUploader
            productId={productId}
            productName={productName}
            onSubmit={async (reviewData: ReviewData) => {
              // Конвертируем изображения в base64
              const imagePromises = reviewData.images.map((file) => {
                return new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (e) => resolve(e.target?.result as string);
                  reader.readAsDataURL(file);
                });
              });

              const images = await Promise.all(imagePromises);

              // Создаем новый отзыв
              const newReview: Review = {
                id: Date.now().toString(),
                productId,
                userName: "Покупатель", // Можно добавить поле для имени
                rating: reviewData.rating,
                text: reviewData.text,
                date: new Date().toISOString(),
                images,
              };

              // Добавляем в список
              setAllReviews([newReview, ...allReviews]);
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* Список отзывов */}
      {productReviews.length > 0 && (
        <div id={`reviews-list-${productId}`}>
          {/* Сортировка */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Все отзывы ({productReviews.length})</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-3 py-2 bg-secondary border border-border rounded-lg text-xs focus:border-accent/35 focus:outline-none focus:ring-2 focus:ring-accent/18 transition-all"
            >
              <option value="newest">Сначала новые</option>
              <option value="highest">Сначала лучшие</option>
              <option value="lowest">Сначала худшие</option>
            </select>
          </div>

          {/* Карточки отзывов */}
          <div className="space-y-3">
            {sortedReviews.map((review) => (
              <article
                key={review.id}
                className="bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Шапка отзыва */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    {/* Аватар */}
                    <div className="w-9 h-9 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-accent" />
                    </div>
                    {/* Имя и дата */}
                    <div>
                      <p className="font-semibold text-sm">{review.userName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
                    </div>
                  </div>
                  {/* Звезды */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarDisplay key={star} filled={star <= review.rating} />
                    ))}
                  </div>
                </div>

                {/* Текст отзыва */}
                <p className="text-sm text-foreground/90 leading-relaxed mb-3">{review.text}</p>

                {/* Фотографии отзыва */}
                {review.images && review.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {review.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden bg-muted border border-border cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={image}
                          alt={`Фото ${index + 1} к отзыву`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Пустое состояние */}
      {productReviews.length === 0 && !showForm && (
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-2">Пока нет отзывов</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Станьте первым, кто оставит отзыв об этом товаре
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-accent-foreground rounded-lg font-semibold transition-colors shadow-sm text-sm"
          >
            Написать первый отзыв
          </button>
        </div>
      )}
    </section>
  );
}
