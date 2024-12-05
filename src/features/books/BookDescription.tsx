import { useLayoutEffect, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  toggleFavorite,
  updateBookRating,
  setSelectedBook,
  fetchFavorites,
} from './bookSlice';
import { useAuth } from '../../hooks/useAuth';
import { bookService } from '../../services/bookService';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import BookDetails from './BookDetails';
import CommentsSection from './CommentsSection';

type Comment = {
  id: number;
  user_id: string;
  content: string;
  // Add other properties as needed
};

export default function BookDescription() {
  const { bookId } = useParams<{ bookId: string }>();
  const dispatch = useAppDispatch();
  const {
    selectedBook: book,
    loading,
    error,
    favorites,
  } = useAppSelector((state) => state.books);
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [taggedUsers, setTaggedUsers] = useState<
    { id: string; email: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const initializeData = async () => {
      if (bookId && user?.id) {
        try {
          setIsLoading(true);
          const bookData = await bookService.getBookById(parseInt(bookId, 10));
          dispatch(setSelectedBook(bookData));

          dispatch(fetchFavorites(user.id));
        } catch (err) {
          console.error('Error fetching data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeData();

    return () => {
      dispatch(setSelectedBook(null));
    };
  }, [bookId, user?.id, dispatch]);

  useEffect(() => {
    const fetchCommentsAndProfiles = async () => {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('book_id', bookId);

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      } else {
        setComments(commentsData);

        const userIds = commentsData.map((comment) => comment.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          const profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile.email;
            return acc;
          }, {});
          setProfiles(profilesMap);
        }
      }
    };

    fetchCommentsAndProfiles();

    const commentsChannel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          setComments((prevComments) => [...prevComments, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
    };
  }, [bookId]);

  const handleCommentSubmit = async (
    newComment: string,
    setNewComment: (value: string) => void
  ) => {
    if (!newComment.trim()) return;

    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      book_id: bookId,
      content: newComment,
    });

    if (error) {
      toast.error('Failed to post comment');
    } else {
      setNewComment('');
    }
  };

  const handleTagInput = async (input: string) => {
    if (input.startsWith('@')) {
      const search = input.slice(1);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', `%${search}%`)
        .limit(5);

      if (!error) {
        setTaggedUsers(data);
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleTagSelect = (email: string) => {
    setNewComment((prev) => `${prev}@${email} `);
    setShowSuggestions(false);
  };

  const handleRatingChange = async (newRating: number) => {
    if (!user?.id || !book?.id) return;

    dispatch(
      updateBookRating({
        bookId: book.id,
        userId: user.id,
        rating: newRating,
      })
    );
  };

  const handleToggleFavorite = async () => {
    if (!user?.id || !book?.id) return;

    try {
      await dispatch(
        toggleFavorite({
          bookId: book.id,
          userId: user.id,
        })
      ).unwrap();

      dispatch(fetchFavorites(user.id));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-16'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex justify-center'
          >
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400' />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-16'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg shadow-sm'
          >
            <p className='font-medium'>{error || 'Book not found'}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 mt-16'>
      <div className='container mx-auto px-4 pb-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden max-w-5xl mx-auto'
        >
          <BookDetails
            book={book}
            favorites={favorites}
            handleRatingChange={handleRatingChange}
            handleToggleFavorite={handleToggleFavorite}
            user={user}
          />
        </motion.div>

        <CommentsSection
          comments={comments}
          profiles={profiles}
          user={user}
          bookId={bookId}
          handleCommentSubmit={handleCommentSubmit}
          handleTagInput={handleTagInput}
          handleTagSelect={handleTagSelect}
          taggedUsers={taggedUsers}
          showSuggestions={showSuggestions}
        />
      </div>
    </div>
  );
}
