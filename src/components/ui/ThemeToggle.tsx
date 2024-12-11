import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return (
        savedTheme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light')
      );
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className='relative p-2 rounded-full bg-slate-200 dark:bg-slate-800 
        hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors'
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'light' ? 0 : 180,
          scale: theme === 'light' ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className='absolute inset-0 flex items-center justify-center transform'
      >
        <Sun className='w-5 h-5 text-amber-500' />
      </motion.div>

      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 0 : -180,
          scale: theme === 'dark' ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className='absolute inset-0 flex items-center justify-center transform'
      >
        <Moon className='w-5 h-5 text-blue-500' />
      </motion.div>

      <div className='w-5 h-5 opacity-0'>
        {/* Spacer for button size consistency */}
      </div>
    </motion.button>
  );
}
