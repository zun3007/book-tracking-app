import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '../../utils/supabaseClient';
import { RootState } from '../../store';
import { SearchIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { Book } from '../../types';
import type { DropResult } from '@hello-pangea/dnd';
import BookCard from './BookCard';

interface FavoriteBook {
  id: number;
  book: Book;
  order: number;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = useCallback(async () => {
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
            average_rating,
            ratings_count,
            description,
            isbn,
            published_date,
            genres
          )
        `
        )
        .eq('user_id', userId)
        .eq('read_status', 'favorite')
        .order('order');

      if (error) throw error;

      const formattedFavorites = data.map((item) => ({
        id: item.id,
        book: item.books as Book,
        order: item.order || 0,
      }));

      setFavorites(formattedFavorites);
    } catch (error) {
      toast.error('Failed to fetch favorites');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !userId) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    try {
      const updatedFavorites = Array.from(favorites);
      const [movedItem] = updatedFavorites.splice(sourceIndex, 1);
      updatedFavorites.splice(destinationIndex, 0, movedItem);

      setFavorites(updatedFavorites);

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
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
      fetchFavorites();
    }
  };

  const handleFavoriteToggle = () => {
    fetchFavorites();
  };

  const filteredFavorites = favorites.filter(
    (favorite) =>
      favorite.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.book.authors.some((author) =>
        author.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

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
      className='container mx-auto px-4 py-8 mt-16 min-h-screen bg-gray-50 dark:bg-dark-900'
    >
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-primary mb-4'>My Favorites</h1>

        <div className='relative'>
          <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5' />
          <input
            type='text'
            placeholder='Search favorites...'
            className='w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-dark-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-secondary text-lg'>
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
                aria-label='Favorites List'
              >
                <AnimatePresence>
                  {filteredFavorites.map((favorite, index) => (
                    <Draggable
                      key={favorite.id.toString()}
                      draggableId={favorite.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={snapshot.isDragging ? 'z-50' : ''}
                          aria-roledescription='Draggable item'
                        >
                          <BookCard
                            book={favorite.book}
                            index={index}
                            onFavoriteToggle={handleFavoriteToggle}
                          />
                        </div>
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
