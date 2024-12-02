import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

function AllBooksPage() {
  // State management
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  // Mock data for genres (can be fetched from the database)
  const genres = [
    'All',
    'Fiction',
    'Non-Fiction',
    'Fantasy',
    'Sci-Fi',
    'Mystery',
  ];

  // Fetch books from the API or database
  useEffect(() => {
    const fetchBooks = async () => {
      const response = await fetch('/api/books'); // Replace with your API endpoint
      const data = await response.json();
      setBooks(data);
    };

    fetchBooks();
  }, []);

  // Filter books based on search and genre
  const filteredBooks = books.filter(
    (book) =>
      (selectedGenre === 'All' || book.genres.includes(selectedGenre)) &&
      (book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.authors.some((author) =>
          author.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  // Pagination logic
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  // Handle pagination
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const paginationNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Animations for books
  const bookAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 500 },
  });

  return (
    <div className='bg-slate-50 min-h-screen text-slate-800 font-sans'>
      {/* Header */}
      <header className='bg-white shadow-md py-4 px-8'>
        <h1 className='text-3xl font-bold'>All Books</h1>
      </header>

      {/* Filters */}
      <section className='py-6 px-8 bg-white shadow-sm'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
          {/* Search Bar */}
          <input
            type='text'
            placeholder='Search by title or author'
            className='px-4 py-2 w-full sm:w-1/2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Genre Filter */}
          <select
            className='px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
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
        {filteredBooks.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {currentBooks.map((book) => (
              <animated.div
                key={book.id}
                style={bookAnimation}
                className='bg-white p-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105'
              >
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className='w-full h-40 object-cover rounded-md'
                />
                <h3 className='text-lg font-bold mt-4'>{book.title}</h3>
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
          {paginationNumbers.map((number) => (
            <button
              key={number}
              className={`px-4 py-2 rounded-md ${
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
