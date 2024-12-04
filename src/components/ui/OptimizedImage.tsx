import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  onClick,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoading(false);
      setImageSrc(src);
    };
    img.onerror = () => {
      setIsLoading(false);
      setImageSrc('/placeholder-book.jpg');
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-slate-200 animate-pulse'
          />
        )}
      </AnimatePresence>
      <motion.img
        src={imageSrc}
        alt={alt}
        onClick={onClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full h-full object-cover ${onClick ? 'cursor-pointer' : ''}`}
        loading='lazy'
      />
    </div>
  );
}
