import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  quality?: number;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  onClick,
  priority = false,
  quality = 75,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const img = new Image();

    // Generate optimized image URLs with dimensions and quality
    const params = new URLSearchParams({
      w: width?.toString() || 'auto',
      h: height?.toString() || 'auto',
      q: quality.toString(),
    });

    const baseUrl = src.replace(/\.[^/.]+$/, ''); // Remove extension
    const webpSrc = `${baseUrl}.webp?${params.toString()}`;
    const fallbackSrc = `${baseUrl}.jpg?${params.toString()}`;

    img.src = webpSrc;
    setImageSrc(webpSrc);

    img.onload = () => {
      setIsLoading(false);
      setError(false);
    };

    img.onerror = () => {
      // If WebP fails, try fallback
      const fallbackImg = new Image();
      fallbackImg.src = fallbackSrc;
      setImageSrc(fallbackSrc);

      fallbackImg.onload = () => {
        setIsLoading(false);
        setError(false);
      };

      fallbackImg.onerror = () => {
        setIsLoading(false);
        setError(true);
        setImageSrc('/placeholder-image.jpg');
      };
    };

    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = webpSrc;
      document.head.appendChild(link);
    }
  }, [src, width, height, quality, priority]);

  return (
    <picture className={`relative overflow-hidden ${className}`}>
      <source
        type='image/webp'
        srcSet={imageSrc.endsWith('.webp') ? imageSrc : undefined}
      />
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
        width={width}
        height={height}
        onClick={onClick}
        loading={priority ? 'eager' : 'lazy'}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${error ? 'grayscale' : ''} ${onClick ? 'cursor-pointer' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
      />
    </picture>
  );
}
