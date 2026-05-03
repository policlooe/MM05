import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export function ImageLightbox({ 
  images, 
  initialIndex, 
  isOpen, 
  onClose, 
  productName 
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Минимальное расстояние свайпа (в px)
  const minSwipeDistance = 50;

  // Синхронизация индекса при изменении initialIndex
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Блокировка скролла body при открытии
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Навигация клавиатурой
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Touch handlers для свайпов
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Кнопка закрытия */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-[110] p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors"
            aria-label="Закрыть галерею"
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>

          {/* Счетчик изображений */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.15 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium"
          >
            {currentIndex + 1} / {images.length}
          </motion.div>

          {/* Контейнер изображения */}
          <div
            className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence mode="wait" custom={currentIndex}>
              <motion.img
                key={currentIndex}
                src={images[currentIndex]}
                alt={`${productName} - фото ${currentIndex + 1}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-full max-h-full object-contain rounded-lg"
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {/* Кнопки навигации - только если больше 1 изображения */}
          {images.length > 1 && (
            <>
              {/* Предыдущее */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </motion.button>

              {/* Следующее */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors"
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </motion.button>
            </>
          )}

          {/* Миниатюры внизу (скрыты при просмотре) */}
          {images.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.25 }}
              className="hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-[110] gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-white/10 backdrop-blur-md rounded-full scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    "shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                    currentIndex === idx
                      ? "border-white opacity-100 scale-110"
                      : "border-white/30 opacity-60 hover:opacity-80"
                  )}
                >
                  <img
                    src={img}
                    alt={`Миниатюра ${idx + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
