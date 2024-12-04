import { motion } from 'framer-motion';
import { BookMarked } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[200px] gap-4'>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <BookMarked className='w-8 h-8 text-blue-500' />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='text-gray-500 dark:text-gray-400'
      >
        Loading...
      </motion.p>
    </div>
  );
}
