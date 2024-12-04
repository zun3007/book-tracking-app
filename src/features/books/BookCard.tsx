import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Heart,
  BookOpen,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleFavorite, updateReadStatus } from './bookSlice';
import type { Book } from '../../types/supabase';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import OptimizedImage from '../../components/ui/OptimizedImage';
import ReadStatusButton from '../../components/ui/ReadStatusButton';
import { animations } from '../../config/animations';

interface BookCardProps {
  book: Book;
  index?: number;
  onFavoriteToggle?: () => void;
  showReadStatus?: boolean;
  onReadStatusChange?: (newStatus: 'none' | 'reading' | 'finished') => void;
}

export default function BookCard({
  book,
  index = 0,
  onFavoriteToggle,
  showReadStatus = false,
  onReadStatusChange,
}: BookCardProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('user_books')
        .select('favorite')
        .eq('user_id', user.id)
        .eq('book_id', book.id)
        .single();

      if (!error && data) {
        setIsFavorite(data.favorite);
      }
    };

    checkFavoriteStatus();
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

      // Update local state
      setIsFavorite(!isFavorite);
      onFavoriteToggle?.();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
    setShowDropdown(false);
  };

  const handleReadStatusClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;

    const currentStatus = book.read_status || 'none';
    const nextStatus =
      currentStatus === 'none'
        ? 'reading'
        : currentStatus === 'reading'
        ? 'finished'
        : 'none';

    try {
      await dispatch(
        updateReadStatus({
          bookId: book.id,
          userId: user.id,
          status: nextStatus,
        })
      ).unwrap();

      onReadStatusChange?.(nextStatus);
      toast.success(
        `Book marked as ${
          nextStatus === 'none'
            ? 'not started'
            : nextStatus === 'reading'
            ? 'currently reading'
            : 'finished'
        }`
      );
    } catch (error) {
      console.error('Error updating read status:', error);
      toast.error('Failed to update reading status');
    }
  };

  return (
    <motion.div
      layout
      variants={animations.stagger}
      whileHover={animations.hover}
      whileTap={animations.tap}
      onClick={() => navigate(`/book/${book.id}`)}
      className='group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300'
    >
      <div className='relative w-full pt-[140%] overflow-hidden'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className='absolute inset-0'
        >
          <OptimizedImage
            src={book.thumbnail || '/placeholder-book.jpg'}
            alt={book.title}
            className='w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105'
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent'
          />

          {/* Status Badge */}
          {showReadStatus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className='absolute top-2 left-2'
            >
              <ReadStatusButton
                status={book.read_status || 'none'}
                onClick={handleReadStatusClick}
                size='sm'
              />
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
              className='p-2 rounded-full bg-white/90 dark:bg-gray-800/90'
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
