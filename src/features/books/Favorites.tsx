import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '../../utils/supabaseClient';
import { RootState } from '../../store';
import { SearchIcon, GripIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

interface FavoriteBook {
  id: number;
  book: {
    id: number;
    title: string;
    authors: string[];
    thumbnail: string;
    average_rating: number;
  };
  order: number;
}

interface BookData {
  id: number;
  title: string;
  authors: string[];
  thumbnail: string;
  average_rating: number;
}

interface UserBookData {
  id: number;
  books: BookData;
  order: number;
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    if (!userId) return;

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
            average_rating
          )
        `
        )
        .eq('user_id', userId)
        .eq('read_status', 'favorite')
        .order('order');

      if (error) throw error;

      const formattedFavorites = data.map((item: UserBookData) => ({
        id: item.id,
        book: item.books,
        order: item.order || 0,
      }));

      setFavorites(formattedFavorites);
    } catch (error) {
      toast.error('Failed to fetch favorites');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !userId) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    try {
      // Create a new array with updated orders
      const updatedFavorites = Array.from(favorites);
      const [movedItem] = updatedFavorites.splice(sourceIndex, 1);
      updatedFavorites.splice(destinationIndex, 0, movedItem);

      // Optimistically update UI
      setFavorites(updatedFavorites);

      // Prepare batch updates with new orders
      const updates = updatedFavorites.map((item, index) => ({
        id: item.id,
        user_id: userId,
        order: index,
        read_status: 'favorite',
      }));

      const { error: upsertError } = await supabase
        .from('user_books')
        .upsert(updates, {
          onConflict: 'id',
        });

      if (upsertError) throw upsertError;
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      fetchFavorites();
    }
  };

  const filteredFavorites = favorites.filter(
    (favorite) =>
      favorite.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.book.authors.some((author) =>
        author.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleBookClick = (bookId: number) => {
    navigate(`/book/${bookId}`);
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='container mx-auto px-4 py-8 mt-16'
    >
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800 mb-4'>My Favorites</h1>

        {/* Search Bar */}
        <div className='relative'>
          <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <input
            type='text'
            placeholder='Search favorites...'
            className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>
            You haven't added any favorites yet.
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId='favorites'>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
              >
                <AnimatePresence>
                  {filteredFavorites.map((favorite, index) => (
                    <Draggable
                      key={favorite.id.toString()}
                      draggableId={favorite.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`bg-white rounded-lg shadow-md overflow-hidden 
                            ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <div className='relative'>
                            <img
                              src={
                                favorite.book.thumbnail ||
                                '/placeholder-book.jpg'
                              }
                              alt={favorite.book.title}
                              className='w-full h-48 object-cover cursor-pointer'
                              onClick={() => handleBookClick(favorite.book.id)}
                            />
                            <div
                              {...provided.dragHandleProps}
                              className='absolute top-2 right-2 p-1 rounded-full bg-white/90 cursor-grab'
                            >
                              <GripIcon className='w-5 h-5 text-gray-600' />
                            </div>
                          </div>

                          <div className='p-4'>
                            <h3 className='font-semibold text-lg mb-1 truncate'>
                              {favorite.book.title}
                            </h3>
                            <p className='text-sm text-gray-600 mb-2'>
                              {favorite.book.authors?.join(', ')}
                            </p>
                            <div className='flex items-center text-sm text-gray-500'>
                              <span className='flex items-center'>
                                ⭐ {favorite.book.average_rating?.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </motion.div>
  );
}
