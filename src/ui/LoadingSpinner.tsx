import { motion } from 'framer-motion';

const containerVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: 'reverse',
      repeatDelay: 0.5,
    },
  },
};

const dotVariants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

function LoadingSpinner() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-dark-950 dark:to-dark-900 transition-colors duration-300'>
      <motion.div
        className='flex flex-col items-center justify-center gap-6'
        variants={containerVariants}
        initial='initial'
        animate='animate'
      >
        {/* Spinner Container */}
        <div className='relative'>
          {/* Background Glow Effect */}
          <div className='absolute inset-0 bg-blue-500/20 dark:bg-blue-400/10 blur-xl rounded-full scale-150'></div>

          {/* Dots Container */}
          <motion.div className='relative flex items-center justify-center space-x-3 px-4 py-2'>
            {[0, 0.15, 0.3].map((delay, index) => (
              <motion.div
                key={index}
                className='w-4 h-4 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 shadow-lg'
                variants={dotVariants}
                initial='initial'
                animate='animate'
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </motion.div>
        </div>

        {/* Loading Text */}
        <div className='flex flex-col items-center gap-2'>
          <motion.div
            className='text-lg font-medium bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent'
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            Loading
          </motion.div>
          <motion.div
            className='text-sm text-slate-500 dark:text-slate-400'
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { delay: 0.3 },
            }}
          >
            Please wait while we prepare your content
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default LoadingSpinner;
