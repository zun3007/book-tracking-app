import { Link } from 'react-router-dom';

const LandingNavbar = () => {
  return (
    <nav className='bg-white fixed top-0 w-full shadow-md z-10'>
      <div className='max-w-7xl mx-auto px-4 py-3 flex justify-between items-center'>
        <Link to='/' className='text-2xl font-bold text-slate-800'>
          StoryTrack
        </Link>
        <div className='flex items-center gap-6'>
          <Link
            to='/#features'
            className='text-slate-600 hover:text-slate-800 transition'
          >
            Features
          </Link>
          <Link
            to='/#signup'
            className='text-slate-600 hover:text-slate-800 transition'
          >
            Get Started
          </Link>
          <Link
            to='/login'
            className='px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-400 transition'
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
