import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';
import { RootState } from '../../app/store';
import { SearchIcon, BookmarkIcon, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { FavoriteBook } from '../../types/supabase';
import BookCard from './BookCard';
import VoiceSearchButton from '../../components/VoiceSearchButton';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const fetchFavorites = useCallback(async () => {
    if (!userId) return;
    setError(null);

    try {
      const { data, error } = await supabase
        .from('user_books')
        .select(
          `
          id,
          order,
          books (
            id,
            title,
            authors,
            thumbnail,
            description,
            isbn,
            published_date,
            genres,
            average_rating,
            ratings_count
          )
        `
        )
        .eq('user_id', userId)
        .eq('favorite', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out entries where books is null
      const validData = data.filter((item) => item.books !== null);

      if (validData.length < data.length) {
        toast.error('Some books could not be loaded');
      }

      const formattedFavorites: FavoriteBook[] = validData.map((item) => ({
        id: item.id,
        book: item.books as unknown as FavoriteBook['book'],
        order: item.order || 0,
      }));

      setFavorites(formattedFavorites);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch favorites';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFavoriteToggle = useCallback(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredFavorites = favorites.filter(
    (favorite) =>
      favorite.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.book.authors.some((author) =>
        author.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Render error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='min-h-screen mt-16 bg-gradient-to-b from-gray-50 to-white dark:from-dark-900 dark:to-dark-800'
      >
        <div className='container mx-auto px-4 py-12'>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className='flex flex-col items-center justify-center min-h-[400px] gap-6 text-center'
          >
            <div className='w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center'>
              <AlertCircle className='w-12 h-12 text-red-500' />
            </div>
            <div className='space-y-2'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                Unable to Load Favorites
              </h2>
              <p className='text-gray-500 dark:text-gray-400 max-w-md'>
                {error}
              </p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchFavorites();
                }}
                className='mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors'
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='min-h-screen mt-16 bg-gradient-to-b from-gray-50 to-white dark:from-dark-900 dark:to-dark-800'
    >
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header Section */}
        <div className='max-w-4xl mx-auto space-y-6 mb-12'>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='flex items-center justify-between'
          >
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20'>
                <BookmarkIcon className='w-6 h-6 text-primary-500' />
              </div>
              <h1 className='text-4xl font-bold text-gray-900 dark:text-gray-50'>
                My Favorites
                <span className='ml-3 text-lg font-normal text-gray-500 dark:text-gray-400'>
                  ({favorites.length}{' '}
                  {favorites.length === 1 ? 'book' : 'books'})
                </span>
              </h1>
            </div>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='relative'
          >
            <div className='relative flex items-center gap-3'>
              <div className='relative flex-grow'>
                <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none' />
                <input
                  type='text'
                  placeholder='Search by title or author...'
                  className='w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 
                    placeholder-gray-400 dark:placeholder-gray-500
                    shadow-sm hover:border-gray-300 dark:hover:border-gray-600
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-all duration-200'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <VoiceSearchButton onSearch={handleSearch} />
            </div>
          </motion.div>
        </div>

        {/* Content Section */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex flex-col items-center justify-center min-h-[400px] gap-4'
          >
            <div className='animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent' />
            <p className='text-gray-500 dark:text-gray-400'>
              Loading your favorites...
            </p>
          </motion.div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center justify-center min-h-[400px] gap-6 text-center'
          >
            <div className='w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
              <BookmarkIcon className='w-12 h-12 text-gray-400 dark:text-gray-500' />
            </div>
            <div className='space-y-2'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                No favorites yet
              </h2>
              <p className='text-gray-500 dark:text-gray-400 max-w-md'>
                Start exploring books and add them to your favorites to see them
                here.
              </p>
            </div>
          </motion.div>
        ) : filteredFavorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center justify-center min-h-[400px] gap-6 text-center'
          >
            <div className='w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
              <SearchIcon className='w-12 h-12 text-gray-400 dark:text-gray-500' />
            </div>
            <div className='space-y-2'>
              <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>
                No matches found
              </h2>
              <p className='text-gray-500 dark:text-gray-400 max-w-md'>
                Try adjusting your search terms or clear the search to see all
                favorites.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors'
                >
                  Clear Search
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          >
            <AnimatePresence>
              {filteredFavorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <BookCard
                    book={favorite.book}
                    index={index}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
