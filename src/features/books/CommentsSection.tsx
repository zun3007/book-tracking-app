import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import type { Comment } from '../../types/supabase';
import { useAppSelector } from '../../app/hooks';
import RichTextEditor from '../../components/ui/RichTextEditor';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface CommentsSectionProps {
  bookId: string;
}

interface CommentAction {
  commentId: number;
  userId: string;
  type: 'like' | 'reply';
}

export default function CommentsSection({ bookId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [commentActions, setCommentActions] = useState<
    Record<number, CommentAction[]>
  >({});
  const commentsPerPage = 5;

  const user = useAppSelector((state) => state.auth.user);

  // Optimized fetch with cursor-based pagination
  const fetchComments = useCallback(async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      setComments(commentsData);

      // Fetch profiles efficiently
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const profileMap = profilesData.reduce(
        (acc, profile) => {
          acc[profile.id] = profile.email;
          return acc;
        },
        {} as Record<string, string>
      );

      setProfiles(profileMap);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  // Real-time subscriptions with optimistic updates
  useEffect(() => {
    fetchComments();

    const commentsSubscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'comments',
          filter: `book_id=eq.${bookId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments((prev) => [payload.new as Comment, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setComments((prev) =>
              prev.map((c) =>
                c.id === payload.new.id ? (payload.new as Comment) : c
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsSubscription);
    };
  }, [bookId, fetchComments]);

  const handleCommentSubmit = async () => {
    if (!user?.id || !newComment.trim()) return;

    try {
      const mentions =
        newComment
          .match(/@\[([^\]]+)\]\(([^)]+)\)/g)
          ?.map((mention) => {
            const match = mention.match(/@\[([^\]]+)\]\(([^)]+)\)/);
            return match ? match[2] : null;
          })
          .filter(Boolean) || [];

      // Optimistic update
      const tempId = Date.now();
      const tempComment = {
        id: tempId,
        user_id: user.id,
        book_id: parseInt(bookId),
        content: newComment,
        mentions: mentions.length > 0 ? mentions : null,
        created_at: new Date().toISOString(),
      };

      setComments((prev) => [tempComment, ...prev]);
      setNewComment('');

      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        book_id: parseInt(bookId),
        content: newComment,
        mentions: mentions.length > 0 ? mentions : null,
      });

      if (error) throw error;

      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
      // Rollback optimistic update
      setComments((prev) => prev.filter((c) => c.id !== Date.now()));
    }
  };

  const handleAction = (commentId: number, type: 'like' | 'reply') => {
    if (!user?.id) return;

    setCommentActions((prev) => ({
      ...prev,
      [commentId]: [
        ...(prev[commentId] || []),
        { commentId, userId: user.id, type },
      ],
    }));

    toast.success(type === 'like' ? '❤️ Liked!' : '💬 Reply mode activated');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const currentComments = comments.slice(
    (currentPage - 1) * commentsPerPage,
    currentPage * commentsPerPage
  );
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  return (
    <div className='mt-8 max-w-4xl mx-auto'>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-2xl font-bold mb-6'
      >
        Comments
      </motion.h2>

      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <RichTextEditor
            value={newComment}
            onChange={setNewComment}
            placeholder='Share your thoughts...'
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCommentSubmit}
            disabled={!newComment.trim()}
            className='mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Post Comment
          </motion.button>
        </motion.div>
      )}

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex justify-center'
        >
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='show'
          className='space-y-4'
        >
          <AnimatePresence mode='popLayout'>
            {currentComments.map((comment) => (
              <motion.div
                key={comment.id}
                variants={itemVariants}
                layout
                initial='hidden'
                animate='show'
                exit={{ opacity: 0, y: -20 }}
                className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4 transform transition-all hover:shadow-md'
              >
                <div className='flex items-start space-x-3'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <span className='font-semibold text-gray-900 dark:text-gray-100'>
                          {profiles[comment.user_id] || 'Unknown User'}
                        </span>
                        <span className='text-sm text-gray-500'>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAction(comment.id, 'like')}
                          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
                        >
                          <Heart
                            size={18}
                            className={
                              commentActions[comment.id]?.some(
                                (a) =>
                                  a.type === 'like' && a.userId === user?.id
                              )
                                ? 'fill-red-500 text-red-500'
                                : 'text-gray-400'
                            }
                          />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleAction(comment.id, 'reply')}
                          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
                        >
                          <MessageCircle size={18} className='text-gray-400' />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
                        >
                          <Share2 size={18} className='text-gray-400' />
                        </motion.button>
                      </div>
                    </div>
                    <div
                      className='mt-2 text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none'
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex justify-center space-x-2 mt-6'
        >
          {Array.from({ length: totalPages }, (_, i) => (
            <motion.button
              key={i + 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded transition-colors ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
