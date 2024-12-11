import { Suspense, lazy } from 'react';
import { useAppSelector } from '../../app/hooks';
import { useRecommendation } from '../../hooks/useRecommendation';
import { useUserStats } from '../../hooks/useUserStats';
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const HeroSection = lazy(() => import('./HeroSection'));
const FeaturesSection = lazy(() => import('./FeaturesSection'));
const StatsSection = lazy(() => import('./StatsSection'));
const StoreMapSection = lazy(() => import('./StoreMapSection'));

export default function UserDashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const {
    recommendation,
    isLoading: recLoading,
    handleFeedback,
  } = useRecommendation(user?.id);
  const { stats, isLoading: statsLoading } = useUserStats(user?.id);

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900 mt-6'>
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection
          user={user}
          recommendation={recommendation}
          recLoading={recLoading}
          handleFeedback={handleFeedback}
        />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <FeaturesSection />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <StatsSection stats={stats} isLoading={statsLoading} />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <StoreMapSection />
      </Suspense>

      {/* Copyright Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className='pt-6 bg-white dark:bg-slate-800 border-t border-slate-200/50 dark:border-slate-700/50'
      >
        <div className='container mx-auto px-4'>
          <div className='flex flex-col items-center justify-center text-center'>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className='text-slate-600 dark:text-slate-400 text-sm pb-6'
            >
              © {new Date().getFullYear()} Designed & Developed by{' '}
              <span className='font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors'>
                Zun
              </span>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
