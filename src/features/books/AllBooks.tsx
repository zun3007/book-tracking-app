import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { supabase } from './../../utils/supabaseClient';
import { setBooks } from './bookSlice';
import { useSpring, animated } from '@react-spring/web';

function AllBooksPage() {
  const dispatch = useDispatch();
  const books = useSelector((state) => state.books.items);
  const genres = useSelector((state) => state.books.genres);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  // Fetch books and genres
  const { isLoading, error, refetch } = useQuery({
    queryKey: ['books', 'genres'],
    queryFn: async () => {
      const { data: books, error: bookError } = await supabase
        .from('books')
        .select('*');
      if (bookError) throw new Error('Failed to fetch books');

      const genres = [
        'All',
        ...new Set(books.flatMap((book) => book.genres || [])),
      ];
      dispatch(setBooks({ books, genres }));

      return { books, genres };
    },
  });

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter(
      (book) =>
        (selectedGenre === 'All' || book.genres?.includes(selectedGenre)) &&
        (book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.authors?.some((author) =>
            author.toLowerCase().includes(searchQuery.toLowerCase())
          ))
    );
  }, [books, selectedGenre, searchQuery]);

  // Paginated books
  const currentBooks = useMemo(() => {
    const indexOfLastBook = currentPage * booksPerPage;
    return filteredBooks.slice(indexOfLastBook - booksPerPage, indexOfLastBook);
  }, [filteredBooks, currentPage]);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Animations
  const bookAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 500 },
  });

  // Render methods
  const renderBooks = () =>
    currentBooks.map((book) => (
      <animated.div
        key={book.id}
        style={bookAnimation}
        className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-2 hover:scale-105'
      >
        <img
          src={book.thumbnail || '/placeholder.jpg'}
          alt={book.title || 'No Title'}
          className='w-full h-40 object-cover rounded-md shadow'
        />
        <h3 className='text-lg font-bold text-slate-800 mt-4'>
          {book.title || 'Untitled'}
        </h3>
        <p className='text-slate-600 text-sm'>
          {book.authors?.join(', ') || 'Unknown Authors'}
        </p>
        <p className='text-slate-500 text-sm mt-2 italic'>
          {book.genres?.join(', ') || 'No Genres'}
        </p>
      </animated.div>
    ));

  const renderPagination = () => (
    <div className='flex items-center gap-2'>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
        <button
          key={number}
          className={`px-4 py-3 rounded-lg font-medium ${
            currentPage === number
              ? 'bg-blue-500 text-white'
              : 'bg-white text-slate-800 border border-slate-300'
          } hover:bg-blue-400 hover:text-white transition`}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </button>
      ))}
    </div>
  );

  // Handle Errors
  if (error) {
    return (
      <div className='text-center mt-10'>
        <p className='text-red-500'>{error.message}</p>
        <button
          className='mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg'
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className='bg-slate-50 min-h-screen text-slate-800 font-sans'>
      {/* Hero Header */}
      <header className='bg-gradient-to-r from-blue-50 to-slate-100 py-16 px-8 text-center shadow-sm mt-4'>
        <h1 className='text-4xl font-bold text-slate-800'>Explore All Books</h1>
        <p className='text-lg text-slate-600 mt-4'>
          Discover your next great read among thousands of books.
        </p>
      </header>

      {/* Filters */}
      <section className='py-6 px-8 bg-white shadow-md'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
          <input
            type='text'
            placeholder='Search by title or author'
            className='px-4 py-3 w-full sm:w-1/2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className='px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Books Grid */}
      <main className='py-10 px-8'>
        {isLoading ? (
          <p className='text-center text-slate-500'>Loading books...</p>
        ) : filteredBooks.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {renderBooks()}
          </div>
        ) : (
          <p className='text-center text-slate-500 mt-8'>No books found.</p>
        )}
      </main>

      {/* Pagination */}
      <footer className='py-6 px-8 flex justify-center'>
        {renderPagination()}
      </footer>
    </div>
  );
}

export default AllBooksPage;
