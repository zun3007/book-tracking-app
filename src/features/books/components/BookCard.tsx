import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Book } from '../../../types';
import OptimizedImage from '../../../components/ui/OptimizedImage';

interface BookCardProps {
  book: Book;
  index?: number;
}

export default function BookCard({ book, index = 0 }: BookCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book/${book.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className='group bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden cursor-pointer transition-all duration-300'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className='relative w-full pt-[140%] overflow-hidden'>
        <div className='absolute inset-0'>
          <OptimizedImage
            src={book.thumbnail || '/placeholder-book.jpg'}
            alt={book.title}
            className='w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105'
          />
          <motion.div
            className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          />
        </div>
      </div>
      <motion.div
        className='p-4 bg-white'
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        <h3
          className='font-semibold text-slate-800 text-lg mb-1 truncate'
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
      </motion.div>
    </motion.div>
  );
}
