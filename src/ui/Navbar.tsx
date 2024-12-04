import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/dashboard' },
    { name: 'All Books', path: '/books' },
    { name: 'Favorites', path: '/favorites' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-800 shadow-md transition-all duration-300'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <Link
            to='/dashboard'
            className='text-2xl font-bold text-blue-600 dark:text-primary-400 hover:text-blue-700 dark:hover:text-primary-300 transition-colors'
          >
            StoryTrack
          </Link>

          <div className='hidden md:flex items-center space-x-6'>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className='px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-primary-300 transition-colors'
              >
                {link.name}
              </Link>
            ))}
            <Link
              to='/logout'
              className='px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors'
            >
              Logout
            </Link>
          </div>

          <div className='md:hidden'>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='p-2 rounded-md text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-primary-300 transition-colors'
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='md:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-dark-800 shadow-lg'>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className='block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-primary-300 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors'
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to='/logout'
              className='block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors'
              onClick={() => setIsOpen(false)}
            >
              Logout
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
