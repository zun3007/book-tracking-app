import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Book } from '../../../types';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className='group bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden cursor-pointer transition-all duration-300'
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className='relative aspect-[3/4]'>
        <img
          src={book.thumbnail || '/placeholder-book.jpg'}
          alt={book.title}
          className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
      </div>
      <div className='p-4 bg-white'>
        <h3
          className='font-semibold text-slate-800 text-lg mb-1 truncate group-hover:text-slate-600 transition-colors duration-200'
          title={book.title}
        >
          {book.title}
        </h3>
        <p
          className='text-sm text-slate-500 mb-2 truncate'
          title={book.authors?.join(', ')}
        >
          {book.authors?.join(', ')}
        </p>
        <div className='flex items-center text-sm text-slate-400'>
          <span className='flex items-center text-amber-500'>
            ⭐ {book.average_rating.toFixed(1)}
          </span>
          <span className='mx-2 text-slate-300'>•</span>
          <span>{book.ratings_count.toLocaleString()} ratings</span>
        </div>
      </div>
    </motion.div>
  );
}
