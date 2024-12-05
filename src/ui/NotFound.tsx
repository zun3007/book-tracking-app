import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-white to-blue-50 dark:from-dark-800 dark:to-dark-900'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='text-center'
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className='mb-8'
        >
          <BookX className='w-32 h-32 mx-auto text-blue-600 dark:text-primary-400' />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className='text-8xl font-bold text-blue-600 dark:text-primary-400 mb-4'
        >
          404
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4'
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto'
        >
          Oops! It seems like the page you're looking for has wandered off into
          another story.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            to='/'
            className='inline-flex items-center gap-2 px-8 py-3 rounded-full text-white bg-blue-600 hover:bg-blue-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200'
          >
            <Home className='w-5 h-5' />
            Return Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className='mt-12 text-sm text-gray-500 dark:text-gray-400'
        >
          Lost? Try checking the URL or navigating back to the homepage.
        </motion.div>
      </motion.div>
    </div>
  );
}
