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
    <div className='bg-gradient-to-b from-slate-100 to-white text-slate-800 font-sans min-h-screen'>
      {/* Hero Section */}
      <section className='relative h-screen flex flex-col justify-center items-center px-4 sm:px-8 shadow-md pt-20 mb-0'>
        <div className='absolute top-0 left-0 w-full h-full'>
          <video
            className='w-full h-full object-cover z-0 filter blur-sm'
            preload='auto'
            playsInline
            autoPlay
            loop
            muted
            poster='/images/video-poster-1.webp'
            aria-label='Background video showing someone reading a book'
          >
            <source
              src='/videos/reading_book_landing_page.webm'
              type='video/webm'
              media="all and (min-width: 768px)"
            />
            <source
              src='/videos/reading_book_landing_page.mp4'
              type='video/mp4'
              media="all and (min-width: 768px)"
            />
            <img
              src='/images/video-poster-1.webp'
              alt='Video fallback showing someone reading a book'
              className='w-full h-full object-cover'
            />
          </video>
        </div>
        <div className='absolute top-0 left-0 w-full h-full bg-black opacity-30 z-0'></div>
        <div
          className='relative z-10 flex flex-col items-center text-center'
          ref={heroRef}
        >
          <animated.h1
            style={heroAnimation}
            className='text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-100'
          >
            Welcome to StoryTrack
          </animated.h1>
          <animated.p
            style={heroAnimation}
            className='mt-4 sm:mt-6 text-base sm:text-lg md:text-2xl max-w-2xl text-slate-100'
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
              className='px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-400 transition shadow-lg hover:shadow-xl'
            >
              Learn More
            </a>
            <a
              href='#signup'
              className='px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition shadow-lg hover:shadow-xl'
            >
              Get Started
            </a>
          </animated.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id='features'
        className='relative min-h-screen py-16 sm:py-20 px-4 sm:px-8 bg-gradient-to-b from-slate-100 to-white mb-0'
        ref={featureRef}
      >
        {/* Sticky Header */}
        <div className='sticky top-0 pt-16 sm:pt-20 pb-8 sm:pb-12 bg-gradient-to-b from-slate-100 to-transparent z-20'>
          <animated.div style={featureAnimation}>
            <h2 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-center'>
              Why Choose StoryTrack?
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
                className='p-4 sm:p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition transform hover:scale-105 max-w-full sm:max-w-lg flex flex-col items-center'
              >
                <img
                  src={feature.image}
                  alt={feature.title}
                  className='w-full h-32 sm:h-48 object-cover rounded-t-lg mb-4'
                />
                <div className='text-3xl sm:text-4xl mb-2'>{feature.icon}</div>
                <h3 className='text-xl sm:text-2xl font-bold mb-2'>
                  {feature.title}
                </h3>
                <p className='text-base sm:text-lg text-slate-600 text-center'>
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
                className='h-full object-contain'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        id='signup'
        className='relative h-screen flex flex-col justify-center items-center px-4 sm:px-8 shadow-md pt-20 mb-0'
        ref={ctaRef}
      >
        <div className='absolute top-0 left-0 w-full h-full'>
          <video
            className='w-full h-full object-cover z-0 filter blur-sm'
            preload='auto'
            playsInline
            autoPlay
            loop
            muted
            poster='/images/video-poster-2.webp'
            aria-label='Promotional video for StoryTrack showing reading experience'
          >
            <source
              src='/videos/reading_book_landing_page_1.webm'
              type='video/webm'
              media="all and (min-width: 768px)"
            />
            <source
              src='/videos/reading_book_landing_page_1.mp4'
              type='video/mp4'
              media="all and (min-width: 768px)"
            />
            <img
              src='/images/video-poster-2.webp'
              alt='Video fallback showing reading experience'
              className='w-full h-full object-cover'
            />
          </video>
        </div>
        <div className='absolute top-0 left-0 w-full h-full bg-black opacity-30 z-0'></div>
        <div className='relative z-10 flex flex-col items-center text-center'>
          <animated.h2
            style={ctaAnimation}
            className='text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-100'
          >
            Ready to Join StoryTrack?
          </animated.h2>
          <animated.p
            style={ctaAnimation}
            className='mt-4 sm:mt-6 text-base sm:text-lg md:text-2xl max-w-2xl text-slate-100'
          >
            Sign up today and take the first step toward mastering your reading
            journey.
          </animated.p>
          <animated.a
            style={ctaAnimation}
            href='/register'
            className='mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-blue-500 text-white font-semibold shadow-lg hover:shadow-xl hover:bg-blue-400 transition'
          >
            Sign Up Now
          </animated.a>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
