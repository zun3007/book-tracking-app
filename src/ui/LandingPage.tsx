import { useSpring, animated } from '@react-spring/web';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import anime from 'animejs';

function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'StoryTrack | Login';

    // 3D Animation using anime.js
    if (heroRef.current) {
      anime({
        targets: heroRef.current,
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 2000,
        easing: 'easeOutExpo',
      });
    }

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

  // Individual feature animations
  const featureAnimations = [
    useSpring({
      opacity: featureInView ? 1 : 0,
      transform: featureInView ? 'translateX(0)' : 'translateX(-50px)',
      delay: 200,
      config: { duration: 800 },
    }),
    useSpring({
      opacity: featureInView ? 1 : 0,
      transform: featureInView ? 'translateX(0)' : 'translateX(-50px)',
      delay: 400,
      config: { duration: 800 },
    }),
    useSpring({
      opacity: featureInView ? 1 : 0,
      transform: featureInView ? 'translateX(0)' : 'translateX(-50px)',
      delay: 600,
      config: { duration: 800 },
    }),
  ];

  return (
    <div className='bg-gradient-to-b from-slate-50 to-white dark:from-dark-950 dark:to-dark-900 text-slate-800 dark:text-slate-100 font-sans min-h-screen transition-colors duration-300'>
      {/* Hero Section */}
      <section className='relative h-screen flex flex-col justify-center items-center px-4 sm:px-8 shadow-lg pt-20 mb-0'>
        <div className='absolute top-0 left-0 w-full h-full'>
          <video
            className='w-full h-full object-cover z-0 filter blur-sm brightness-90 dark:brightness-75'
            preload='metadata'
            playsInline
            autoPlay
            loop
            muted
            poster='/images/video-poster-1.webp'
            aria-label='Background video showing someone reading a book'
          >
            {/* Desktop Source */}
            <source
              src='/videos/optimized/reading_book_landing_page_desktop.mp4'
              type='video/mp4'
              media='(min-width: 768px)'
            />
            {/* Mobile Source */}
            <source
              src='/videos/optimized/reading_book_landing_page_mobile.mp4'
              type='video/mp4'
              media='(max-width: 767px)'
            />
            <img
              src='/images/video-poster-1.webp'
              alt='Video fallback showing someone reading a book'
              className='w-full h-full object-cover'
              loading='lazy'
            />
          </video>
        </div>
        <div className='absolute top-0 left-0 w-full h-full bg-black opacity-40 dark:opacity-50 z-0'></div>
        <div
          className='relative z-10 flex flex-col items-center text-center'
          ref={heroRef}
        >
          <animated.h1
            style={heroAnimation}
            className='text-4xl sm:text-6xl md:text-7xl font-extrabold text-white'
          >
            Welcome to{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500'>
              StoryTrack
            </span>
          </animated.h1>
          <animated.p
            style={heroAnimation}
            className='mt-4 sm:mt-6 text-base sm:text-lg md:text-2xl max-w-2xl text-white'
          >
            Your ultimate reading companion. Organize, track, and explore books
            effortlessly.
          </animated.p>
          <animated.div
            style={heroAnimation}
            className='mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center'
          >
            <a
              href='#features'
              className='px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold hover:bg-blue-500 dark:hover:bg-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              Learn More
            </a>
            <a
              href='#signup'
              className='px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-slate-900 dark:bg-slate-700 text-white font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              Get Started
            </a>
          </animated.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id='features'
        className='relative min-h-screen py-16 sm:py-20 px-4 sm:px-8 bg-gradient-to-b from-slate-50 to-white dark:from-dark-950 dark:to-dark-900 mb-0 transition-colors duration-300'
        ref={featureRef}
      >
        {/* Sticky Header */}
        <div className='sticky top-0 pt-16 sm:pt-20 pb-8 sm:pb-12 bg-gradient-to-b from-slate-50 dark:from-dark-950 to-transparent z-20 transition-colors duration-300'>
          <animated.div style={featureAnimation}>
            <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-slate-900 dark:text-white'>
              Why Choose{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300'>
                StoryTrack
              </span>
              ?
            </h2>
          </animated.div>
        </div>

        {/* Features Content */}
        <div className='flex flex-col md:flex-row justify-between items-start gap-8 max-w-7xl mx-auto'>
          {/* Features Grid */}
          <div className='flex-1 space-y-8 sm:space-y-12'>
            {[
              {
                title: 'Organize Your Books',
                description:
                  'Sort and categorize your books into virtual shelves effortlessly.',
                icon: '📚',
                image: '/images/feature_1.webp',
              },
              {
                title: 'Set Reading Goals',
                description:
                  'Stay motivated by tracking your reading progress and goals.',
                icon: '🎯',
                image: '/images/feature_2.webp',
              },
              {
                title: 'Discover New Reads',
                description:
                  'Get personalized book recommendations tailored to your preferences.',
                icon: '✨',
                image: '/images/feature_3.webp',
              },
            ].map((feature, idx) => (
              <animated.div
                key={idx}
                style={featureAnimations[idx]}
                className='p-4 sm:p-6 bg-white dark:bg-dark-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 max-w-full sm:max-w-lg flex flex-col items-center border border-slate-200 dark:border-dark-700'
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className='w-full h-32 sm:h-48 object-cover rounded-t-lg mb-4'
                />
                <div className='text-3xl sm:text-4xl mb-2'>{feature.icon}</div>
                <h3 className='text-xl sm:text-2xl font-bold mb-2 text-slate-900 dark:text-white'>
                  {feature.title}
                </h3>
                <p className='text-base sm:text-lg text-slate-600 dark:text-slate-300 text-center'>
                  {feature.description}
                </p>
              </animated.div>
            ))}
          </div>

          {/* Sticky Anime Character */}
          <div className='sticky top-10 w-full md:w-1/3 h-[60vh] md:h-[90vh]'>
            <div
              className='h-full transition-transform duration-300'
              ref={characterRef}
            >
              <img
                src='/images/anime_character.webp'
                alt='Anime Character'
                className='h-full object-contain filter dark:brightness-90'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        id='signup'
        className='relative h-screen flex flex-col justify-center items-center px-4 sm:px-8 shadow-lg pt-20 mb-0'
        ref={ctaRef}
      >
        <div className='absolute top-0 left-0 w-full h-full'>
          <video
            className='w-full h-full object-cover z-0 filter blur-sm brightness-90 dark:brightness-75'
            preload='metadata'
            playsInline
            autoPlay
            loop
            muted
            poster='/images/video-poster-2.webp'
            aria-label='Promotional video for StoryTrack showing reading experience'
          >
            {/* Desktop Source */}
            <source
              src='/videos/optimized/reading_book_landing_page_1_desktop.mp4'
              type='video/mp4'
              media='(min-width: 768px)'
            />
            {/* Mobile Source */}
            <source
              src='/videos/optimized/reading_book_landing_page_1_mobile.mp4'
              type='video/mp4'
              media='(max-width: 767px)'
            />
            <img
              src='/images/video-poster-2.webp'
              alt='Video fallback showing reading experience'
              className='w-full h-full object-contain'
              loading='lazy'
            />
          </video>
        </div>
        <div className='absolute top-0 left-0 w-full h-full bg-black opacity-40 dark:opacity-50 z-0'></div>
        <div className='relative z-10 flex flex-col items-center text-center'>
          <animated.h2
            style={ctaAnimation}
            className='text-4xl sm:text-6xl md:text-7xl font-extrabold text-white'
          >
            Ready to Join{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500'>
              StoryTrack
            </span>
            ?
          </animated.h2>
          <animated.p
            style={ctaAnimation}
            className='mt-4 sm:mt-6 text-base sm:text-lg md:text-2xl max-w-2xl text-white'
          >
            Sign up today and take the first step toward mastering your reading
            journey.
          </animated.p>
          <animated.a
            style={ctaAnimation}
            href='/register'
            className='mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-blue-600 dark:bg-blue-500 text-white font-semibold hover:bg-blue-500 dark:hover:bg-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
          >
            Sign Up Now
          </animated.a>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
