import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Library,
  Heart,
  Book,
  Settings,
  LogOut,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ui/ThemeToggle';

const navLinks = [
  { name: 'Home', path: '/dashboard', icon: Home },
  { name: 'All Books', path: '/books', icon: Book },
  { name: 'My Bookshelf', path: '/bookshelf', icon: Library },
  { name: 'Favorites', path: '/favorites', icon: Heart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-dark-800/50 transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link
            to='/dashboard'
            className='flex items-center gap-2 text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text hover:opacity-80 transition-opacity duration-200'
          >
            <BookOpen className='w-8 h-8 text-blue-600 dark:text-blue-400' />
            <span>StoryTrack</span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-4'>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2
                    ${
                      isActivePath(link.path)
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-dark-800/50'
                    }
                    transition-all duration-200
                  `}
                >
                  <Icon className='w-4 h-4' />
                  {link.name}
                </Link>
              );
            })}
            <div className='h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2'></div>
            <ThemeToggle />
            <Link
              to='/logout'
              className='flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:opacity-90 transition-opacity duration-200'
            >
              <LogOut className='w-4 h-4' />
              Logout
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden flex items-center gap-4'>
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className='p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors duration-200'
              aria-label='Toggle menu'
            >
              {isOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={navVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
            className='md:hidden'
          >
            <div className='px-4 py-3 space-y-1 bg-white dark:bg-dark-900 border-t border-slate-200/50 dark:border-dark-800/50 shadow-lg'>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium
                      ${
                        isActivePath(link.path)
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                          : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-dark-800/50'
                      }
                      transition-all duration-200
                    `}
                  >
                    <Icon className='w-5 h-5' />
                    {link.name}
                  </Link>
                );
              })}
              <div className='h-px bg-slate-200 dark:bg-slate-700 my-2'></div>
              <Link
                to='/logout'
                onClick={() => setIsOpen(false)}
                className='flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 hover:opacity-90 transition-opacity duration-200'
              >
                <LogOut className='w-5 h-5' />
                Logout
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
