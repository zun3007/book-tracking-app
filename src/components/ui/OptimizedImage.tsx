import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { clsx } from 'clsx';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  quality?: number;
  fallbackSrc?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  blur?: boolean;
  placeholderColor?: string;
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
  fallbackSrc = '/placeholder-image.jpg',
  objectFit = 'cover',
  blur = false,
  placeholderColor = 'bg-gray-200 dark:bg-gray-800',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState(0);
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '50px',
  });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const MAX_RETRIES = 3;

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(false);
    setRetryCount(0);
  };

  const handleImageError = async () => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount((prev) => prev + 1);
      await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      loadImage();
    } else {
      setIsLoading(false);
      setError(true);
      if (imgRef.current) {
        imgRef.current.src = fallbackSrc;
      }
    }
  };

  const loadImage = () => {
    if (!imgRef.current) return;

    const params = new URLSearchParams({
      width: width?.toString() || 'auto',
      height: height?.toString() || 'auto',
      quality: quality.toString(),
    });

    // Set the image source directly
    imgRef.current.src = `${src}?${params.toString()}&format=jpeg`;
  };

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setRetryCount(0);

    if (priority || inView) {
      loadImage();
    }

    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [src, width, height, quality, priority, inView]);

  const containerClasses = clsx('relative overflow-hidden', className);

  const imageClasses = clsx('w-full h-full transition-all duration-300', {
    'opacity-0 scale-[1.02]': isLoading,
    'opacity-100 scale-100': !isLoading,
    'grayscale opacity-50': error,
    'cursor-pointer hover:scale-[1.02]': onClick,
    'hover:blur-0': blur,
    'blur-[1px]': blur && !isLoading,
  });

  return (
    <div
      ref={inViewRef}
      className={containerClasses}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
      }}
    >
      <picture>
        <source type='image/webp' srcSet={`${src}?format=webp`} />
        <motion.img
          ref={imgRef}
          alt={alt}
          width={width}
          height={height}
          onClick={onClick}
          loading={priority ? 'eager' : 'lazy'}
          className={imageClasses}
          style={{ objectFit }}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{
            opacity: isLoading ? 0 : 1,
            scale: isLoading ? 1.02 : 1,
          }}
          transition={{ duration: 0.3 }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </picture>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx('absolute inset-0 animate-pulse', placeholderColor)}
          />
        )}
      </AnimatePresence>

      {error && (
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-4'>
          <svg
            className='w-12 h-12 text-gray-400 dark:text-gray-600 mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
          <p className='text-sm text-gray-500 dark:text-gray-400 text-center'>
            Failed to load image
          </p>
        </div>
      )}
    </div>
  );
}
