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
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8 mt-16'>
      <div className='container mx-auto px-4'>
        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm'
        >
          {/* Search Box */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search books by title, author..."
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-10 py-3 rounded-lg border border-gray-200 
                dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition-colors"
              aria-label="Search books"
            />
            <Search className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <div className="absolute right-2">
              <VoiceSearchButton
                onSearch={handleVoiceSearch}
                isSearching={isLoading}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Genre
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {['Action', 'Romance', 'Comedy', 'Fantasy', 'Slice of Life'].map(
                (genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreChange(genre)}
                    className={`px-4 py-2 rounded-full transition-all duration-200 
                      focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                      ${
                        filters.genre.includes(genre)
                          ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    aria-pressed={filters.genre.includes(genre)}
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
                  className="px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 
                    text-red-600 dark:text-red-400 hover:bg-red-200 
                    dark:hover:bg-red-900/50 transition-colors
                    focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  aria-label="Clear all filters"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Rating
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`p-2.5 rounded-lg transition-colors 
                    focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 
                    dark:hover:bg-gray-700 ${
                      filters.minRating === rating
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  aria-label={`Filter by ${rating} stars or more`}
                  aria-pressed={filters.minRating === rating}
                >
                  {'⭐'.repeat(rating)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label htmlFor="sort-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort Books By
            </label>
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 
                dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition-colors bg-white dark:bg-gray-700
                hover:border-gray-300 dark:hover:border-gray-500"
            >
              <option value="latest" className="bg-white dark:bg-gray-700">Latest Added</option>
              <option value="rating" className="bg-white dark:bg-gray-700">Highest Rated</option>
              <option value="title" className="bg-white dark:bg-gray-700">Title A-Z</option>
            </select>
          </div>
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
