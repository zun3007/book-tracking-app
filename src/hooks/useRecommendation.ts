import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';
import { Recommendation, RecommendationMetrics } from '../types/recommendation';
import { differenceInHours } from 'date-fns';
import { toast } from 'react-hot-toast';

export function useRecommendation(userId: string | undefined) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null
  );
  const [metrics, setMetrics] = useState<RecommendationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createNewRecommendation = useCallback(async () => {
    if (!userId) return null;

    try {
      // Get user's reading history
      const { data: userBooks } = await supabase
        .from('user_books')
        .select(
          `
          book_id,
          read_status,
          books (
            id,
            genres,
            average_rating
          )
        `
        )
        .eq('user_id', userId);

      // Get user's favorite genres
      const favoriteGenres = new Set<string>();
      userBooks?.forEach((book) => {
        book.books.genres.forEach((genre) => favoriteGenres.add(genre));
      });

      // Use default genres if user has no preferences
      if (favoriteGenres.size === 0) {
        ['Fiction', 'Fantasy', 'Mystery', 'Romance'].forEach((genre) =>
          favoriteGenres.add(genre)
        );
      }

      // Get a random book matching preferences
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .not(
          'id',
          'in',
          `(${userBooks?.map((b) => b.book_id).join(',') || ''})`
        )
        .order('average_rating', { ascending: false })
        .limit(10);

      if (!books?.length) return null;

      // Find books matching user's genres
      const matchingBooks = books.filter((book) =>
        book.genres.some((genre) => favoriteGenres.has(genre))
      );

      // Select a random book from matching or all books
      const selectedBook =
        matchingBooks.length > 0
          ? matchingBooks[Math.floor(Math.random() * matchingBooks.length)]
          : books[Math.floor(Math.random() * books.length)];

      // Calculate recommendation score
      const score = calculateScore(selectedBook, Array.from(favoriteGenres));

      // Create recommendation
      const { data: newRec, error } = await supabase
        .from('recommendations')
        .insert({
          user_id: userId,
          book_id: selectedBook.id,
          score,
          reason: generateReason(selectedBook, Array.from(favoriteGenres)),
          created_at: new Date().toISOString(),
        })
        .select('*, book:books(*)')
        .single();

      if (error) throw error;
      return newRec;
    } catch (error) {
      console.error('Error creating recommendation:', error);
      return null;
    }
  }, [userId]);

  const checkAndUpdateRecommendation = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Get current recommendation
      const { data: currentRec } = await supabase
        .from('recommendations')
        .select('*, book:books(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Create new recommendation if needed
      if (
        !currentRec ||
        differenceInHours(new Date(), new Date(currentRec.created_at)) > 1
      ) {
        const newRec = await createNewRecommendation();
        if (newRec) setRecommendation(newRec);
      } else {
        setRecommendation(currentRec);
      }
    } catch (error) {
      console.error('Error checking recommendation:', error);
      toast.error('Failed to get recommendation');
    } finally {
      setIsLoading(false);
    }
  }, [userId, createNewRecommendation]);

  useEffect(() => {
    checkAndUpdateRecommendation();
  }, [checkAndUpdateRecommendation]);

  return {
    recommendation,
    metrics,
    isLoading,
    handleFeedback: async (feedback: 'liked' | 'disliked') => {
      if (!recommendation?.id) return;

      try {
        await supabase
          .from('recommendations')
          .update({ feedback })
          .eq('id', recommendation.id);

        setRecommendation((prev) => (prev ? { ...prev, feedback } : null));
        toast.success('Thank you for your feedback!');
      } catch (error) {
        console.error('Error updating feedback:', error);
        toast.error('Failed to save feedback');
      }
    },
    dismissRecommendation: async () => {
      if (!recommendation?.id) return;

      try {
        await supabase
          .from('recommendations')
          .update({ is_dismissed: true })
          .eq('id', recommendation.id);

        checkAndUpdateRecommendation();
      } catch (error) {
        console.error('Error dismissing recommendation:', error);
        toast.error('Failed to dismiss recommendation');
      }
    },
  };
}

function calculateScore(book: any, userGenres: string[]): number {
  let score = 50; // Base score

  // Genre match (30%)
  const genreMatchCount = book.genres.filter((g: string) =>
    userGenres.includes(g)
  ).length;
  score += (genreMatchCount / book.genres.length) * 30;

  // Rating bonus (20%)
  if (book.average_rating >= 4.5) score += 20;
  else if (book.average_rating >= 4.0) score += 15;
  else if (book.average_rating >= 3.5) score += 10;

  return Math.min(100, score);
}

function generateReason(book: any, userGenres: string[]): string {
  const matchingGenres = book.genres.filter((g: string) =>
    userGenres.includes(g)
  );

  const reasons = [
    matchingGenres.length > 0
      ? `Based on your interest in ${matchingGenres.join(', ')}`
      : 'Discover something new',
    book.average_rating >= 4.5
      ? 'Highly rated by readers'
      : 'Well received by the community',
  ];

  return reasons.filter(Boolean).join(' • ');
}
