import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { interactiveIcons } from '../../config/icons';
import { Book } from '../../types/book';
import OptimizedImage from '../../components/ui/OptimizedImage';

interface RecommendationCardProps {
  recommendation: { book: Book } | null;
  isLoading: boolean;
  handleFeedback: (type: 'liked' | 'disliked') => void;
}

const RecommendationSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className='mt-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full 
      shadow-xl border border-slate-200/50 dark:border-slate-700/50'
  >
    <div className='flex gap-6'>
      {/* Book thumbnail skeleton */}
      <div
        className='w-36 h-52 flex-shrink-0 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 
        dark:from-slate-700 dark:to-slate-800 animate-pulse shadow-lg'
      />

      <div className='flex-1'>
        <div className='flex items-start justify-between'>
          <div className='space-y-3 flex-1'>
            {/* Title skeleton */}
            <div
              className='h-8 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 
              rounded-lg w-3/4 animate-pulse'
            />
            {/* Author skeleton */}
            <div
              className='h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 
              rounded-lg w-1/2 animate-pulse'
            />
          </div>
          {/* Rating skeleton */}
          <div
            className='w-16 h-8 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 
            dark:to-yellow-800/30 rounded-full animate-pulse'
          />
        </div>

        {/* Description skeleton */}
        <div className='mt-6 space-y-3'>
          <div
            className='h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 
            rounded-lg w-full animate-pulse'
          />
          <div
            className='h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 
            rounded-lg w-5/6 animate-pulse'
          />
        </div>

        {/* Actions skeleton */}
        <div className='mt-6 flex items-center justify-between'>
          <div className='flex gap-3'>
            <div
              className='w-10 h-10 rounded-xl bg-gradient-to-r from-slate-200 to-slate-300 
              dark:from-slate-700 dark:to-slate-800 animate-pulse'
            />
            <div
              className='w-10 h-10 rounded-xl bg-gradient-to-r from-slate-200 to-slate-300 
              dark:from-slate-700 dark:to-slate-800 animate-pulse'
            />
          </div>
          <div
            className='w-32 h-10 rounded-xl bg-gradient-to-r from-slate-200 to-slate-300 
            dark:from-slate-700 dark:to-slate-800 animate-pulse'
          />
        </div>
      </div>
    </div>
  </motion.div>
);

export default function RecommendationCard({
  recommendation,
  isLoading,
  handleFeedback,
}: RecommendationCardProps) {
  if (isLoading) {
    return <RecommendationSkeleton />;
  }

  if (!recommendation) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className='mt-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl p-4 sm:p-8 max-w-full sm:max-w-2xl w-full 
        shadow-xl hover:shadow-2xl transition-all border border-slate-200/50 dark:border-slate-700/50
        hover:border-slate-300 dark:hover:border-slate-600 transform hover:scale-[1.02] duration-300'
    >
      <div className='flex flex-col sm:flex-row gap-4 sm:gap-8'>
        {/* Book Cover */}
        <div className='w-full sm:w-36 h-52 flex-shrink-0 overflow-hidden rounded-2xl shadow-lg group relative'>
          <div
            className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 
            group-hover:opacity-100 transition-opacity duration-300 z-10'
          />
          <OptimizedImage
            src={recommendation.book.thumbnail}
            alt={recommendation.book.title}
            width={144}
            height={208}
            objectFit='cover'
            className='w-full h-full sm:w-auto sm:h-auto transform group-hover:scale-110 transition-transform duration-300'
            priority={true}
            placeholderColor='bg-slate-200 dark:bg-slate-700'
          />
        </div>

        {/* Book Details */}
        <div className='flex-1 space-y-4 sm:space-y-6'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <h3
                className='text-2xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2 
                hover:line-clamp-none transition-all duration-300'
              >
                {recommendation.book.title}
              </h3>
              <p className='text-slate-600 dark:text-slate-400 mt-2 font-medium'>
                {recommendation.book.authors.join(', ')}
              </p>
            </div>
            <div
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-full 
              bg-gradient-to-r from-yellow-100/80 to-amber-100/80 
              dark:from-yellow-900/30 dark:to-amber-900/30 
              shadow-inner border border-yellow-200/50 dark:border-yellow-700/30'
            >
              <interactiveIcons.rating className='w-4 h-4 text-yellow-500 dark:text-yellow-400 fill-current' />
              <span className='text-sm font-semibold text-yellow-700 dark:text-yellow-400'>
                {recommendation.book.average_rating.toFixed(1)}
              </span>
            </div>
          </div>

          <p
            className='text-slate-600 dark:text-slate-300 line-clamp-3 hover:line-clamp-none 
            leading-relaxed transition-all duration-300'
          >
            {recommendation.book.description}
          </p>

          <div className='flex items-center justify-between pt-2'>
            <div className='flex gap-3'>
              <motion.button
                onClick={() => handleFeedback('liked')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-blue-100 
                  dark:hover:bg-blue-900/30 transition-all duration-300 group shadow-sm 
                  hover:shadow-md border border-slate-200/50 dark:border-slate-600/50'
                title='Like'
              >
                <interactiveIcons.like
                  className='w-5 h-5 text-slate-600 dark:text-slate-400 
                  group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors'
                />
              </motion.button>
              <motion.button
                onClick={() => handleFeedback('disliked')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-red-100 
                  dark:hover:bg-red-900/30 transition-all duration-300 group shadow-sm 
                  hover:shadow-md border border-slate-200/50 dark:border-slate-600/50'
                title='Dislike'
              >
                <interactiveIcons.dislike
                  className='w-5 h-5 text-slate-600 dark:text-slate-400 
                  group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors'
                />
              </motion.button>
            </div>
            <Link
              to={`/book/${recommendation.book.id}`}
              className='flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium 
                bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 
                text-white shadow-md hover:shadow-lg transition-all duration-300 
                hover:-translate-y-0.5 group'
            >
              View Details
              <interactiveIcons.arrow className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
