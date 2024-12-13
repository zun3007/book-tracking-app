import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleFavorite } from './bookSlice';
import type { Book } from '../../types/supabase';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import OptimizedImage from '../../components/ui/OptimizedImage';
import { animations } from '../../config/animations';
import clsx from 'clsx';

const statusConfig = {
  reading: {
    label: 'Reading',
    color: 'blue',
    animation: {
      y: [-1, 1, -1],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
    },
  },
  finished: {
    label: 'Finished',
    color: 'green',
    animation: {
      scale: [1, 1.05, 1],
      transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
    },
  },
} as const;

interface BookCardProps {
  book: Book;
  index?: number;
  onFavoriteToggle?: () => void;
  size?: 'tiny' | 'small' | 'medium' | 'large';
}

export default function BookCard({
  book,
  index = 0,
  onFavoriteToggle,
  size = 'medium',
}: BookCardProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isFavorite, setIsFavorite] = useState(false);
  const [readStatus, setReadStatus] = useState<'none' | 'reading' | 'finished'>(
    'none'
  );

  useEffect(() => {
    const fetchBookStatus = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('user_books')
        .select('favorite, read_status')
        .eq('user_id', user.id)
        .eq('book_id', book.id)
        .single();

      if (!error && data) {
        setIsFavorite(data.favorite);
        setReadStatus(data.read_status || 'none');
      }
    };

    fetchBookStatus();
  }, [book.id, user?.id]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;

    try {
      await dispatch(
        toggleFavorite({
          bookId: book.id,
          userId: user.id,
        })
      ).unwrap();

      setIsFavorite(!isFavorite);
      onFavoriteToggle?.();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const imageDimensions = {
    tiny: { width: 200, height: 300 },
    small: { width: 300, height: 450 },
    medium: { width: 320, height: 480 },
    large: { width: 400, height: 600 },
  };

  const { width, height } = imageDimensions[size];

  return (
    <motion.div
      layout
      variants={animations.stagger}
      whileHover={animations.hover}
      whileTap={animations.tap}
      onClick={() => navigate(`/book/${book.id}`)}
      className={clsx(
        'group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300',
        size === 'tiny' && 'max-w-[200px]',
        size === 'small' && 'max-w-[300px]',
        size === 'medium' && 'max-w-[320px]',
        size === 'large' && 'max-w-[400px]'
      )}
    >
      <div className='relative w-full pt-[150%] overflow-hidden'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className='absolute inset-0'
        >
          <OptimizedImage
            src={book.thumbnail || '/placeholder-book.jpg'}
            alt={book.title}
            width={width}
            height={height}
            objectFit='cover'
            className='w-full h-full transform transition-transform duration-300 group-hover:scale-105'
            priority={index < 4}
            placeholderColor='bg-gray-200 dark:bg-gray-700'
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent'
          />

          {/* Reading Status Badge */}
          {readStatus !== 'none' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className='absolute top-2 left-2'
            >
              <motion.div
                className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  backdrop-blur-sm shadow-sm
                  ${
                    readStatus === 'reading'
                      ? 'bg-blue-100/80 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-green-100/80 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }
                `}
                animate={statusConfig[readStatus].animation}
              >
                {statusConfig[readStatus].label}
              </motion.div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            className='absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center'
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleFavorite}
              className='p-2 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg'
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              />
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className='text-white text-sm font-medium'
            >
              ⭐ {book.average_rating.toFixed(1)}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className='p-4'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        <h3 className='font-semibold text-gray-800 dark:text-gray-100 text-lg mb-1 truncate'>
          {book.title}
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-300 truncate'>
          {book.authors?.join(', ')}
        </p>
      </motion.div>
    </motion.div>
  );
}
