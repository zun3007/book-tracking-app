import { useSpring, animated } from '@react-spring/web';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

function LandingPage() {
  useEffect(() => {
    document.title = 'StoryTrack | Login';

    return () => {
      document.title = 'StoryTrack';
    };
  }, []);

  // Hero Animations
  const heroAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 800 },
  });

  const [featureRef, featureInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const featureAnimation = useSpring({
    opacity: featureInView ? 1 : 0,
    transform: featureInView ? 'translateX(0)' : 'translateX(-50px)',
    config: { duration: 800 },
  });

  const [ctaRef, ctaInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const ctaAnimation = useSpring({
    opacity: ctaInView ? 1 : 0,
    transform: ctaInView ? 'translateY(0)' : 'translateY(50px)',
    config: { duration: 800 },
  });

  return (
    <div className='bg-white text-slate-800 font-sans min-h-screen'>
      {/* Hero Section */}
      <section className='relative h-screen bg-white text-center flex flex-col justify-center items-center px-8 shadow-md pt-20'>
        <animated.h1
          style={heroAnimation}
          className='text-6xl sm:text-7xl font-extrabold'
        >
          Welcome to StoryTrack
        </animated.h1>
        <animated.p
          style={heroAnimation}
          className='mt-6 text-lg sm:text-2xl max-w-2xl text-slate-600'
        >
          Your ultimate reading companion. Organize, track, and explore books
          effortlessly.
        </animated.p>
        <animated.div style={heroAnimation} className='mt-8 flex gap-6'>
          <a
            href='#features'
            className='px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-400 transition'
          >
            Learn More
          </a>
          <a
            href='#signup'
            className='px-6 py-3 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition'
          >
            Get Started
          </a>
        </animated.div>
      </section>

      {/* Features Section */}
      <section
        id='features'
        className='py-20 px-8 bg-slate-100'
        ref={featureRef}
      >
        <animated.div style={featureAnimation}>
          <h2 className='text-4xl sm:text-5xl font-extrabold text-center mb-12'>
            Why Choose StoryTrack?
          </h2>
        </animated.div>
        <animated.div
          style={featureAnimation}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto'
        >
          {[
            {
              title: 'Organize Your Books',
              description:
                'Sort and categorize your books into virtual shelves effortlessly.',
              icon: '📚',
            },
            {
              title: 'Set Reading Goals',
              description:
                'Stay motivated by tracking your reading progress and goals.',
              icon: '🎯',
            },
            {
              title: 'Discover New Reads',
              description:
                'Get personalized book recommendations tailored to your preferences.',
              icon: '✨',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className='p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105'
            >
              <div className='text-4xl'>{feature.icon}</div>
              <h3 className='text-2xl font-bold mt-4'>{feature.title}</h3>
              <p className='mt-2 text-slate-600'>{feature.description}</p>
            </div>
          ))}
        </animated.div>
      </section>

      {/* Call to Action Section */}
      <section
        id='signup'
        className='py-20 px-8 text-center bg-slate-100'
        ref={ctaRef}
      >
        <animated.h2
          style={ctaAnimation}
          className='text-4xl sm:text-5xl font-extrabold text-slate-800'
        >
          Ready to Join StoryTrack?
        </animated.h2>
        <animated.p
          style={ctaAnimation}
          className='mt-4 text-lg sm:text-xl text-slate-600'
        >
          Sign up today and take the first step toward mastering your reading
          journey.
        </animated.p>
        <animated.a
          style={ctaAnimation}
          href='/signup'
          className='inline-block mt-8 px-8 py-4 rounded-lg bg-blue-500 text-white font-semibold shadow-lg hover:shadow-xl hover:bg-blue-400 transition'
        >
          Sign Up Now
        </animated.a>
      </section>
    </div>
  );
}

export default LandingPage;
