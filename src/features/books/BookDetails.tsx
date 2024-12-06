import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import OptimizedImage from '../../components/ui/OptimizedImage';
import { Book } from '../../types';
import { BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../app/hooks';
import { updateReadStatus } from './bookSlice';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface BookDetailsProps {
  book: Book;
  favorites: Book[];
  handleRatingChange: (rating: number) => void;
  handleToggleFavorite: () => void;
  user: { id: string } | null;
}

const readingStatusConfig = {
  none: {
    icon: Clock,
    label: 'Not Started',
    color: 'gray',
    emoji: '📚',
    description: 'Start your reading journey',
    animation: {
      hover: { scale: 1.02, y: -2, transition: { duration: 0.2 } },
      tap: { scale: 0.98 },
      active: {
        y: [0, -2, 0],
        transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
      },
    },
    motivationalText: 'Ready to begin a new adventure?',
  },
  reading: {
    icon: BookOpen,
    label: 'Reading',
    color: 'blue',
    emoji: '📖',
    description: 'Currently reading',
    animation: {
      hover: { scale: 1.02, transition: { duration: 0.2 } },
      tap: { scale: 0.98 },
      active: {
        rotate: [-2, 2, -2],
        transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
      },
    },
    motivationalText: 'Enjoy the journey!',
  },
  finished: {
    icon: CheckCircle2,
    label: 'Finished',
    color: 'green',
    emoji: '🎉',
    description: 'Completed',
    animation: {
      hover: { scale: 1.02, y: -2, transition: { duration: 0.2 } },
      tap: { scale: 0.98 },
      active: {
        scale: [1, 1.05, 1],
        transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
      },
    },
    motivationalText: 'Great achievement!',
  },
} as const;

export default function BookDetails({
  book,
  favorites,
  handleRatingChange,
  handleToggleFavorite,
  user,
}: BookDetailsProps) {
  const dispatch = useAppDispatch();
  const [currentStatus, setCurrentStatus] = useState<
    'none' | 'reading' | 'finished'
  >(book.read_status || 'none');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleReadStatusChange = async (
    status: 'none' | 'reading' | 'finished'
  ) => {
    if (!user?.id || isUpdating) return;

    try {
      setIsUpdating(true);
      await dispatch(
        updateReadStatus({
          bookId: book.id,
          userId: user.id,
          status,
        })
      ).unwrap();

      setCurrentStatus(status);

      if (status === 'finished') {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }

      toast.success(
        <div className='flex items-center gap-2'>
          <span>{readingStatusConfig[status].emoji}</span>
          <span>
            {status === 'none'
              ? 'Added to reading list'
              : status === 'reading'
                ? 'Happy reading!'
                : 'Congratulations on finishing!'}
          </span>
        </div>
      );
    } catch (error) {
      console.error('Error updating read status:', error);
      toast.error('Failed to update reading status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Image Section */}
        <div className='lg:w-1/3'>
          <div className='sticky top-8'>
            <div className='aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800'>
              <OptimizedImage
                src={book.thumbnail || '/placeholder-book.jpg'}
                alt={book.title}
                className='w-full h-full object-cover'
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className='lg:w-2/3 space-y-8'>
          {/* Title and Author */}
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold text-gray-900 dark:text-gray-50 tracking-tight'>
              {book.title}
            </h1>
            <p className='text-xl text-gray-600 dark:text-gray-400'>
              by {book.authors?.join(', ')}
            </p>
          </div>

          {/* Rating and Favorites */}
          <div className='flex flex-wrap items-center gap-6'>
            <div className='flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2'>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  disabled={!user}
                  className={`w-8 h-8 transform transition-all duration-200 ${
                    rating <= (book.userRating || 0)
                      ? 'text-amber-400 scale-110'
                      : 'text-gray-300 dark:text-gray-600 hover:scale-105'
                  } disabled:cursor-not-allowed`}
                >
                  ⭐
                </button>
              ))}
            </div>

            <button
              onClick={handleToggleFavorite}
              disabled={!user}
              className='flex items-center gap-2 px-4 py-2 rounded-lg 
                ${favorites.some((f) => f.id === book.id)
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"}
                hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {favorites.some((f) => f.id === book.id) ? (
                <HeartSolidIcon className='w-5 h-5 text-red-500' />
              ) : (
                <HeartIcon className='w-5 h-5' />
              )}
              <span>
                {favorites.some((f) => f.id === book.id)
                  ? 'Remove from Favorites'
                  : 'Add to Favorites'}
              </span>
            </button>
          </div>

          {/* Description */}
          <div className='prose prose-lg prose-gray dark:prose-invert max-w-none'>
            <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
              {book.description}
            </p>
          </div>

          {/* Book Details */}
          <div className='rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 space-y-4'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
              Book Details
            </h2>
            <dl className='grid sm:grid-cols-2 gap-6'>
              {[
                { label: 'ISBN', value: book.isbn },
                { label: 'Published', value: book.published_date },
                {
                  label: 'Rating',
                  value: `⭐ ${book.average_rating.toFixed(1)} (${book.ratings_count.toLocaleString()} ratings)`,
                },
                { label: 'Genres', value: book.genres?.join(', ') },
              ].map(({ label, value }) => (
                <div key={label} className='space-y-1'>
                  <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    {label}
                  </dt>
                  <dd className='text-base text-gray-900 dark:text-gray-100'>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Reading Progress */}
          <div className='space-y-6'>
            <motion.div
              className='flex items-center gap-3'
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className='p-2.5 rounded-full bg-blue-50 dark:bg-blue-900/20'
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <BookOpen className='w-6 h-6 text-blue-500' />
              </motion.div>
              <h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
                Reading Progress
              </h2>
            </motion.div>

            <div className='grid sm:grid-cols-3 gap-4'>
              <AnimatePresence mode='wait'>
                {Object.entries(readingStatusConfig).map(([status, config]) => {
                  const Icon = config.icon;
                  const isActive = currentStatus === status;

                  return (
                    <motion.button
                      key={status}
                      onClick={() =>
                        handleReadStatusChange(
                          status as keyof typeof readingStatusConfig
                        )
                      }
                      disabled={isUpdating}
                      className={`
                        relative p-4 rounded-xl border transition-all duration-300
                        ${
                          isActive
                            ? `border-${config.color}-500/50 bg-${config.color}-50/50 dark:bg-${config.color}-900/20`
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                        group overflow-hidden
                        hover:shadow-lg hover:shadow-${config.color}-500/10
                      `}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={config.animation.hover}
                      whileTap={config.animation.tap}
                    >
                      {/* Background glow effect */}
                      {isActive && (
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br from-${config.color}-500/10 to-transparent`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: [0.3, 0.5, 0.3],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}

                      <div className='relative z-10 flex flex-col items-center gap-3'>
                        <motion.div
                          className={`
                            w-12 h-12 rounded-lg flex items-center justify-center
                            ${
                              isActive
                                ? `bg-${config.color}-100 text-${config.color}-600 dark:bg-${config.color}-900/30 dark:text-${config.color}-400`
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            }
                            transition-colors duration-300
                          `}
                          animate={isActive ? config.animation.active : {}}
                        >
                          <Icon className='w-6 h-6' />
                        </motion.div>

                        <div className='text-center space-y-1'>
                          <div className='flex items-center justify-center gap-1.5'>
                            <span
                              className={`font-medium ${
                                isActive
                                  ? `text-${config.color}-700 dark:text-${config.color}-400`
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {config.label}
                            </span>
                            <motion.span
                              initial={false}
                              animate={{
                                scale: isActive ? 1 : 0,
                                rotate: isActive ? [0, 10, -10, 0] : 0,
                              }}
                              className='text-base'
                            >
                              {config.emoji}
                            </motion.span>
                          </div>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            {config.description}
                          </p>
                        </div>
                      </div>

                      {/* Motivational text */}
                      <motion.div
                        className={`absolute inset-x-0 bottom-0 py-1 text-xs text-center
                          ${isActive ? `text-${config.color}-600 dark:text-${config.color}-400` : 'text-gray-400'}
                        `}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: isActive ? 1 : 0,
                          y: isActive ? 0 : 10,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {config.motivationalText}
                      </motion.div>

                      {/* Celebration effect */}
                      <AnimatePresence>
                        {showCelebration && status === 'finished' && (
                          <motion.div
                            className='absolute inset-0 pointer-events-none'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {[...Array(12)].map((_, i) => (
                              <motion.div
                                key={i}
                                className='absolute'
                                initial={{
                                  x: '50%',
                                  y: '50%',
                                  scale: 0,
                                }}
                                animate={{
                                  x: `${Math.random() * 100}%`,
                                  y: `${Math.random() * 100}%`,
                                  scale: [0, 1, 0],
                                  rotate: [0, 360],
                                }}
                                transition={{
                                  duration: 1,
                                  delay: i * 0.1,
                                  ease: [0.4, 0, 0.2, 1],
                                }}
                              >
                                <Sparkles className='w-3 h-3 text-yellow-400 drop-shadow' />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
