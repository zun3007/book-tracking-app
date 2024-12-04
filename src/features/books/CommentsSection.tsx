import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import type { Comment } from '../../types/supabase';
import { useAppSelector } from '../../app/hooks';
import RichTextEditor from '../../components/ui/RichTextEditor';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Menu } from '@headlessui/react';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { AlertTriangle } from 'lucide-react';

interface CommentsSectionProps {
  bookId: string;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  commentAuthor: string;
}

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  commentAuthor,
}: DeleteModalProps) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/25 backdrop-blur-sm' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 text-center'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all'>
                <div className='flex items-center gap-3 text-yellow-500'>
                  <AlertTriangle className='h-6 w-6' />
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6'
                  >
                    Delete Comment
                  </Dialog.Title>
                </div>

                <div className='mt-4'>
                  <p className='text-gray-600 dark:text-gray-300'>
                    Are you sure you want to delete this comment by{' '}
                    <span className='font-semibold'>{commentAuthor}</span>? This
                    action cannot be undone.
                  </p>
                </div>

                <div className='mt-6 flex justify-end gap-3'>
                  <button
                    type='button'
                    className='inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    className='inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default function CommentsSection({ bookId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState('');
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const commentsPerPage = 5;
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    commentId: number | null;
    author: string;
  }>({
    isOpen: false,
    commentId: null,
    author: '',
  });

  const user = useAppSelector((state) => state.auth.user);

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

  useEffect(() => {
    fetchComments();

    const commentsSubscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: '*',
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

      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        book_id: parseInt(bookId),
        content: newComment,
        mentions: mentions.length > 0 ? mentions : null,
      });

      if (error) throw error;

      setNewComment('');
      toast.success('Comment posted successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    }
  };

  const handleEditComment = async (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent })
        .eq('id', editingComment.id);

      if (error) throw error;

      setComments((prev) =>
        prev.map((c) =>
          c.id === editingComment.id ? { ...c, content: editContent } : c
        )
      );
      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      // Optimistic update - remove comment immediately
      setComments((prev) => prev.filter((c) => c.id !== commentId));

      // Show loading toast
      const toastId = toast.loading('Deleting comment...');

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        // Revert optimistic update on error
        fetchComments(); // Re-fetch all comments to ensure sync
        toast.error('Failed to delete comment', { id: toastId });
        throw error;
      }

      // Success cleanup
      toast.success('Comment deleted successfully', { id: toastId });

      // Cleanup related states
      if (editingComment?.id === commentId) {
        setEditingComment(null);
        setEditContent('');
      }

      // Remove from liked comments
      setLikedComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });

      // Ensure pagination is still valid
      const remainingComments = comments.length - 1;
      const maxPage = Math.ceil(remainingComments / commentsPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleLikeToggle = (commentId: number) => {
    setLikedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const CommentActions = ({ comment }: { comment: Comment }) => {
    const isOwner = user?.id === comment.user_id;

    return (
      <Menu as='div' className='relative'>
        <Menu.Button className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'>
          <MoreVertical size={18} className='text-gray-400' />
        </Menu.Button>
        <Menu.Items className='absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10'>
          {isOwner && (
            <>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleEditComment(comment)}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                  >
                    <Edit2 size={16} className='mr-2' />
                    Edit
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => {
                      setDeleteModalState({
                        isOpen: true,
                        commentId: comment.id,
                        author: profiles[comment.user_id] || 'Unknown User',
                      });
                    }}
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                  >
                    <Trash2 size={16} className='mr-2' />
                    Delete
                  </button>
                )}
              </Menu.Item>
            </>
          )}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(comment.content);
                  toast.success('Comment copied to clipboard');
                }}
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-700' : ''
                } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
              >
                <Share2 size={16} className='mr-2' />
                Copy
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    );
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
                exit={{
                  opacity: 0,
                  y: -20,
                  scale: 0.95,
                  transition: { duration: 0.2 },
                }}
                className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4'
              >
                <div className='flex items-start space-x-3'>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <span className='font-semibold text-gray-900 dark:text-gray-100'>
                          {profiles[comment.user_id] || 'Unknown User'}
                        </span>
                        <span className='text-sm text-gray-500'>
                          {formatDistanceToNow(new Date(comment.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <CommentActions comment={comment} />
                    </div>
                    {editingComment?.id === comment.id ? (
                      <div className='mt-2'>
                        <RichTextEditor
                          value={editContent}
                          onChange={setEditContent}
                          placeholder='Edit your comment...'
                        />
                        <div className='mt-2 flex gap-2'>
                          <button
                            onClick={handleUpdateComment}
                            className='px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingComment(null)}
                            className='px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300'
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className='mt-2 text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none'
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                      />
                    )}
                    <div className='mt-4 flex items-center space-x-4'>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLikeToggle(comment.id)}
                        className='flex items-center space-x-1 text-gray-500 hover:text-red-500'
                      >
                        <Heart
                          size={18}
                          className={
                            likedComments.has(comment.id)
                              ? 'fill-red-500 text-red-500'
                              : ''
                          }
                        />
                        <span className='text-sm'>
                          {likedComments.has(comment.id) ? 'Liked' : 'Like'}
                        </span>
                      </motion.button>
                      <button className='flex items-center space-x-1 text-gray-500 hover:text-blue-500'>
                        <MessageCircle size={18} />
                        <span className='text-sm'>Reply</span>
                      </button>
                    </div>
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

      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({ isOpen: false, commentId: null, author: '' })
        }
        onConfirm={() => {
          if (deleteModalState.commentId) {
            handleDeleteComment(deleteModalState.commentId);
          }
        }}
        commentAuthor={deleteModalState.author}
      />
    </div>
  );
}
