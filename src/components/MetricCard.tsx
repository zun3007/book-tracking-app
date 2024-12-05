import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export default function MetricCard({
  label,
  value,
  icon: Icon,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className='bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center'
    >
      <div className='inline-flex items-center justify-center p-3 bg-white/10 rounded-lg mb-3'>
        <Icon className='w-6 h-6 text-white' />
      </div>
      <div className='text-2xl font-bold text-white mb-1'>{value}</div>
      <div className='text-sm text-blue-100'>{label}</div>
    </motion.div>
  );
}
