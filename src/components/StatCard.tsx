import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'red';
  trend?: number;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-500',
    trendUp: 'text-blue-600 bg-blue-50',
    trendDown: 'text-red-600 bg-red-50',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/10',
    text: 'text-green-600 dark:text-green-400',
    icon: 'text-green-500',
    trendUp: 'text-green-600 bg-green-50',
    trendDown: 'text-red-600 bg-red-50',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/10',
    text: 'text-purple-600 dark:text-purple-400',
    icon: 'text-purple-500',
    trendUp: 'text-purple-600 bg-purple-50',
    trendDown: 'text-red-600 bg-red-50',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/10',
    text: 'text-red-600 dark:text-red-400',
    icon: 'text-red-500',
    trendUp: 'text-red-600 bg-red-50',
    trendDown: 'text-red-600 bg-red-50',
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className='relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow overflow-hidden'
    >
      <div className='flex items-center justify-between mb-4'>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.bg}`}
        >
          <Icon className={`w-6 h-6 ${styles.icon}`} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
              trend >= 0 ? styles.trendUp : styles.trendDown
            }`}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {trend >= 0 ? '+' : ''}
              {trend}%
            </motion.span>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className='space-y-2'
      >
        <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
          {title}
        </h3>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
        >
          <span className={`text-2xl font-bold ${styles.text}`}>
            {value.toLocaleString()}
          </span>
        </motion.div>
      </motion.div>

      {/* Decorative background icon */}
      <div className='absolute -bottom-1 -right-1 w-24 h-24 opacity-5'>
        <Icon className='w-full h-full' />
      </div>
    </motion.div>
  );
}
