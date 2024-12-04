import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function CommentsSection({
  comments,
  profiles,
  user,
  bookId,
  handleCommentSubmit,
  handleTagInput,
  handleTagSelect,
  taggedUsers,
  showSuggestions,
}) {
  const [newComment, setNewComment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className='mt-8 max-w-5xl mx-auto'>
      <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4'>
        Comments
      </h2>
      <div className='space-y-4'>
        {currentComments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg'
          >
            <p className='text-sm text-gray-800 dark:text-gray-200'>
              <strong>{profiles[comment.user_id] || 'Unknown User'}</strong>:{' '}
              <span dangerouslySetInnerHTML={{ __html: comment.content }} />
            </p>
          </motion.div>
        ))}
      </div>
      <div className='flex justify-center mt-4'>
        {Array.from(
          { length: Math.ceil(comments.length / commentsPerPage) },
          (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`mx-1 px-3 py-1 rounded-lg ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
              }`}
            >
              {i + 1}
            </button>
          )
        )}
      </div>
      <div className='mt-4'>
        <ReactQuill
          value={newComment}
          onChange={setNewComment}
          theme='snow'
          modules={{
            toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'image'],
              ['clean'],
            ],
          }}
        />
        {showSuggestions && (
          <div className='bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-2'>
            {taggedUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleTagSelect(user.email)}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
              >
                {user.email}
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => handleCommentSubmit(newComment, setNewComment)}
          className='mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'
        >
          Post Comment
        </button>
      </div>
    </div>
  );
}
