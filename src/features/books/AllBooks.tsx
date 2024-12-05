import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAllBooks, fetchFavorites } from './bookSlice';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from './BookCard';
import VoiceSearchButton from '../../components/VoiceSearchButton';

interface FilterState {
  genre: string[];
  minRating: number;
  author: string;
  year: string;
  sortBy: 'latest' | 'rating' | 'title';
}

export default function AllBooks() {
  const dispatch = useAppDispatch();
  const { books, totalBooks } = useAppSelector((state) => state.books);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [filters, setFilters] = useState<FilterState>({
    genre: [],
    minRating: 0,
    author: '',
    year: '',
    sortBy: 'latest',
  });
  const [isLoading, setIsLoading] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      genre: [],
      minRating: 0,
      author: '',
      year: '',
      sortBy: 'latest',
    });
    setSearchQuery('');
    setPage(1);
  };

  // Remove debounce for instant search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
    // Reset filters when searching
    setFilters((prev) => ({
      ...prev,
      genre: [],
      minRating: 0,
    }));
  };

  // Handle voice search
  const handleVoiceSearch = (query: string) => {
    handleSearchChange(query);
  };

  // Update filter handlers
  const handleGenreChange = (genre: string) => {
    setSearchQuery(''); // Clear search when filtering
    setPage(1); // Reset to first page when filtering
    setFilters((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
    }));
  };

  const handleRatingChange = (rating: number) => {
    setSearchQuery(''); // Clear search when filtering
    setPage(1); // Reset to first page when filtering
    setFilters((prev) => ({
      ...prev,
      minRating: prev.minRating === rating ? 0 : rating,
    }));
  };

  const handleSortChange = (sortBy: 'latest' | 'rating' | 'title') => {
    setFilters((prev) => ({ ...prev, sortBy }));
    setPage(1);
  };

  // Add pagination handler back
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch data with filters
  useLayoutEffect(() => {
    setIsLoading(true);
    dispatch(
      fetchAllBooks({
        page,
        filters,
        searchQuery,
      })
    ).finally(() => {
      setIsLoading(false);
    });
  }, [page, filters, searchQuery, dispatch]);

  useLayoutEffect(() => {
    if (user?.id) {
      dispatch(fetchFavorites(user.id));
    }
  }, [user?.id, dispatch]);

  // Update container animation for grid
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reduced from 0.1 for faster sequence
      },
    },
  };

  // Add item animation variant
  const item = {
    hidden: {
      opacity: 0,
      y: 10, // Reduced from 20 for subtler movement
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.3,
      },
    },
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8 mt-16'>
      <div className='container mx-auto px-4'>
        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm'
        >
          {/* Search Box */}
          <div className='relative flex items-center'>
            <input
              type='text'
              value={searchQuery}
              placeholder='Search books...'
              onChange={(e) => handleSearchChange(e.target.value)}
              className='w-full px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100'
            />
            <VoiceSearchButton onSearch={handleVoiceSearch} />
          </div>

          {/* Filter Pills */}
          <div className='flex flex-wrap items-center gap-2'>
            {['Action', 'Romance', 'Comedy', 'Fantasy', 'Slice of Life'].map(
              (genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreChange(genre)}
                  className={`px-4 py-2 rounded-full ${
                    filters.genre.includes(genre)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {genre}
                </button>
              )
            )}

            {/* Clear filters button */}
            {(filters.genre.length > 0 ||
              filters.minRating > 0 ||
              searchQuery) && (
              <button
                onClick={resetFilters}
                className='px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Rating Filter */}
          <div className='flex items-center gap-4 text-gray-700 dark:text-gray-300'>
            <span>Minimum Rating:</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`p-2 ${
                  filters.minRating === rating
                    ? 'text-yellow-500'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <select
            onChange={(e) => handleSortChange(e.target.value as any)}
            className='px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100'
          >
            <option value='latest'>Latest</option>
            <option value='rating'>Highest Rated</option>
            <option value='title'>Title A-Z</option>
          </select>
        </motion.div>

        {/* Show no results message */}
        {!isLoading && books.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-8'
          >
            <p className='text-gray-600 dark:text-gray-400'>
              No books found. Try adjusting your filters or search terms.
            </p>
          </motion.div>
        )}

        {/* Books Grid */}
        <motion.div
          variants={container}
          initial='hidden'
          animate='show'
          className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8'
        >
          <AnimatePresence mode='popLayout'>
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                variants={item}
                layout
                initial='hidden'
                animate='show'
                exit={{ opacity: 0, y: -10 }}
              >
                <BookCard
                  book={book}
                  index={index}
                  onFavoriteToggle={() => {
                    if (user?.id) {
                      dispatch(fetchFavorites(user.id));
                    }
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination Controls */}
        {!isLoading && books.length > 0 && (
          <div className='flex justify-center items-center space-x-2 py-4'>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className='px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className='flex space-x-2'>
              {(() => {
                const totalPages = Math.ceil(totalBooks / itemsPerPage);
                const pageNumbers = [];

                for (let i = 1; i <= totalPages; i++) {
                  // Show first page, last page, and pages around current page
                  if (
                    i === 1 ||
                    i === totalPages ||
                    (i >= page - 1 && i <= page + 1)
                  ) {
                    pageNumbers.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-4 py-2 rounded-lg ${
                          page === i
                            ? 'bg-blue-500 text-white'
                            : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  } else if (
                    (i === page - 2 && page > 3) ||
                    (i === page + 2 && page < totalPages - 2)
                  ) {
                    pageNumbers.push(
                      <span
                        key={i}
                        className='px-2 text-gray-500 dark:text-gray-400 self-end'
                      >
                        ...
                      </span>
                    );
                  }
                }
                return pageNumbers;
              })()}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= Math.ceil(totalBooks / itemsPerPage)}
              className='px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            >
              Next
            </button>
          </div>
        )}

        {isLoading && (
          <div className='flex justify-center p-4'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' />
          </div>
        )}
      </div>
    </div>
  );
}
