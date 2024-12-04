import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import type { Book } from '../types/supabase';

interface BookshelfBook extends Book {
  read_status: 'none' | 'reading' | 'finished';
}

export function useBookSync(userId: string | undefined) {
  const [readingBooks, setReadingBooks] = useState<BookshelfBook[]>([]);
  const [finishedBooks, setFinishedBooks] = useState<BookshelfBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchBooks = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setIsError(false);

      const { data, error } = await supabase
        .from('user_books')
        .select(
          `
          book_id,
          read_status,
          books (
            id,
            title,
            authors,
            thumbnail,
            description,
            isbn,
            published_date,
            genres,
            average_rating,
            ratings_count
          )
        `
        )
        .eq('user_id', userId)
        .in('read_status', ['reading', 'finished'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedBooks = data.map((item) => ({
        ...item.books,
        read_status: item.read_status,
      }));

      setReadingBooks(
        formattedBooks.filter((book) => book.read_status === 'reading')
      );
      setFinishedBooks(
        formattedBooks.filter((book) => book.read_status === 'finished')
      );
    } catch (error) {
      console.error('Error fetching bookshelf:', error);
      toast.error('Failed to load bookshelf');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const subscribeToChanges = useCallback(() => {
    if (!userId) return;

    const subscription = supabase
      .channel('bookshelf_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_books',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            fetchBooks();
            toast.success('Bookshelf updated');
          } else if (payload.eventType === 'DELETE') {
            fetchBooks();
            toast.success('Book removed from shelf');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, fetchBooks]);

  const updateBookStatus = useCallback(
    async (bookId: number, newStatus: 'none' | 'reading' | 'finished') => {
      if (!userId) return;

      try {
        const { error } = await supabase.from('user_books').upsert({
          user_id: userId,
          book_id: bookId,
          read_status: newStatus,
        });

        if (error) throw error;
        await fetchBooks(); // Refresh the lists
      } catch (error) {
        console.error('Error updating book status:', error);
        throw error;
      }
    },
    [userId, fetchBooks]
  );

  useEffect(() => {
    fetchBooks();
    const unsubscribe = subscribeToChanges();
    return () => {
      unsubscribe?.();
    };
  }, [fetchBooks, subscribeToChanges]);

  return {
    readingBooks,
    finishedBooks,
    isLoading,
    isError,
    refetch: fetchBooks,
    updateBookStatus,
  };
}
