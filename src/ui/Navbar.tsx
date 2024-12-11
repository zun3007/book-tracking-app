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
} from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'All Books', path: '/books', icon: Book },
    { name: 'My Bookshelf', path: '/bookshelf', icon: Library },
    { name: 'Favorites', path: '/favorites', icon: Heart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-800 shadow-md transition-all duration-300'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <Link
            to='/dashboard'
            className='text-2xl font-bold text-blue-600 dark:text-primary-400 hover:text-blue-700 dark:hover:text-primary-300 transition-colors flex items-center gap-2'
          >
            <Library className='w-6 h-6' />
            StoryTrack
          </Link>

          <div className='hidden md:flex items-center space-x-4'>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                    isActivePath(link.path)
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                      : 'text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  {link.name}
                </Link>
              );
            })}
            <ThemeToggle />
            <Link
              to='/logout'
              className='px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors flex items-center gap-2'
            >
              <LogOut className='w-4 h-4' />
              Logout
            </Link>
          </div>

          <div className='md:hidden flex items-center gap-4'>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='p-2 rounded-md text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-primary-300 transition-colors'
              aria-label='Toggle menu'
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        className='md:hidden'
        initial={false}
        animate={isOpen ? { height: 'auto' } : { height: 0 }}
        transition={{ duration: 0.2 }}
        style={{ overflow: 'hidden' }}
      >
        <div className='px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-dark-800 shadow-lg'>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors ${
                  isActivePath(link.path)
                    ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30'
                    : 'text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-dark-700'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className='w-5 h-5' />
                {link.name}
              </Link>
            );
          })}
          <Link
            to='/logout'
            className='block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors flex items-center gap-2'
            onClick={() => setIsOpen(false)}
          >
            <LogOut className='w-5 h-5' />
            Logout
          </Link>
        </div>
      </motion.div>
    </nav>
  );
}
