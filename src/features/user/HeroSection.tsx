import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { navigationIcons } from '../../config/icons';
import { User } from '../../types/auth';
import { Book } from '../../types/book';
import RecommendationCard from './RecommendationCard';

interface HeroSectionProps {
  user: User | null;
  recommendation: { book: Book } | null;
  recLoading: boolean;
  handleFeedback: (type: 'liked' | 'disliked') => void;
}

export default function HeroSection({
  user,
  recommendation,
  recLoading,
  handleFeedback,
}: HeroSectionProps) {
  return (
    <motion.section className='relative min-h-[100dvh] w-full overflow-hidden'>
      {/* Background Pattern */}
      <div
        className='absolute inset-0 bg-gradient-to-br from-blue-50/80 via-slate-50/90 to-purple-50/80 
        dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500'
      >
        <motion.div
          className='absolute inset-0 opacity-[0.03] dark:opacity-[0.07]'
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, rgba(51, 65, 85, 0.25) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Content */}
      <div className='relative z-10 container mx-auto px-4'>
        <div className='flex flex-col items-center justify-center min-h-[100dvh] py-20'>
          {/* Welcome Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='mb-8'
          >
            <div
              className='px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm 
              shadow-lg border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2 group'
            >
              <span
                className='text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 
                dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent'
              >
                Welcome back
              </span>
              <span
                className='text-sm font-semibold text-slate-700 dark:text-slate-200 
                group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'
              >
                {user?.email?.split('@')[0]}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-center space-y-8 max-w-4xl backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 
              p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700/50'
          >
            <div className='relative'>
              <h1
                className='text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-800 dark:text-slate-100 
                leading-tight tracking-tight'
              >
                Your Reading Journey{' '}
                <span className='relative inline-block'>
                  <span
                    className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 
                    dark:from-blue-400 dark:to-purple-400'
                  >
                    Starts Here
                  </span>
                  <motion.span
                    className='absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600/60 to-purple-600/60 
                      dark:from-blue-400/60 dark:to-purple-400/60 rounded-full'
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                </span>
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className='text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mt-6'
              >
                Track your books, discover new stories, and connect with fellow
                readers in one beautiful place.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className='flex flex-wrap justify-center gap-4 mt-8'
            >
              <Link
                to='/books'
                className='group px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 
                  rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all 
                  shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-slate-200/50 
                  dark:border-slate-700/50 backdrop-blur-sm flex items-center gap-3'
              >
                <motion.span
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className='text-blue-500 dark:text-blue-400'
                >
                  <navigationIcons.library.icon className='w-5 h-5' />
                </motion.span>
                <span className='relative'>
                  {navigationIcons.library.name}
                  <span
                    className='absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/70 to-blue-500/0 
                    dark:from-blue-400/0 dark:via-blue-400/70 dark:to-blue-400/0 
                    scale-x-0 group-hover:scale-x-100 transition-transform duration-300'
                  />
                </span>
              </Link>
              <Link
                to='/bookshelf'
                className='group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                  dark:from-blue-500 dark:to-purple-500 text-white rounded-2xl font-semibold 
                  hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 
                  dark:hover:to-purple-600 transition-all shadow-lg hover:shadow-xl 
                  hover:-translate-y-0.5 backdrop-blur-sm flex items-center gap-3 
                  border border-blue-400/20 dark:border-blue-500/20'
              >
                <motion.span
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  className='text-white/90'
                >
                  <navigationIcons.readingList.icon className='w-5 h-5' />
                </motion.span>
                <span className='relative'>
                  Start Reading
                  <span
                    className='absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-white/0 via-white/70 to-white/0 
                    scale-x-0 group-hover:scale-x-100 transition-transform duration-300'
                  />
                </span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Featured Book with Loading State */}
          <RecommendationCard
            recommendation={recommendation}
            isLoading={recLoading}
            handleFeedback={handleFeedback}
          />
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className='absolute bottom-8 left-1/2 -translate-x-1/2'
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        <div className='w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center'>
          <motion.div
            className='w-1 h-2 bg-slate-500 rounded-full mt-2'
            animate={{
              y: [0, 16, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        </div>
      </motion.div>
    </motion.section>
  );
}
