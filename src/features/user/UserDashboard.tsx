import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAppSelector } from '../../app/hooks';
import { useRecommendation } from '../../hooks/useRecommendation';
import { useUserStats } from '../../hooks/useUserStats';
import {
  navigationIcons,
  statIcons,
  featureIcons,
  interactiveIcons,
} from '../../config/icons';
import { Link } from 'react-router-dom';
import OptimizedImage from '../../components/ui/OptimizedImage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard from '../../components/StatCard';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Store } from '../../types/store';
import { fahasaStores } from './../../data/fahasaStores';
import { toast } from 'react-hot-toast';
import L from 'leaflet';

function getGoogleMapsUrl(
  address: string,
  coordinates: [number, number]
): string {
  const [lat, lng] = coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// Add this animation variants
const mapSectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2,
    },
  },
};

const storeItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  hover: { scale: 1.02, backgroundColor: 'rgb(243 244 246)' },
};

interface Location {
  latitude: number;
  longitude: number;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Add this interface for stores with distance
interface StoreWithDistance extends Store {
  distance?: number;
}

// Add the createCustomIcon function
function createCustomIcon(emoji: string, title: string) {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-lg text-lg" title="${title}">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Add this component for the recommendation skeleton
const RecommendationSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className='mt-16 bg-white/80 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full shadow-xl'
  >
    <div className='flex gap-6'>
      {/* Book thumbnail skeleton */}
      <div className='w-32 h-48 flex-shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse' />

      <div className='flex-1'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2 flex-1'>
            {/* Title skeleton */}
            <div className='h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 animate-pulse' />
            {/* Author skeleton */}
            <div className='h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2 animate-pulse' />
          </div>
          {/* Rating skeleton */}
          <div className='w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse' />
        </div>

        {/* Description skeleton */}
        <div className='mt-4 space-y-2'>
          <div className='h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse' />
          <div className='h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse' />
        </div>

        {/* Actions skeleton */}
        <div className='mt-6 flex items-center justify-between'>
          <div className='flex gap-2'>
            <div className='w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse' />
            <div className='w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse' />
          </div>
          <div className='w-32 h-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse' />
        </div>
      </div>
    </div>
  </motion.div>
);

export default function UserDashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const {
    recommendation,
    isLoading: recLoading,
    handleFeedback,
    dismissRecommendation,
  } = useRecommendation(user?.id);
  const { stats, isLoading: statsLoading } = useUserStats(user?.id);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    10.8231, 106.6297,
  ]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [sortedStores, setSortedStores] =
    useState<StoreWithDistance[]>(fahasaStores);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    const getUserLocation = () => {
      setIsLoadingLocation(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });

            // Sort stores by distance from user
            const storesWithDistance = fahasaStores.map(
              (store): StoreWithDistance => ({
                ...store,
                distance: calculateDistance(
                  latitude,
                  longitude,
                  store.coordinates[0],
                  store.coordinates[1]
                ),
              })
            );

            const sorted = storesWithDistance.sort(
              (a, b) => a.distance - b.distance
            );
            setSortedStores(sorted);

            // Set map center to user's location
            setMapCenter([latitude, longitude]);
            setIsLoadingLocation(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            setIsLoadingLocation(false);
            toast.error('Could not get your location. Showing all stores.');
          }
        );
      } else {
        setIsLoadingLocation(false);
        toast.error('Geolocation is not supported by your browser');
      }
    };

    getUserLocation();
  }, []);

  return (
    <div className='min-h-screen bg-slate-50 mt-6'>
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className='relative min-h-[100dvh] w-full overflow-hidden'
      >
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
          <motion.div
            className='absolute inset-0 opacity-[0.03] dark:opacity-[0.07]'
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, rgba(51, 65, 85, 0.25) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        {/* Content */}
        <div className='relative z-10 container mx-auto px-4'>
          <div className='flex flex-col items-center justify-center min-h-[100dvh] py-20'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-center space-y-8 max-w-4xl'
            >
              <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-800 dark:text-slate-100 leading-tight tracking-tight'>
                Your Reading Journey{' '}
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400'>
                  Starts Here
                </span>
              </h1>
              <p className='text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed'>
                Track your books, discover new stories, and connect with fellow
                readers in one beautiful place.
              </p>

              {/* CTA Buttons */}
              <div className='flex flex-wrap justify-center gap-4 mt-8'>
                <Link
                  to='/books'
                  className='px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-semibold 
                    hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 
                    flex items-center gap-3 group'
                >
                  <navigationIcons.library.icon className='w-5 h-5 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform' />
                  <span>{navigationIcons.library.name}</span>
                </Link>
                <Link
                  to='/bookshelf'
                  className='px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 
                    text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 
                    dark:hover:to-purple-600 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 
                    flex items-center gap-3 group'
                >
                  <navigationIcons.readingList.icon className='w-5 h-5 group-hover:scale-110 transition-transform' />
                  <span>Start Reading</span>
                </Link>
              </div>
            </motion.div>

            {/* Featured Book with Loading State */}
            {recLoading ? (
              <RecommendationSkeleton />
            ) : recommendation ? (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className='mt-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full 
                  shadow-xl hover:shadow-2xl transition-all border border-slate-200/50 dark:border-slate-700/50'
              >
                <div className='flex gap-8'>
                  <div className='w-36 h-52 flex-shrink-0 overflow-hidden rounded-2xl shadow-lg transform hover:scale-105 transition-transform'>
                    <OptimizedImage
                      src={recommendation.book.thumbnail}
                      alt={recommendation.book.title}
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div className='flex-1 space-y-6'>
                    <div className='flex items-start justify-between gap-4'>
                      <div>
                        <h3 className='text-2xl font-bold text-slate-800 dark:text-slate-100'>
                          {recommendation.book.title}
                        </h3>
                        <p className='text-slate-600 dark:text-slate-400 mt-2'>
                          {recommendation.book.authors.join(', ')}
                        </p>
                      </div>
                      <div className='flex items-center gap-1.5 bg-yellow-100/80 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full'>
                        <interactiveIcons.rating className='w-4 h-4 text-yellow-500 fill-yellow-500' />
                        <span className='text-sm font-medium text-yellow-700 dark:text-yellow-500'>
                          {recommendation.book.average_rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className='text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed'>
                      {recommendation.book.description}
                    </p>

                    <div className='flex items-center justify-between pt-2'>
                      <div className='flex gap-3'>
                        <motion.button
                          onClick={() => handleFeedback('liked')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className='p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 
                            transition-colors group'
                          title='Like'
                        >
                          <interactiveIcons.like className='w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors' />
                        </motion.button>
                        <motion.button
                          onClick={() => handleFeedback('disliked')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className='p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 hover:bg-red-100 dark:hover:bg-red-900/30 
                            transition-colors group'
                          title='Dislike'
                        >
                          <interactiveIcons.dislike className='w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-red-500 transition-colors' />
                        </motion.button>
                      </div>
                      <Link
                        to={`/book/${recommendation.book.id}`}
                        className='flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50 
                          transition-colors px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 group'
                      >
                        View Details
                        <interactiveIcons.arrow className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className='absolute bottom-8 left-1/2 -translate-x-1/2'
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <div className='w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center'>
            <motion.div
              className='w-1 h-2 bg-slate-500 rounded-full mt-2'
              animate={{
                y: [0, 16, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className='py-24 bg-white dark:bg-slate-900'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-20'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='space-y-6'
            >
              <h2 className='text-4xl sm:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight'>
                Your Personal Reading Companion
              </h2>
              <p className='text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed'>
                Discover a new way to track, explore, and enjoy your reading
                journey
              </p>
            </motion.div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className='relative group'
              >
                <div
                  className='bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 shadow-lg hover:shadow-xl 
                  transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 
                  hover:border-slate-300 dark:hover:border-slate-600'
                >
                  <div
                    className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 
                    dark:from-blue-500/10 dark:to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 
                    transition-opacity duration-500'
                  />
                  <div className='relative space-y-6'>
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 
                        transition-transform group-hover:scale-110 ${feature.bgColor}`}
                    >
                      <feature.icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className='text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3'>
                        {feature.name}
                      </h3>
                      <p className='text-slate-600 dark:text-slate-300 leading-relaxed'>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className='py-24 bg-slate-50 dark:bg-slate-800/50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-20'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className='space-y-6'
            >
              <h2 className='text-4xl sm:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight'>
                Your Reading Statistics
              </h2>
              <p className='text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed'>
                Track your progress and see how your reading journey evolves
              </p>
            </motion.div>
          </div>

          {statsLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50'
                >
                  <div className='h-14 w-14 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-6' />
                  <div className='h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4' />
                  <div className='h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg' />
                </div>
              ))}
            </div>
          ) : (
            // Actual content
            <>
              {/* Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
                {Object.entries(statIcons).map(([key, stat], index) => {
                  const statKey = key as keyof UserStats;
                  const colors = {
                    totalBooks: 'blue',
                    reading: 'green',
                    completed: 'purple',
                    favorites: 'red',
                  };
                  const color = colors[key as keyof typeof colors];

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <StatCard
                        title={stat.name}
                        value={stats?.[statKey] || 0}
                        icon={stat.icon}
                        color={color}
                        trend={stat.trend}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Charts Grid */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Reading Progress Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className='bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50'
                >
                  <h3 className='text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-8'>
                    Monthly Reading Progress
                  </h3>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={stats?.monthly_progress || []}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' />
                        <XAxis
                          dataKey='month'
                          stroke='#64748B'
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: '#CBD5E1' }}
                        />
                        <YAxis
                          stroke='#64748B'
                          fontSize={12}
                          tickLine={false}
                          axisLine={{ stroke: '#CBD5E1' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '1rem',
                            border: 'none',
                            boxShadow:
                              '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          }}
                        />
                        <Bar
                          dataKey='books_read'
                          fill='url(#colorGradient)'
                          radius={[6, 6, 0, 0]}
                        />
                        <defs>
                          <linearGradient
                            id='colorGradient'
                            x1='0'
                            y1='0'
                            x2='0'
                            y2='1'
                          >
                            <stop
                              offset='0%'
                              stopColor='#3B82F6'
                              stopOpacity={1}
                            />
                            <stop
                              offset='100%'
                              stopColor='#60A5FA'
                              stopOpacity={0.8}
                            />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Genre Distribution Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className='bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50'
                >
                  <h3 className='text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-8'>
                    Genre Distribution
                  </h3>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={Object.entries(
                            stats?.genres_distribution || {}
                          ).map(([name, value]) => ({
                            name,
                            value,
                          }))}
                          cx='50%'
                          cy='50%'
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey='value'
                        >
                          {Object.entries(stats?.genres_distribution || {}).map(
                            (_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '1rem',
                            border: 'none',
                            boxShadow:
                              '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Genre Legend */}
                  <div className='grid grid-cols-2 gap-4 mt-8'>
                    {Object.entries(stats?.genres_distribution || {})
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([genre, count], index) => (
                        <div key={genre} className='flex items-center gap-3'>
                          <div
                            className='w-3 h-3 rounded-full'
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className='text-sm text-slate-600 dark:text-slate-300 truncate'>
                            {genre}
                          </span>
                          <span className='text-sm text-slate-400 dark:text-slate-500 ml-auto'>
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              </div>

              {/* Reading Streak Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className='mt-8 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2'>
                      Reading Streak
                    </h3>
                    <p className='text-slate-600 dark:text-slate-300'>
                      You've been reading consistently for{' '}
                      <span className='font-semibold text-blue-600 dark:text-blue-400'>
                        {stats?.reading_streak || 0} months
                      </span>
                    </p>
                  </div>
                  <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center'>
                    <interactiveIcons.streak className='w-8 h-8 text-blue-500 dark:text-blue-400' />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Fahasa Stores Map Section */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <motion.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true }}
            variants={mapSectionVariants}
            className='space-y-16'
          >
            {/* Header */}
            <div className='text-center'>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className='inline-block'
              >
                <span className='px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-medium mb-4 inline-block'>
                  Find Us
                </span>
              </motion.div>
              <h2 className='text-4xl font-bold text-slate-800 mb-4'>
                Visit Our Bookstores
              </h2>
              <p className='text-slate-600 max-w-2xl mx-auto'>
                Discover Fahasa bookstores near you and embark on your next
                reading adventure
              </p>
            </div>

            {/* Map Container */}
            <div className='flex flex-col lg:flex-row gap-6 bg-slate-50 rounded-2xl p-6 shadow-lg'>
              {/* Sidebar */}
              <motion.div
                variants={mapSectionVariants}
                className='lg:w-96 bg-white rounded-xl shadow-md overflow-hidden'
              >
                <div className='p-4 border-b border-slate-100'>
                  <div className='relative'>
                    <input
                      type='text'
                      placeholder='Search stores...'
                      className='w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
                    />
                    <motion.span
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      🔍
                    </motion.span>
                  </div>
                </div>

                <div className='h-[500px] overflow-y-auto'>
                  {isLoadingLocation ? (
                    <div className='flex items-center justify-center h-32'>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className='w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full'
                      />
                    </div>
                  ) : (
                    sortedStores.map((store) => (
                      <motion.button
                        key={store.id}
                        variants={storeItemVariants}
                        whileHover='hover'
                        onClick={() => {
                          setSelectedStore(store);
                          setMapCenter(store.coordinates);
                        }}
                        className={`w-full p-4 text-left border-b border-slate-100 transition-colors ${
                          selectedStore?.id === store.id
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <h3 className='font-semibold text-slate-800'>
                          {store.name}
                        </h3>
                        <p className='text-sm text-slate-600 mt-1'>
                          {store.address}
                        </p>
                        <div className='flex items-center gap-2 mt-2 text-sm text-slate-500'>
                          <span>{store.phone}</span>
                          <span>•</span>
                          <span>{store.opening_hours}</span>
                          {store.distance !== undefined && (
                            <>
                              <span>•</span>
                              <span className='text-blue-600 font-medium'>
                                {store.distance.toFixed(1)} km away
                              </span>
                            </>
                          )}
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Map */}
              <motion.div
                variants={mapSectionVariants}
                className='flex-1 rounded-xl overflow-hidden shadow-lg'
                style={{ height: '600px' }}
              >
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  className='w-full h-full'
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  />
                  {sortedStores.map((store) => (
                    <Marker
                      key={store.id}
                      position={store.coordinates}
                      icon={createCustomIcon('📚', store.name)}
                      eventHandlers={{
                        click: () => setSelectedStore(store),
                      }}
                    >
                      <Popup className='bookstore-popup'>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className='p-4'
                        >
                          <h3 className='font-semibold text-slate-800 mb-2'>
                            {store.name}
                          </h3>
                          <p className='text-sm text-slate-600 mb-3'>
                            {store.address}
                          </p>
                          <div className='flex items-center gap-2 mb-4 text-sm text-slate-500'>
                            <span>{store.phone}</span>
                            <span>•</span>
                            <span>{store.opening_hours}</span>
                          </div>

                          {/* Navigation Button */}
                          <motion.a
                            href={getGoogleMapsUrl(
                              store.address,
                              store.coordinates
                            )}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors'
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg
                              className='w-5 h-5'
                              fill='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' />
                            </svg>
                            <span className='text-slate-50'>Navigate</span>
                          </motion.a>
                        </motion.div>
                      </Popup>
                    </Marker>
                  ))}
                  {userLocation && (
                    <Marker
                      position={[userLocation.latitude, userLocation.longitude]}
                      icon={createCustomIcon('🏠', 'Your Location')}
                    >
                      <Popup>
                        <div className='p-2'>
                          <h3 className='font-semibold text-slate-800'>
                            Your Location
                          </h3>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  <MapController center={mapCenter} />
                </MapContainer>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Copyright Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className='py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700'
      >
        <div className='container mx-auto px-4'>
          <div className='flex flex-col items-center justify-center text-center'>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className='text-gray-600 dark:text-gray-400 text-sm pb-6'
            >
              © {new Date().getFullYear()} Designed & Developed by{' '}
              <span className='font-semibold text-blue-600 dark:text-blue-400'>
                Zun
              </span>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

const features = Object.values(featureIcons);

const COLORS = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#6366F1',
];

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);

  return null;
}
