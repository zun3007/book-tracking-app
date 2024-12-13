import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import OptimizedImage from '../../components/ui/OptimizedImage';
import { Book, UserBook } from '../../types';
import { BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { updateReadStatus, fetchUserBooks } from './bookSlice';
import { useLayoutEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface BookDetailsProps {
  book: Book;
  favorites: Book[];
  handleRatingChange: (rating: number) => void;
  handleToggleFavorite: () => void;
  user: { id: string } | null;
}

type ReadStatus = 'none' | 'reading' | 'finished';

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
  const userBooks = useAppSelector((state) => state.books.userBooks);
  const [currentStatus, setCurrentStatus] = useState<ReadStatus>('none');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const getCurrentReadStatus = useCallback(
    (bookId: number, userBooks: UserBook[]): ReadStatus => {
      const userBook = userBooks.find((ub) => ub.book_id === bookId);
      return (userBook?.read_status as ReadStatus) || 'none';
    },
    []
  );

  // Initial fetch of user books if needed
  useLayoutEffect(() => {
    if (user?.id && userBooks.length === 0) {
      dispatch(fetchUserBooks(user.id));
    }
  }, [user?.id, userBooks.length, dispatch]);

  // Sync with userBooks data
  useLayoutEffect(() => {
    if (user?.id) {
      const newStatus = getCurrentReadStatus(book.id, userBooks);
      if (newStatus !== currentStatus) {
        setCurrentStatus(newStatus);
      }
    } else {
      setCurrentStatus('none');
    }
  }, [user?.id, userBooks, book.id, currentStatus, getCurrentReadStatus]);

  const handleReadStatusChange = async (status: ReadStatus) => {
    if (!user?.id || isUpdating) return;

    try {
      setIsUpdating(true);
      const result = await dispatch(
        updateReadStatus({
          bookId: book.id,
          userId: user.id,
          status,
        })
      ).unwrap();

      if (result) {
        // Fetch updated user books to ensure sync
        await dispatch(fetchUserBooks(user.id));

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
      }
    } catch (error) {
      console.error('Error updating read status:', error);
      toast.error('Failed to update reading status');
      // Revert to previous status on error
      setCurrentStatus(getCurrentReadStatus(book.id, userBooks));
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
            <div className='aspect-[2/3] w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800'>
              <OptimizedImage
                src={book.thumbnail || '/placeholder-book.jpg'}
                alt={book.title}
                width={400}
                height={600}
                objectFit='cover'
                className='w-full h-full'
                priority={true}
                placeholderColor='bg-gray-200 dark:bg-gray-700'
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
          <section
            aria-labelledby='reading-progress-title'
            className='space-y-8 rounded-2xl bg-white/80 dark:bg-gray-800/40 p-8 shadow-lg ring-1 ring-gray-900/10 dark:ring-white/10 backdrop-blur-sm'
          >
            <motion.header
              className='flex items-center gap-4'
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className='p-3.5 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 shadow-md ring-1 ring-blue-500/20 dark:ring-blue-400/20'
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <BookOpen
                  className='w-7 h-7 text-blue-600 dark:text-blue-300 drop-shadow-sm'
                  aria-hidden='true'
                />
              </motion.div>
              <h2
                id='reading-progress-title'
                className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300'
              >
                Reading Progress
              </h2>
            </motion.header>

            <div
              className='grid sm:grid-cols-3 gap-6'
              role='radiogroup'
              aria-label='Reading status selection'
            >
              <AnimatePresence mode='wait'>
                {Object.entries(readingStatusConfig).map(([status, config]) => {
                  const Icon = config.icon;
                  const isActive = currentStatus === status;
                  const colorClasses = {
                    gray: {
                      bg: 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50',
                      border: 'border-gray-200 dark:border-gray-700',
                      text: 'text-gray-700 dark:text-gray-200',
                      hover: 'hover:border-gray-300 dark:hover:border-gray-600',
                      active: {
                        bg: 'bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800',
                        text: 'text-gray-900 dark:text-white',
                        icon: 'text-gray-700 dark:text-gray-200',
                      },
                    },
                    blue: {
                      bg: 'bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-900/30 dark:to-blue-900/10',
                      border: 'border-blue-200 dark:border-blue-800',
                      text: 'text-blue-700 dark:text-blue-200',
                      hover: 'hover:border-blue-300 dark:hover:border-blue-700',
                      active: {
                        bg: 'bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-800/40 dark:to-blue-900/20',
                        text: 'text-blue-900 dark:text-blue-100',
                        icon: 'text-blue-600 dark:text-blue-300',
                      },
                    },
                    green: {
                      bg: 'bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-900/30 dark:to-green-900/10',
                      border: 'border-green-200 dark:border-green-800',
                      text: 'text-green-700 dark:text-green-200',
                      hover:
                        'hover:border-green-300 dark:hover:border-green-700',
                      active: {
                        bg: 'bg-gradient-to-br from-green-100 to-green-50 dark:from-green-800/40 dark:to-green-900/20',
                        text: 'text-green-900 dark:text-green-100',
                        icon: 'text-green-600 dark:text-green-300',
                      },
                    },
                  };

                  return (
                    <motion.button
                      key={status}
                      onClick={() =>
                        handleReadStatusChange(
                          status as keyof typeof readingStatusConfig
                        )
                      }
                      disabled={isUpdating || !user}
                      role='radio'
                      aria-checked={isActive}
                      aria-label={`Mark as ${config.label}`}
                      className={`
                        group relative flex flex-col min-h-[16rem] p-6
                        rounded-2xl border-2 transition-all duration-300
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900
                        ${
                          isActive
                            ? `${colorClasses[config.color].border} ${colorClasses[config.color].bg} focus-visible:ring-${config.color}-500/50`
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 focus-visible:ring-gray-500/50'
                        }
                        disabled:opacity-60 disabled:cursor-not-allowed
                        hover:shadow-lg hover:scale-[1.02]
                        transform-gpu backdrop-blur-[2px]
                        ${!user ? 'cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={
                        !isUpdating && user ? config.animation.hover : undefined
                      }
                      whileTap={
                        !isUpdating && user ? config.animation.tap : undefined
                      }
                    >
                      {/* Background gradient */}
                      {isActive && (
                        <motion.div
                          className={`absolute inset-0 rounded-xl ${colorClasses[config.color].bg} opacity-60`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: [0.4, 0.6, 0.4],
                            scale: [1, 1.02, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}

                      <div className='relative z-10 flex-1 flex flex-col items-center'>
                        <motion.div
                          className={`
                            w-16 h-16 rounded-2xl flex items-center justify-center mb-5
                            shadow-md ring-1 ring-black/5 dark:ring-white/5 transition-colors duration-300
                            ${
                              isActive
                                ? `${colorClasses[config.color].active.bg} ${colorClasses[config.color].active.icon}`
                                : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                            }
                          `}
                          animate={isActive ? config.animation.active : {}}
                        >
                          <Icon className='w-8 h-8' aria-hidden='true' />
                        </motion.div>

                        <div className='flex flex-col items-center gap-3 mb-8'>
                          <div className='flex items-center justify-center gap-2'>
                            <span
                              className={`
                                font-bold text-lg tracking-tight
                                ${
                                  isActive
                                    ? colorClasses[config.color].text
                                    : 'text-gray-700 dark:text-gray-300'
                                }
                              `}
                            >
                              {config.label}
                            </span>
                            <motion.span
                              initial={false}
                              animate={{
                                scale: isActive ? 1 : 0,
                                rotate: isActive ? [0, 10, -10, 0] : 0,
                              }}
                              className='text-xl'
                              aria-hidden='true'
                            >
                              {config.emoji}
                            </motion.span>
                          </div>
                          <p
                            className={`
                              text-base text-center leading-relaxed
                              ${
                                isActive
                                  ? `${colorClasses[config.color].text} opacity-90`
                                  : 'text-gray-600 dark:text-gray-400'
                              }
                            `}
                          >
                            {config.description}
                          </p>
                        </div>

                        {/* Motivational text */}
                        <motion.div
                          className={`
                            w-full mt-auto pt-4 border-t
                            ${
                              isActive
                                ? `border-${config.color}-200/40 dark:border-${config.color}-700/40`
                                : 'border-gray-200/50 dark:border-gray-700/30'
                            }
                            text-sm text-center font-medium tracking-wide
                            ${
                              isActive
                                ? colorClasses[config.color].text
                                : 'text-gray-500 dark:text-gray-400'
                            }
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
                      </div>

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
                                <Sparkles
                                  className='w-5 h-5 text-yellow-400 drop-shadow-lg'
                                  aria-hidden='true'
                                />
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!user && (
                        <div
                          className='absolute inset-0 bg-white/40 dark:bg-gray-900/40 rounded-xl backdrop-blur-[1px] flex items-center justify-center'
                          aria-hidden='true'
                        >
                          <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                            Sign in to track progress
                          </p>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
