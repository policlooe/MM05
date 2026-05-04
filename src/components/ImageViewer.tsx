import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageViewerProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  setIndex: (index: number) => void;
}

export default function ImageViewer({ images, currentIndex, onClose, setIndex }: ImageViewerProps) {
  const total = images.length;

  const next = () => setIndex((currentIndex + 1) % total);
  const prev = () => setIndex((currentIndex - 1 + total) % total);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      {/* Счетчик */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
        {currentIndex + 1} / {total}
      </div>

      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/10 p-2 rounded-full transition"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Изображение */}
      <img
        src={images[currentIndex]}
        alt={`Фото ${currentIndex + 1}`}
        className="max-h-full max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Кнопка назад */}
      {total > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-4 text-white text-3xl hover:bg-white/10 p-2 rounded-full transition"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Кнопка вперед */}
      {total > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-4 text-white text-3xl hover:bg-white/10 p-2 rounded-full transition"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}
