import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';
import { RootState } from '../../app/store';
import { SearchIcon, BookmarkIcon, AlertCircle, XCircle } from 'lucide-react';
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
      <main
        className='min-h-screen mt-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800'
        aria-labelledby='error-heading'
      >
        <div className='container mx-auto px-4 py-12'>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className='flex flex-col items-center justify-center min-h-[400px] gap-6 text-center'
          >
            <div
              className='w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center'
              role='presentation'
            >
              <AlertCircle
                className='w-12 h-12 text-red-600 dark:text-red-500'
                aria-hidden='true'
              />
            </div>
            <div className='space-y-2'>
              <h2
                id='error-heading'
                className='text-2xl font-semibold text-gray-900 dark:text-gray-50'
              >
                Unable to Load Favorites
              </h2>
              <p className='text-gray-600 dark:text-gray-300 max-w-md'>
                {error}
              </p>
              <button
                onClick={() => {
                  setLoading(true);
                  fetchFavorites();
                }}
                className='mt-4 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-800 
                  text-white font-medium rounded-lg transition-colors
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
                aria-label='Retry loading favorites'
              >
                Try Again
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main
      className='min-h-screen mt-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800'
      aria-label='Favorites page'
    >
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header Section */}
        <div className='max-w-4xl mx-auto space-y-8 mb-12'>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='flex items-center justify-between'
          >
            <div className='flex items-center gap-4'>
              <div
                className='p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 shadow-sm'
                aria-hidden='true'
              >
                <BookmarkIcon className='w-7 h-7 text-primary-600 dark:text-primary-400' />
              </div>
              <div>
                <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50'>
                  My Favorites
                </h1>
                <p className='mt-1 text-base sm:text-lg text-gray-600 dark:text-gray-300'>
                  {favorites.length} {favorites.length === 1 ? 'book' : 'books'}{' '}
                  in your collection
                </p>
              </div>
            </div>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='relative'
            role='search'
          >
            <div className='relative flex items-center gap-3'>
              <div className='relative flex-grow'>
                <SearchIcon
                  className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500'
                  aria-hidden='true'
                />
                <input
                  type='text'
                  placeholder='Search by title or author...'
                  className='w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                    placeholder-gray-400 dark:placeholder-gray-500
                    shadow-sm hover:border-gray-300 dark:hover:border-gray-600
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-all duration-200'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label='Search favorites'
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                    aria-label='Clear search'
                  >
                    <XCircle className='w-5 h-5' />
                  </button>
                )}
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
            role='status'
            aria-label='Loading favorites'
          >
            <div className='animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent' />
            <p className='text-gray-600 dark:text-gray-300 font-medium'>
              Loading your favorites...
            </p>
          </motion.div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center justify-center min-h-[400px] gap-6 text-center'
            role='status'
            aria-label='No favorites'
          >
            <div
              className='w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800/50 shadow-inner flex items-center justify-center'
              role='presentation'
            >
              <BookmarkIcon
                className='w-12 h-12 text-gray-400 dark:text-gray-500'
                aria-hidden='true'
              />
            </div>
            <div className='space-y-2'>
              <h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-50'>
                No favorites yet
              </h2>
              <p className='text-gray-600 dark:text-gray-300 max-w-md'>
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
            role='status'
            aria-label='No search results'
          >
            <div
              className='w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800/50 shadow-inner flex items-center justify-center'
              role='presentation'
            >
              <SearchIcon
                className='w-12 h-12 text-gray-400 dark:text-gray-500'
                aria-hidden='true'
              />
            </div>
            <div className='space-y-3'>
              <h2 className='text-2xl font-semibold text-gray-900 dark:text-gray-50'>
                No matches found
              </h2>
              <p className='text-gray-600 dark:text-gray-300 max-w-lg'>
                Try adjusting your search terms or clear the search to see all
                favorites.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='mt-4 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 active:bg-primary-800 
                    text-white font-medium rounded-lg transition-colors
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
                  aria-label='Clear search and show all favorites'
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
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8'
            role='grid'
            aria-label='Favorites grid'
          >
            <AnimatePresence mode='popLayout'>
              {filteredFavorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  role='gridcell'
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
    </main>
  );
}
