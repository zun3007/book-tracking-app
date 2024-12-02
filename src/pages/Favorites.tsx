import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/favorites'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch favorites');
        }
        const data = await response.json();
        setFavorites(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedFavorites = Array.from(favorites);
    const [removed] = reorderedFavorites.splice(result.source.index, 1);
    reorderedFavorites.splice(result.destination.index, 0, removed);

    setFavorites(reorderedFavorites);
  };

  const navbarAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 },
  });

  return (
    <div className='bg-slate-50 min-h-screen text-slate-800 font-sans'>
      {/* Navbar */}
      <animated.nav
        style={navbarAnimation}
        className='bg-white shadow-md py-4 px-8 fixed top-0 w-full z-10'
      >
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <h1 className='text-3xl font-extrabold text-blue-600'>StoryTrack</h1>
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

      {/* Header */}
      <header className='bg-gradient-to-r from-blue-50 to-slate-100 py-16 px-8 text-center shadow-sm mt-20'>
        <h1 className='text-4xl font-bold text-slate-800'>
          Your Favorite Books
        </h1>
        <p className='text-lg text-slate-600 mt-4'>
          Drag and drop to reorder your favorite books!
        </p>
      </header>

      {/* Main Content */}
      <main className='py-10 px-8'>
        {loading ? (
          <p className='text-center text-slate-500'>Loading favorites...</p>
        ) : error ? (
          <p className='text-center text-red-500'>{error}</p>
        ) : favorites.length > 0 ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId='favorites'>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                >
                  {favorites.map((book, index) => (
                    <Draggable
                      key={book.id}
                      draggableId={book.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <animated.div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          style={{
                            ...provided.draggableProps.style,
                            ...bookAnimation,
                          }}
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
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <p className='text-center text-slate-500 mt-8'>
            No favorite books found.
          </p>
        )}
      </main>
    </div>
  );
}

export default FavoritesPage;
