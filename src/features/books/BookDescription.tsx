import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  toggleFavorite,
  updateBookRating,
  setSelectedBook,
  fetchFavorites,
} from './bookSlice';
import { useAuth } from '../../hooks/useAuth';
import { bookService } from '../../services/bookService';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import OptimizedImage from '../../components/ui/OptimizedImage';

export default function BookDescription() {
  const { bookId } = useParams<{ bookId: string }>();
  const dispatch = useAppDispatch();
  const {
    selectedBook: book,
    loading,
    error,
    favorites,
  } = useAppSelector((state) => state.books);
  const { user } = useAuth();

  useEffect(() => {
    const initializeData = async () => {
      if (bookId && user?.id) {
        try {
          const bookData = await bookService.getBookById(parseInt(bookId, 10));
          dispatch(setSelectedBook(bookData));

          dispatch(fetchFavorites(user.id));
        } catch (err) {
          console.error('Error fetching data:', err);
        }
      }
    };

    initializeData();

    return () => {
      dispatch(setSelectedBook(null));
    };
  }, [bookId, user?.id, dispatch]);

  const handleRatingChange = async (newRating: number) => {
    if (!user?.id || !book?.id) return;

    dispatch(
      updateBookRating({
        bookId: book.id,
        userId: user.id,
        rating: newRating,
      })
    );
  };

  const handleToggleFavorite = async () => {
    if (!user?.id || !book?.id) return;

    dispatch(
      toggleFavorite({
        bookId: book.id,
        userId: user.id,
      })
    );
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-16'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex justify-center'
          >
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400' />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-16'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg shadow-sm'
          >
            <p className='font-medium'>{error}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-16'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-4 rounded-lg shadow-sm'
          >
            <p className='font-medium'>Book not found</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.some((f) => f.id === book.id);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-16'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden max-w-5xl mx-auto'
        >
          <div className='md:flex'>
            <motion.div
              className='md:w-1/3 relative aspect-[3/4] md:aspect-auto overflow-hidden'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <OptimizedImage
                src={book.thumbnail || '/placeholder-book.jpg'}
                alt={book.title}
                className='w-full h-full object-cover'
              />
            </motion.div>

            <motion.div
              className='p-6 md:p-8 md:w-2/3'
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2'>
                {book.title}
              </h1>
              <p className='text-lg text-gray-600 dark:text-gray-300 mb-6'>
                {book.authors?.join(', ')}
              </p>

              <div className='flex items-center space-x-4 mb-8'>
                <div className='flex items-center'>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      disabled={!user}
                      className={`w-8 h-8 ${
                        rating <= (book.userRating || 0)
                          ? 'text-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      } hover:text-amber-500 transition-colors disabled:cursor-not-allowed`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleToggleFavorite}
                  disabled={!user}
                  className='flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isFavorite ? (
                    <HeartSolidIcon className='w-5 h-5 text-red-500' />
                  ) : (
                    <HeartIcon className='w-5 h-5 text-gray-400 dark:text-gray-500' />
                  )}
                  <span className='text-gray-600 dark:text-gray-300'>
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </span>
                </button>
              </div>

              <div className='prose prose-gray dark:prose-invert max-w-none mt-6'>
                <p className='text-gray-600 dark:text-gray-300'>
                  {book.description}
                </p>

                <div className='border-t border-gray-200 dark:border-gray-700 pt-6'>
                  <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4'>
                    Book Details
                  </h2>
                  <dl className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <dt className='text-sm text-gray-500 dark:text-gray-400'>
                        ISBN
                      </dt>
                      <dd className='text-gray-700 dark:text-gray-300'>
                        {book.isbn}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-sm text-gray-500 dark:text-gray-400'>
                        Published
                      </dt>
                      <dd className='text-gray-700 dark:text-gray-300'>
                        {book.published_date}
                      </dd>
                    </div>
                    <div>
                      <dt className='text-sm text-gray-500 dark:text-gray-400'>
                        Rating
                      </dt>
                      <dd className='text-gray-700 dark:text-gray-300'>
                        ⭐ {book.average_rating.toFixed(1)} (
                        {book.ratings_count.toLocaleString()} ratings)
                      </dd>
                    </div>
                    <div>
                      <dt className='text-sm text-gray-500 dark:text-gray-400'>
                        Genres
                      </dt>
                      <dd className='text-gray-700 dark:text-gray-300'>
                        {book.genres?.join(', ')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
