import { useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MoreVertical, Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleFavorite, fetchFavorites } from './bookSlice';
import type { Book } from '../../types';
import OptimizedImage from '../../components/ui/OptimizedImage';

interface BookCardProps {
  book: Book;
  index?: number;
  onFavoriteToggle?: () => void;
}

export default function BookCard({
  book,
  index = 0,
  onFavoriteToggle,
}: BookCardProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const favorites = useAppSelector((state) => state.books.favorites);
  const isFavorite = favorites.some((f) => f.id === book.id);

  useLayoutEffect(() => {
    if (user?.id) {
      dispatch(fetchFavorites(user.id));
    }
  }, [user?.id, dispatch]);

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

      onFavoriteToggle?.();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
    setShowDropdown(false);
  };

  return (
    <div
      onClick={() => navigate(`/book/${book.id}`)}
      className='group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md overflow-hidden cursor-pointer transition-all duration-300'
    >
      <div className='relative w-full pt-[140%] overflow-hidden'>
        <div className='absolute inset-0'>
          <OptimizedImage
            src={book.thumbnail || '/placeholder-book.jpg'}
            alt={book.title}
            className='w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105'
          />
          <motion.div
            className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />

          {/* Dropdown Menu */}
          <div className='absolute top-2 right-2'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className='p-1 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 transition-colors'
            >
              <MoreVertical className='w-5 h-5 text-gray-600 dark:text-gray-400' />
            </button>

            {showDropdown && (
              <div className='absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50'>
                <button
                  onClick={handleToggleFavorite}
                  className='w-full px-4 py-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                    }`}
                  />
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <motion.div
        className='p-4 bg-white dark:bg-gray-800'
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        <h3
          className='font-semibold text-gray-800 dark:text-gray-100 text-lg mb-1 truncate'
          title={book.title}
        >
          {book.title}
        </h3>
        <p
          className='text-sm text-gray-600 dark:text-gray-300 mb-2 truncate'
          title={book.authors?.join(', ')}
        >
          {book.authors?.join(', ')}
        </p>
        <div className='flex items-center justify-between text-sm'>
          <span className='flex items-center text-amber-500'>
            ⭐ {book.average_rating.toFixed(1)}
          </span>
          <span className='text-gray-500 dark:text-gray-400'>
            {book.ratings_count.toLocaleString()} ratings
          </span>
        </div>
      </motion.div>
    </div>
  );
}
