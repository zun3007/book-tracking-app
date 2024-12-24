import { useState, useLayoutEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAllBooks, fetchFavorites } from './bookSlice';
import { motion, AnimatePresence } from 'framer-motion';
import BookCard from './BookCard';
import VoiceSearchButton from '../../components/VoiceSearchButton';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Fuse from 'fuse.js';
import { useDebounce } from '@uidotdev/usehooks';

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
  const [debouncedSearchTerm] = useDebounce(searchQuery, 300);

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

  // Create Fuse instance for fuzzy search
  const fuseOptions = {
    keys: ['title', 'authors', 'description'],
    threshold: 0.3,
    distance: 100,
  };

  const fuse = new Fuse(books, fuseOptions);

  // Update search handler
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  // Update voice search handler with better speech recognition using react-speech-recognition
  const handleVoiceSearch = (query: string) => {
    setSearchQuery(query);
    toast.success(`Searching for: "${query}"`, {
      icon: '🎤',
      duration: 2000,
    });
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

  // Add filtered books logic
  const filteredBooks = useMemo(() => {
    if (!debouncedSearchTerm) return books;
    return fuse.search(debouncedSearchTerm).map((result) => result.item);
  }, [books, debouncedSearchTerm, fuse]);

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 mt-16'>
      <div className='container pt-4 mx-auto px-4 max-w-7xl'>
        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700'
        >
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
            Browse Books
          </h1>

          {/* Search Box */}
          <div className='relative flex flex-col sm:flex-row items-center gap-4'>
            <div className='relative w-full sm:w-auto flex-grow'>
              <input
                type='text'
                value={searchQuery}
                placeholder='Search books by title, author...'
                onChange={(e) => handleSearchChange(e.target.value)}
                className='w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 
                  dark:border-gray-600 dark:bg-gray-700 dark:text-white 
                  placeholder-gray-400 dark:placeholder-gray-400
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                  transition-all duration-200 text-base
                  shadow-sm hover:border-gray-300 dark:hover:border-gray-500'
                aria-label='Search books'
              />
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400' />
            </div>
            <div className='sm:absolute sm:right-3'>
              <VoiceSearchButton
                onSearch={handleVoiceSearch}
                isSearching={isLoading}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className='space-y-3'>
            <label className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
              Filter by Genre
            </label>
            <div className='flex flex-wrap items-center gap-2'>
              {['Action', 'Romance', 'Comedy', 'Fantasy', 'Slice of Life'].map(
                (genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreChange(genre)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 
                      focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                      font-medium text-sm
                      ${
                        filters.genre.includes(genre)
                          ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    aria-pressed={
                      filters.genre.includes(genre) ? 'true' : 'false'
                    }
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
                  className='px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 
                    text-red-600 dark:text-red-400 hover:bg-red-200 
                    dark:hover:bg-red-900/50 transition-all duration-200
                    focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                    font-medium text-sm'
                  aria-label='Clear all filters'
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Rating Filter */}
          <div className='space-y-3'>
            <label className='text-sm font-semibold text-gray-700 dark:text-gray-200'>
              Filter by Rating
            </label>
            <div className='flex flex-wrap items-center gap-3'>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`p-3 rounded-lg transition-all duration-200 
                    focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${
                      filters.minRating === rating
                        ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-500 dark:text-yellow-400 shadow-sm'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  aria-label={`Filter by ${rating} stars or more`}
                  aria-pressed={filters.minRating === rating ? 'true' : 'false'}
                >
                  {'⭐'.repeat(rating)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className='space-y-3'>
            <label
              htmlFor='sort-select'
              className='text-sm font-semibold text-gray-700 dark:text-gray-200 mr-3'
            >
              Sort Books By
            </label>
            <select
              id='sort-select'
              value={filters.sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value as FilterState['sortBy'])
              }
              className='w-full sm:w-64 px-4 py-2.5 rounded-lg border border-gray-200 
                dark:border-gray-600 dark:bg-gray-700 dark:text-white 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition-all duration-200 bg-white dark:bg-gray-700
                hover:border-gray-300 dark:hover:border-gray-500
                shadow-sm text-base cursor-pointer'
            >
              <option value='latest' className='bg-white dark:bg-gray-700'>
                Latest Added
              </option>
              <option value='rating' className='bg-white dark:bg-gray-700'>
                Highest Rated
              </option>
              <option value='title' className='bg-white dark:bg-gray-700'>
                Title A-Z
              </option>
            </select>
          </div>
        </motion.div>

        {/* Show no results message */}
        {!isLoading && books.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700'
          >
            <p className='text-lg text-gray-600 dark:text-gray-300'>
              No books found. Try adjusting your filters or search terms.
            </p>
          </motion.div>
        )}

        {/* Books Grid */}
        <motion.div
          variants={container}
          initial='hidden'
          animate='show'
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8'
        >
          <AnimatePresence mode='popLayout'>
            {filteredBooks.map((book, index) => (
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
                  size='small'
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
          <div className='flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3 py-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 px-4'>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className='px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                disabled:opacity-50 disabled:cursor-not-allowed 
                hover:bg-gray-50 dark:hover:bg-gray-700 
                text-gray-700 dark:text-gray-300
                transition-all duration-200 font-medium'
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className='flex flex-wrap justify-center space-x-2'>
              {(() => {
                const totalPages = Math.ceil(totalBooks / itemsPerPage);
                const pageNumbers = [];

                for (let i = 1; i <= totalPages; i++) {
                  if (
                    i === 1 ||
                    i === totalPages ||
                    (i >= page - 1 && i <= page + 1)
                  ) {
                    pageNumbers.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          page === i
                            ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                            : 'border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                        className='px-2 text-gray-500 dark:text-gray-400 self-end font-medium'
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
              className='px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 
                disabled:opacity-50 disabled:cursor-not-allowed 
                hover:bg-gray-50 dark:hover:bg-gray-700 
                text-gray-700 dark:text-gray-300
                transition-all duration-200 font-medium'
            >
              Next
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className='flex justify-center p-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent' />
          </div>
        )}
      </div>
    </div>
  );
}
