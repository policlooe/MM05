import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollLock } from '@/hooks/useScrollLock';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageLightbox({ images, currentIndex, isOpen, onClose, onNavigate }: ImageLightboxProps) {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <button 
          className="absolute top-6 right-6 z-[110] p-2 text-white/70 hover:text-white transition-colors"
          onClick={onClose}
        >
          <X className="w-8 h-8" />
        </button>

        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 z-[110] p-3 text-white/50 hover:text-white bg-white/5 rounded-full transition-all"
              onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + images.length) % images.length); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              className="absolute right-4 z-[110] p-3 text-white/50 hover:text-white bg-white/5 rounded-full transition-all"
              onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % images.length); }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        <motion.img
          key={currentIndex}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={images[currentIndex]}
          className="max-w-full max-h-full object-contain select-none shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
