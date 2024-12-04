import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';

interface ReadStatusButtonProps {
  status: 'none' | 'reading' | 'finished';
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  active?: boolean;
}

const statusConfig = {
  none: {
    icon: Clock,
    label: 'Not Started',
    color: 'gray',
  },
  reading: {
    icon: BookOpen,
    label: 'Reading',
    color: 'blue',
  },
  finished: {
    icon: CheckCircle2,
    label: 'Finished',
    color: 'green',
  },
};

export default function ReadStatusButton({
  status,
  onClick,
  size = 'md',
  showLabel = false,
  active = false,
}: ReadStatusButtonProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base',
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex items-center gap-2 rounded-lg transition-colors
        ${sizeClasses[size]}
        ${
          active
            ? status === 'reading'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : status === 'finished'
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            : 'bg-gray-50 text-gray-400 dark:bg-gray-800/50 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
      title={config.label}
    >
      <Icon size={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </motion.button>
  );
}
