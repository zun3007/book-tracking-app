import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAllBooks } from './bookSlice';
import BookCard from './components/BookCard';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterState {
  genre: string[];
  minRating: number;
  author: string;
  year: string;
  sortBy: 'latest' | 'rating' | 'title';
}

export default function AllBooks() {
  const dispatch = useAppDispatch();
  const { books, status, error, totalBooks } = useAppSelector(
    (state) => state.books
  );
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

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setPage(1); // Reset pagination when searching
    }, 500),
    []
  );

  // Filter handlers
  const handleGenreChange = (genre: string) => {
    setFilters((prev) => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter((g) => g !== genre)
        : [...prev.genre, genre],
    }));
    setPage(1);
  };

  const handleRatingChange = (rating: number) => {
    setFilters((prev) => ({ ...prev, minRating: rating }));
    setPage(1);
  };

  const handleSortChange = (sortBy: 'latest' | 'rating' | 'title') => {
    setFilters((prev) => ({ ...prev, sortBy }));
    setPage(1);
  };

  // Add pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch data with filters
  useEffect(() => {
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className='min-h-screen bg-slate-50 py-8 mt-16'>
      <div className='container mx-auto px-4'>
        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 space-y-4 bg-slate-50 p-4 rounded-lg shadow-sm'
        >
          {/* Search Box */}
          <div className='relative'>
            <input
              type='text'
              placeholder='Search anime...'
              onChange={(e) => debouncedSearch(e.target.value)}
              className='w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* Filter Pills */}
          <div className='flex flex-wrap gap-2'>
            {['Action', 'Romance', 'Comedy', 'Fantasy', 'Slice of Life'].map(
              (genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreChange(genre)}
                  className={`px-4 py-2 rounded-full ${
                    filters.genre.includes(genre)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {genre}
                </button>
              )
            )}
          </div>

          {/* Rating Filter */}
          <div className='flex items-center gap-4'>
            <span>Minimum Rating:</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`p-2 ${
                  filters.minRating === rating
                    ? 'text-yellow-500'
                    : 'text-gray-400'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <select
            onChange={(e) => handleSortChange(e.target.value as any)}
            className='px-4 py-2 rounded-lg border'
          >
            <option value='latest'>Latest</option>
            <option value='rating'>Highest Rated</option>
            <option value='title'>Title A-Z</option>
          </select>
        </motion.div>

        {/* Books Grid */}
        <motion.div
          variants={container}
          initial='hidden'
          animate='show'
          className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8'
        >
          <AnimatePresence mode='popLayout'>
            {books.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pagination Controls */}
        {!isLoading && books.length > 0 && (
          <div className='flex justify-center items-center space-x-2 py-4'>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className='px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50'
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className='flex space-x-2'>
              {Array.from({ length: Math.ceil(totalBooks / itemsPerPage) }).map(
                (_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === Math.ceil(totalBooks / itemsPerPage) ||
                    (pageNumber >= page - 2 && pageNumber <= page + 2)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-lg ${
                          page === pageNumber
                            ? 'bg-blue-500 text-white'
                            : 'border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                  return null;
                }
              )}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= Math.ceil(totalBooks / itemsPerPage)}
              className='px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50'
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
