import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { UserStats } from '../types/recommendation';
import { startOfMonth, subMonths, format } from 'date-fns';

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user's books with related data
        const { data: userBooks, error: booksError } = await supabase
          .from('user_books')
          .select(
            `
            id,
            read_status,
            favorite,
            created_at,
            updated_at,
            books (
              id,
              genres
            )
          `
          )
          .eq('user_id', userId);

        if (booksError) throw booksError;

        // Calculate reading streak
        const finishedBooks = userBooks
          ?.filter((book) => book.read_status === 'finished')
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          );

        let streak = 0;
        if (finishedBooks?.length) {
          let currentMonth = startOfMonth(
            new Date(finishedBooks[0].updated_at)
          );
          streak = 1;

          for (let i = 1; i < finishedBooks.length; i++) {
            const bookMonth = startOfMonth(
              new Date(finishedBooks[i].updated_at)
            );
            if (bookMonth.getTime() === subMonths(currentMonth, 1).getTime()) {
              streak++;
              currentMonth = bookMonth;
            } else break;
          }
        }

        // Calculate monthly progress
        const lastSixMonths = Array.from({ length: 6 }, (_, i) => ({
          month: format(subMonths(new Date(), i), 'MMM yyyy'),
          books_read: 0,
        })).reverse();

        finishedBooks?.forEach((book) => {
          const bookMonth = format(new Date(book.updated_at), 'MMM yyyy');
          const monthEntry = lastSixMonths.find((m) => m.month === bookMonth);
          if (monthEntry) monthEntry.books_read++;
        });

        // Calculate genre distribution
        const genreDistribution: Record<string, number> = {};
        userBooks?.forEach((book) => {
          book.books.genres.forEach((genre) => {
            genreDistribution[genre] = (genreDistribution[genre] || 0) + 1;
          });
        });

        setStats({
          totalBooks: userBooks?.length || 0,
          reading:
            userBooks?.filter((b) => b.read_status === 'reading').length || 0,
          completed:
            userBooks?.filter((b) => b.read_status === 'finished').length || 0,
          favorites: userBooks?.filter((b) => b.favorite).length || 0,
          genres_distribution: genreDistribution,
          reading_streak: streak,
          monthly_progress: lastSixMonths,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, isLoading, error };
}
