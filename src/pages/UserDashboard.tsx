import { useSpring, animated } from '@react-spring/web';

function UserDashboardPage() {
  // Animations
  const navbarAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 },
  });

  const sectionAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 },
    delay: 200,
  });

  const cardAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { duration: 500 },
  });

  return (
    <div className='bg-slate-50 min-h-screen text-slate-800 font-sans'>
      {/* Navbar */}
      <animated.nav
        style={navbarAnimation}
        className='bg-white shadow-md fixed top-0 w-full z-10'
      >
        <div className='max-w-7xl mx-auto px-4 py-3 flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-slate-800'>StoryTrack</h1>
          <div className='flex items-center gap-6'>
            <a
              href='/books'
              className='text-slate-600 hover:text-slate-800 transition'
            >
              All Books
            </a>
            <a
              href='/favorites'
              className='text-slate-600 hover:text-slate-800 transition'
            >
              Favorite Books
            </a>
            <a
              href='/settings'
              className='text-slate-600 hover:text-slate-800 transition'
            >
              User Settings
            </a>
            <a
              href='/logout'
              className='px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition'
            >
              Logout
            </a>
          </div>
        </div>
      </animated.nav>

      {/* Main Content */}
      <div className='pt-20 max-w-7xl mx-auto px-4'>
        {/* Recommendations Section */}
        <animated.section style={sectionAnimation} className='mt-10'>
          <h2 className='text-3xl font-bold mb-6'>Recommended for You</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {/* Fetch recommendations from API */}
            {[
              {
                title: 'The Great Gatsby',
                author: 'F. Scott Fitzgerald',
                cover: 'https://via.placeholder.com/150',
                reason: 'Because you like Classics',
              },
              {
                title: '1984',
                author: 'George Orwell',
                cover: 'https://via.placeholder.com/150',
                reason: 'Based on your reading history',
              },
            ].map((recommendation, idx) => (
              <animated.div
                key={idx}
                style={cardAnimation}
                className='bg-white p-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105'
              >
                <img
                  src={recommendation.cover}
                  alt={recommendation.title}
                  className='w-full h-40 object-cover rounded-lg'
                />
                <h3 className='text-lg font-semibold mt-4'>
                  {recommendation.title}
                </h3>
                <p className='text-slate-600'>{recommendation.author}</p>
                <p className='text-slate-500 text-sm mt-2 italic'>
                  {recommendation.reason}
                </p>
              </animated.div>
            ))}
          </div>
        </animated.section>

        {/* Continue Reading Section */}
        <animated.section style={sectionAnimation} className='mt-10'>
          <h2 className='text-3xl font-bold mb-6'>Continue Reading</h2>
          <div className='bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition'>
            <div className='flex items-center gap-6'>
              <img
                src='https://via.placeholder.com/150'
                alt='Book Cover'
                className='w-32 h-40 object-cover rounded-lg'
              />
              <div>
                <h3 className='text-2xl font-bold'>The Catcher in the Rye</h3>
                <p className='text-slate-600'>by J.D. Salinger</p>
                <div className='mt-4'>
                  <p className='text-slate-500'>Progress: Chapter 12 of 20</p>
                  <div className='bg-slate-200 w-full h-2 rounded-full mt-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full'
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
                <button className='mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition'>
                  Continue Reading
                </button>
              </div>
            </div>
          </div>
        </animated.section>

        {/* Bookshelf Section */}
        <animated.section style={sectionAnimation} className='mt-10'>
          <h2 className='text-3xl font-bold mb-6'>Your Bookshelf</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Fetch bookshelf data */}
            {[
              {
                title: 'Moby Dick',
                author: 'Herman Melville',
                cover: 'https://via.placeholder.com/150',
              },
              {
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                cover: 'https://via.placeholder.com/150',
              },
            ].map((book, idx) => (
              <animated.div
                key={idx}
                style={cardAnimation}
                className='bg-white p-4 rounded-lg shadow hover:shadow-lg transition transform hover:scale-105'
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className='w-full h-40 object-cover rounded-lg'
                />
                <h3 className='text-lg font-semibold mt-4'>{book.title}</h3>
                <p className='text-slate-600'>{book.author}</p>
              </animated.div>
            ))}
          </div>
        </animated.section>
      </div>
    </div>
  );
}

export default UserDashboardPage;
