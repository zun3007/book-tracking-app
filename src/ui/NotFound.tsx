import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookX } from 'lucide-react';

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-white dark:from-dark-950 dark:to-dark-900 transition-colors duration-300'>
      <motion.div
        variants={containerVariants}
        initial='initial'
        animate='animate'
        className='text-center max-w-2xl mx-auto'
      >
        {/* Icon Container */}
        <motion.div variants={itemVariants} className='mb-8 relative'>
          {/* Background Glow */}
          <div className='absolute inset-0 bg-blue-500/20 dark:bg-blue-400/10 blur-2xl rounded-full scale-150'></div>

          {/* Icon */}
          <div className='relative'>
            <BookX className='w-32 h-32 mx-auto text-blue-600 dark:text-blue-400 drop-shadow-xl' />
          </div>
        </motion.div>

        {/* 404 Number */}
        <motion.div variants={itemVariants} className='mb-6'>
          <span className='text-8xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent drop-shadow-lg'>
            404
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className='text-4xl font-bold text-slate-900 dark:text-white mb-4'
        >
          Page Not Found
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className='text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto leading-relaxed'
        >
          Oops! It seems like the page you're looking for has wandered off into
          another story. Let's get you back on track.
        </motion.p>

        {/* Action Button */}
        <motion.div variants={itemVariants} className='mb-12'>
          <Link
            to='/'
            className='inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200'
          >
            <Home className='w-5 h-5' />
            Back to Homepage
          </Link>
        </motion.div>

        {/* Help Text */}
        <motion.div
          variants={itemVariants}
          className='text-sm text-slate-500 dark:text-slate-400 flex flex-col gap-1'
        >
          <p>Lost? Here are some helpful links:</p>
          <div className='flex items-center justify-center gap-4 mt-2'>
            <Link
              to='/dashboard'
              className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors'
            >
              Dashboard
            </Link>
            <span className='text-slate-400 dark:text-slate-600'>•</span>
            <Link
              to='/books'
              className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors'
            >
              Browse Books
            </Link>
            <span className='text-slate-400 dark:text-slate-600'>•</span>
            <Link
              to='/contact'
              className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors'
            >
              Contact Support
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
