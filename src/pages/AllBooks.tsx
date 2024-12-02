import React, { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

function AllBooksPage() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const booksPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bookResponse = await fetch('/api/books');
        const genreResponse = await fetch('/api/genres');

        if (!bookResponse.ok || !genreResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const bookData = await bookResponse.json();
        const genreData = await genreResponse.json();

        setBooks(bookData);
        setGenres(['All', ...genreData]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBooks = books.filter(
    (book) =>
      (selectedGenre === 'All' || book.genres.includes(selectedGenre)) &&
      (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.authors.some((author) =>
          author.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const navbarAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 },
  });

  const bookAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 500 },
  });

  return (
    <div className='bg-slate-50 min-h-screen text-slate-800 font-sans'>
      {/* Navbar */}
      <animated.nav
        style={navbarAnimation}
        className='bg-white shadow-md py-4 px-8 fixed top-0 w-full z-10'
      >
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <h1 className='text-3xl font-extrabold text-slate-800'>StoryTrack</h1>
          <div className='flex gap-6'>
            <a
              href='/'
              className='text-slate-600 hover:text-blue-600 font-medium transition'
            >
              Home
            </a>
            <a
              href='/books'
              className='text-slate-600 hover:text-blue-600 font-medium transition'
            >
              All Books
            </a>
            <a
              href='/favorites'
              className='text-slate-600 hover:text-blue-600 font-medium transition'
            >
              Favorites
            </a>
            <a
              href='/settings'
              className='text-slate-600 hover:text-blue-600 font-medium transition'
            >
              Settings
            </a>
            <a
              href='/logout'
              className='text-red-500 hover:text-red-400 font-medium transition'
            >
              Logout
            </a>
          </div>
        </div>
      </animated.nav>

      {/* Hero Header */}
      <header className='bg-gradient-to-r from-blue-50 to-slate-100 py-16 px-8 text-center shadow-sm mt-20'>
        <h1 className='text-4xl font-bold text-slate-800'>Explore All Books</h1>
        <p className='text-lg text-slate-600 mt-4'>
          Discover your next great read among thousands of books.
        </p>
      </header>

      {/* Filters */}
      <section className='py-6 px-8 bg-white shadow-md'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
          {/* Search Bar */}
          <input
            type='text'
            placeholder='Search by title or author'
            className='px-4 py-3 w-full sm:w-1/2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Genre Filter */}
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
        {loading ? (
          <p className='text-center text-slate-500'>Loading books...</p>
        ) : error ? (
          <p className='text-center text-red-500'>{error}</p>
        ) : filteredBooks.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {currentBooks.map((book) => (
              <animated.div
                key={book.id}
                style={bookAnimation}
                className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-2 hover:scale-105'
              >
                <img
                  src={book.thumbnail || '/placeholder.jpg'}
                  alt={book.title}
                  className='w-full h-40 object-cover rounded-md shadow'
                />
                <h3 className='text-lg font-bold text-slate-800 mt-4'>
                  {book.title}
                </h3>
                <p className='text-slate-600 text-sm'>
                  {book.authors.join(', ')}
                </p>
                <p className='text-slate-500 text-sm mt-2 italic'>
                  {book.genres.join(', ')}
                </p>
              </animated.div>
            ))}
          </div>
        ) : (
          <p className='text-center text-slate-500 mt-8'>No books found.</p>
        )}
      </main>

      {/* Pagination */}
      <footer className='py-6 px-8 flex justify-center'>
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
      </footer>
    </div>
  );
}

export default AllBooksPage;
