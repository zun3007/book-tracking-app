import { motion } from 'framer-motion';

export default function BookCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden'
    >
      <div className='relative w-full pt-[140%] bg-gray-200 dark:bg-gray-700 animate-pulse' />
      <div className='p-4 space-y-2'>
        <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
        <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3' />
      </div>
    </motion.div>
  );
}
