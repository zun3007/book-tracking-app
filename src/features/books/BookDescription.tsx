import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggleFavorite, updateBookRating, setSelectedBook } from './bookSlice';
import { useAuth } from '../../hooks/useAuth';
import { bookService } from '../../services/bookService';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

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
    const fetchBook = async () => {
      if (bookId) {
        try {
          const bookData = await bookService.getBookById(parseInt(bookId, 10));
          dispatch(setSelectedBook(bookData));
        } catch (err) {
          console.error('Error fetching book:', err);
        }
      }
    };

    fetchBook();
    return () => {
      dispatch(setSelectedBook(null));
    };
  }, [bookId, dispatch]);

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
      <div className='min-h-screen bg-slate-50 py-12 mt-16'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex justify-center'
          >
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600' />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-slate-50 py-12 mt-16'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm'
          >
            <p className='font-medium'>{error}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className='min-h-screen bg-slate-50 py-12 mt-16'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-slate-100 border border-slate-200 text-slate-700 px-6 py-4 rounded-lg shadow-sm'
          >
            <p className='font-medium'>Book not found</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.some((f) => f.id === book.id);

  return (
    <div className='min-h-screen bg-slate-50 py-12 mt-16'>
      <div className='container mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white rounded-xl shadow-sm overflow-hidden max-w-5xl mx-auto'
        >
          <div className='md:flex'>
            <motion.div
              className='md:w-1/3 relative aspect-[3/4] md:aspect-auto'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <img
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
              <h1 className='text-3xl font-bold text-slate-800 mb-2'>
                {book.title}
              </h1>
              <p className='text-lg text-slate-600 mb-6'>
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
                          : 'text-slate-300'
                      } hover:text-amber-500 transition-colors disabled:cursor-not-allowed`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleToggleFavorite}
                  disabled={!user}
                  className='flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isFavorite ? (
                    <HeartSolidIcon className='w-5 h-5 text-red-500' />
                  ) : (
                    <HeartIcon className='w-5 h-5 text-slate-400' />
                  )}
                  <span className='text-slate-600'>
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </span>
                </button>
              </div>

              <div className='prose prose-slate max-w-none'>
                <p className='text-slate-600 mb-6'>{book.description}</p>

                <div className='border-t border-slate-100 pt-6'>
                  <h2 className='text-lg font-semibold text-slate-800 mb-4'>
                    Book Details
                  </h2>
                  <dl className='grid grid-cols-2 gap-4'>
                    <div>
                      <dt className='text-sm text-slate-500'>ISBN</dt>
                      <dd className='text-slate-700'>{book.isbn}</dd>
                    </div>
                    <div>
                      <dt className='text-sm text-slate-500'>Published</dt>
                      <dd className='text-slate-700'>{book.published_date}</dd>
                    </div>
                    <div>
                      <dt className='text-sm text-slate-500'>Rating</dt>
                      <dd className='text-slate-700'>
                        ⭐ {book.average_rating.toFixed(1)} (
                        {book.ratings_count.toLocaleString()} ratings)
                      </dd>
                    </div>
                    <div>
                      <dt className='text-sm text-slate-500'>Genres</dt>
                      <dd className='text-slate-700'>
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
