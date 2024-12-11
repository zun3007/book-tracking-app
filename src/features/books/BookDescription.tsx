import { useLayoutEffect, useState, Suspense, lazy, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  toggleFavorite,
  updateBookRating,
  setSelectedBook,
  fetchFavorites,
} from './bookSlice';
import { useAuth } from '../../hooks/useAuth';
import { bookService } from '../../services/bookService';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const BookDetails = lazy(() => import('./BookDetails'));
const CommentsSection = lazy(() => import('./CommentsSection'));

type Comment = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
};

type Profile = {
  id: string;
  email: string;
};

const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

export default function BookDescription() {
  const navigate = useNavigate();
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
  const [taggedUsers, setTaggedUsers] = useState<Profile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

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
        .eq('book_id', bookId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        toast.error('Failed to load comments');
        return;
      }

      setComments(commentsData || []);

      // Fetch profiles for all comments
      const userIds = [...new Set(commentsData?.map((c) => c.user_id) || [])];
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        if (profilesError) {
          toast.error('Failed to load user profiles');
        } else {
          const profilesMap = profilesData.reduce<Record<string, string>>(
            (acc, profile) => {
              acc[profile.id] = profile.email;
              return acc;
            },
            {}
          );
          setProfiles(profilesMap);
        }
      }
    };

    fetchCommentsAndProfiles();

    // Set up real-time subscription for comments
    const subscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          setComments((prevComments) => [
            ...prevComments,
            payload.new as Comment,
          ]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookId]);

  const handleCommentSubmit = async (
    commentText: string,
    setNewComment: (value: string) => void
  ) => {
    if (!commentText.trim() || !user) return;

    const { error } = await supabase.from('comments').insert({
      user_id: user.id,
      book_id: bookId,
      content: commentText,
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

      if (!error && data) {
        setTaggedUsers(data);
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleTagSelect = (email: string) => {
    setNewComment((prev: string) => `${prev}@${email} `);
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
      <div
        className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
        dark:from-gray-900 dark:to-gray-800 py-12 mt-16 flex items-center justify-center'
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='flex flex-col items-center gap-4 p-8 rounded-xl 
            bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm'
        >
          <Loader2 className='w-12 h-12 text-blue-500 dark:text-blue-400 animate-spin' />
          <p className='text-gray-600 dark:text-gray-300 font-medium'>
            Loading book details...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div
        className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
        dark:from-gray-900 dark:to-gray-800 py-12 mt-16'
      >
        <div className='container mx-auto px-4 max-w-4xl'>
          <motion.div
            {...pageTransition}
            className='bg-red-50 dark:bg-red-900/30 border border-red-200 
              dark:border-red-800/50 text-red-700 dark:text-red-300 p-8 
              rounded-xl shadow-lg backdrop-blur-sm'
          >
            <h2 className='text-2xl font-bold mb-2'>Error Loading Book</h2>
            <p className='text-lg font-medium'>{error || 'Book not found'}</p>
            <p className='mt-4 text-red-600 dark:text-red-400'>
              Please try refreshing the page or go back to browse other books.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode='wait'>
      <div
        className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
        dark:from-gray-900 dark:to-gray-800 py-12 mt-16'
      >
        <div className='container pt-8 mx-auto px-4 pb-12 max-w-6xl'>
          <motion.div {...pageTransition} className='space-y-8'>
            {/* Back Button */}
            <motion.button
              onClick={() => navigate(-1)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='group flex items-center gap-2 px-4 py-2 rounded-xl 
                bg-white dark:bg-gray-800 shadow-md hover:shadow-lg
                border border-gray-200 dark:border-gray-700
                text-gray-700 dark:text-gray-200
                transition-all duration-200 ease-in-out'
            >
              <ArrowLeft
                className='w-5 h-5 transition-transform duration-200 
                group-hover:-translate-x-1'
              />
              <span className='font-medium'>Back to Books</span>
            </motion.button>

            {/* Book Header */}
            <div className='text-center mb-8'>
              <h1
                className='text-4xl font-bold text-gray-900 dark:text-white mb-2 
                leading-tight'
              >
                {book.title}
              </h1>
              <p className='text-xl text-gray-600 dark:text-gray-300'>
                by {book.authors?.join(', ')}
              </p>
            </div>

            {/* Book Details Card */}
            <Suspense fallback={<LoadingSpinner />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
                  overflow-hidden border border-gray-100 dark:border-gray-700'
              >
                <BookDetails
                  book={book}
                  favorites={favorites}
                  handleRatingChange={handleRatingChange}
                  handleToggleFavorite={handleToggleFavorite}
                  user={user}
                />
              </motion.div>
            </Suspense>

            {/* Comments Section */}
            <Suspense fallback={<LoadingSpinner />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl 
                  overflow-hidden border border-gray-100 dark:border-gray-700 pb-8'
              >
                <div className='p-6 border-b border-gray-100 dark:border-gray-700'>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    Discussion
                  </h2>
                  <p className='text-gray-600 dark:text-gray-300 mt-1'>
                    Share your thoughts about the book
                  </p>
                </div>

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
              </motion.div>
            </Suspense>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
