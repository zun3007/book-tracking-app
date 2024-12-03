import React from 'react';
import { motion } from 'framer-motion';

function LoadingSpinner() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-slate-50'>
      <motion.div
        className='flex items-center justify-center space-x-2'
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          yoyo: Infinity, // Repeat the animation
        }}
      >
        {/* Spinner Dots */}
        <motion.div
          className='w-4 h-4 bg-blue-500 rounded-full'
          animate={{ y: [-6, 6, -6] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'loop',
            delay: 0,
          }}
        ></motion.div>
        <motion.div
          className='w-4 h-4 bg-blue-500 rounded-full'
          animate={{ y: [-6, 6, -6] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'loop',
            delay: 0.2,
          }}
        ></motion.div>
        <motion.div
          className='w-4 h-4 bg-blue-500 rounded-full'
          animate={{ y: [-6, 6, -6] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'loop',
            delay: 0.4,
          }}
        ></motion.div>
      </motion.div>

      {/* Loading Text */}
      <motion.div
        className='ml-4 text-lg font-medium text-slate-600'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        Loading...
      </motion.div>
    </div>
  );
}

export default LoadingSpinner;
