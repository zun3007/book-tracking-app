import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';

function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        const { data, error } = await supabase
          .from('user_books')
          .select('id, books(id, title, authors, thumbnail, genres)')
          .eq('user_id', user.id)
          .eq('read_status', 'favorite')
          .order('order', { ascending: true });

        if (error) throw error;

        setFavorites(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message || 'Failed to fetch favorite books.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedFavorites = Array.from(favorites);
    const [movedItem] = reorderedFavorites.splice(result.source.index, 1);
    reorderedFavorites.splice(result.destination.index, 0, movedItem);

    setFavorites(reorderedFavorites);

    try {
      await Promise.all(
        reorderedFavorites.map((favorite, index) =>
          supabase
            .from('user_books')
            .update({ order: index })
            .eq('id', favorite.id)
        )
      );
      toast.success('Favorites reordered successfully.');
    } catch {
      toast.error('Failed to save the new order.');
    }
  };

  return (
    <div className='bg-slate-50 min-h-screen text-slate-800 font-sans mt-4'>
      {/* Header */}
      <header className='bg-gradient-to-r from-blue-50 to-slate-100 py-16 px-8 text-center shadow-sm'>
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
                  {favorites.map((favorite, index) => (
                    <Draggable
                      key={favorite.id}
                      draggableId={favorite.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <animated.div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-2 hover:scale-105'
                        >
                          <img
                            src={favorite.books.thumbnail || '/placeholder.jpg'}
                            alt={favorite.books.title}
                            className='w-full h-40 object-cover rounded-md shadow'
                          />
                          <h3 className='text-lg font-bold text-slate-800 mt-4'>
                            {favorite.books.title}
                          </h3>
                          <p className='text-slate-600 text-sm'>
                            {favorite.books.authors.join(', ')}
                          </p>
                          <p className='text-slate-500 text-sm mt-2 italic'>
                            {favorite.books.genres.join(', ')}
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
