import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
  ];

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800 transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <NavLink
            to='/'
            className='text-3xl font-bold text-blue-600 hover:text-blue-500 transition-colors duration-300'
          >
            StoryTrack
          </NavLink>

          <div className='hidden md:flex items-center space-x-8'>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className='px-5 py-2 rounded-md text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors duration-300'
              >
                {link.name}
              </NavLink>
            ))}
            <ThemeToggle />
          </div>

          <div className='md:hidden flex items-center gap-4'>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className='p-2 rounded-md text-slate-800 dark:text-slate-200 hover:text-slate-600 dark:hover:text-white transition-colors duration-300'
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='md:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-dark-900 shadow-lg'>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className='block px-3 py-2 rounded-md text-lg font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors duration-300'
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
