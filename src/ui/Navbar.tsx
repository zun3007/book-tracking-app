import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navbarAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 },
  });

  const location = useLocation();

  // Function to apply active class styling
  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-blue-600 font-semibold'
      : 'text-slate-600 hover:text-blue-600';

  return (
    <animated.nav
      style={navbarAnimation}
      className='bg-white shadow-md py-4 px-8 fixed top-0 w-full z-10'
    >
      <div className='max-w-7xl mx-auto flex justify-between items-center'>
        {/* Logo */}
        <Link to='/dashboard' className='text-3xl font-extrabold text-blue-600'>
          StoryTrack
        </Link>

        {/* Navigation Links */}
        <div className='flex gap-6'>
          <Link
            to='/dashboard'
            className={`${isActive('/dashboard')} transition`}
          >
            Home
          </Link>
          <Link to='/books' className={`${isActive('/books')} transition`}>
            All Books
          </Link>
          <Link
            to='/favorites'
            className={`${isActive('/favorites')} transition`}
          >
            Favorites
          </Link>
          <Link
            to='/settings'
            className={`${isActive('/settings')} transition`}
          >
            Settings
          </Link>
          <Link
            to='/logout'
            className='text-red-500 hover:text-red-400 font-medium transition'
          >
            Logout
          </Link>
        </div>
      </div>
    </animated.nav>
  );
};

export default Navbar;
