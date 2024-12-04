import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { animations } from '../../config/animations';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({
  onClick,
}: FloatingActionButtonProps) {
  return (
    <motion.button
      whileHover={animations.hover}
      whileTap={animations.tap}
      onClick={onClick}
      className='fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow'
    >
      <Plus className='w-6 h-6' />
      <span className='sr-only'>Add Book</span>
    </motion.button>
  );
}
