import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, X, Navigation2 } from 'lucide-react';
import L from 'leaflet';
import { Store } from '../../types/store';
import { fahasaStores } from '../../data/fahasaStores';
import { toast } from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

interface Location {
  latitude: number;
  longitude: number;
}

interface StoreWithDistance extends Store {
  distance?: number;
}

// Animation variants
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
  hover: {
    scale: 1.01,
    transition: { duration: 0.2 },
  },
};

// Helper functions
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

function getGoogleMapsUrl(
  address: string,
  coordinates: [number, number]
): string {
  const [lat, lng] = coordinates;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function createCustomIcon(emoji: string, title: string) {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-lg text-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50" title="${title}">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);

  return null;
}

// Add custom scrollbar styles
const scrollbarStyles = `
@layer utilities {
  .scrollbar-custom {
    scrollbar-width: thin;
    scrollbar-color: rgb(203 213 225) rgb(241 245 249);
  }
  .scrollbar-custom::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-custom::-webkit-scrollbar-track {
    background: rgb(241 245 249);
    border-radius: 4px;
  }
  .scrollbar-custom::-webkit-scrollbar-thumb {
    background-color: rgb(203 213 225);
    border-radius: 4px;
  }
  .dark .scrollbar-custom {
    scrollbar-color: rgb(51 65 85) rgb(30 41 59);
  }
  .dark .scrollbar-custom::-webkit-scrollbar-track {
    background: rgb(30 41 59);
  }
  .dark .scrollbar-custom::-webkit-scrollbar-thumb {
    background-color: rgb(51 65 85);
  }
}
`;

export default function StoreMapSection() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    10.8231, 106.6297,
  ]);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [sortedStores, setSortedStores] =
    useState<StoreWithDistance[]>(fahasaStores);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStores, setFilteredStores] = useState<StoreWithDistance[]>([]);

  // Custom styles for Leaflet popup
  const popupCustomStyles = `
    .leaflet-popup-content-wrapper {
      background: rgb(255 255 255 / 0.9) !important;
      box-shadow: none !important;
      border: none !important;
    }
    .dark .leaflet-popup-content-wrapper {
      background: rgb(30 41 59 / 0.9) !important;
    }
    .leaflet-popup-content {
      margin: 0 !important;
      background: transparent !important;
    }
    .leaflet-popup-tip {
      background: rgb(255 255 255 / 0.9) !important;
    }
    .dark .leaflet-popup-tip {
      background: rgb(30 41 59 / 0.9) !important;
    }
  `;

  // Add styles to document head
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.innerText = popupCustomStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

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
              (a, b) => (a.distance || 0) - (b.distance || 0)
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

  useEffect(() => {
    // Filter stores based on search query
    const filtered = sortedStores.filter((store) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        store.name.toLowerCase().includes(searchLower) ||
        store.address.toLowerCase().includes(searchLower) ||
        store.phone.includes(searchQuery)
      );
    });
    setFilteredStores(filtered);
  }, [searchQuery, sortedStores]);

  useEffect(() => {
    // Add scrollbar styles to head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = scrollbarStyles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <section
      className='py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 
      transition-colors duration-300'
    >
      <div className='container mx-auto px-4 pb-4 pt-16'>
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
              <span
                className='px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 
                rounded-full text-sm font-medium mb-4 inline-block backdrop-blur-sm border border-blue-100/50 
                dark:border-blue-800/50'
              >
                Find Us
              </span>
            </motion.div>
            <h2 className='text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4'>
              Visit Our Bookstores
            </h2>
            <p className='text-slate-600 dark:text-slate-300 max-w-2xl mx-auto'>
              Discover Fahasa bookstores near you and embark on your next
              reading adventure
            </p>
          </div>

          {/* Map Container */}
          <div
            className='flex flex-col lg:flex-row gap-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl p-6 
            shadow-lg backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 min-h-[600px]'
          >
            {/* Sidebar */}
            <motion.div
              variants={mapSectionVariants}
              className='lg:w-96 bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-lg flex flex-col
                border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm h-[600px]'
            >
              {/* Search Bar Container */}
              <div className='p-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shrink-0'>
                <div className='relative'>
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search by name, address or phone...'
                    className='w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 
                      bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 
                      placeholder-slate-400 dark:placeholder-slate-500 
                      focus:border-blue-500 dark:focus:border-blue-400 
                      focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 
                      outline-none transition-all duration-200'
                  />
                  <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                    <Search className='w-5 h-5 text-slate-400 dark:text-slate-500' />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className='absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg 
                        hover:bg-slate-100 dark:hover:bg-slate-700 
                        text-slate-400 dark:text-slate-500 
                        hover:text-slate-600 dark:hover:text-slate-300 
                        transition-colors'
                      title='Clear search'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>
                {/* Sort options */}
                <div className='flex items-center gap-2 mt-4 text-sm'>
                  <span className='text-slate-500 dark:text-slate-400'>
                    Sort by:
                  </span>
                  <button
                    onClick={() => {
                      const sorted = [...sortedStores].sort(
                        (a, b) =>
                          (a.distance || Infinity) - (b.distance || Infinity)
                      );
                      setSortedStores(sorted);
                    }}
                    className='px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 
                      text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 
                      transition-colors border border-blue-100/50 dark:border-blue-800/50'
                  >
                    Distance
                  </button>
                  <button
                    onClick={() => {
                      const sorted = [...sortedStores].sort((a, b) =>
                        a.name.localeCompare(b.name)
                      );
                      setSortedStores(sorted);
                    }}
                    className='px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 
                      text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 
                      transition-colors border border-blue-100/50 dark:border-blue-800/50'
                  >
                    Name
                  </button>
                </div>
              </div>

              {/* Store List */}
              <div className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-custom min-h-0'>
                {filteredStores.map((store) => (
                  <motion.div
                    key={store.id}
                    variants={storeItemVariants}
                    whileHover='hover'
                    onClick={() => {
                      setSelectedStore(store);
                      setMapCenter(store.coordinates);
                    }}
                    className={`w-full p-4 text-left transition-all duration-200 relative border-l-4
                      ${
                        selectedStore?.id === store.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-l-blue-500 dark:border-l-blue-400'
                          : 'border-l-transparent hover:bg-slate-100/80 dark:hover:bg-slate-700/50 hover:border-l-blue-400/50 dark:hover:border-l-blue-400/50'
                      }
                      border-b border-b-slate-200/50 dark:border-b-slate-700/50
                      cursor-pointer group`}
                  >
                    <div className='space-y-2'>
                      <h3
                        className='font-semibold text-slate-900 dark:text-slate-100 
                        group-hover:text-blue-600 dark:group-hover:text-blue-400 
                        transition-colors duration-200'
                      >
                        {store.name}
                      </h3>
                      <p
                        className='text-sm text-slate-600 dark:text-slate-300 
                        group-hover:text-slate-700 dark:group-hover:text-slate-200 
                        transition-colors duration-200'
                      >
                        {store.address}
                      </p>
                      <div
                        className='flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 
                        group-hover:text-slate-600 dark:group-hover:text-slate-300 
                        transition-colors duration-200'
                      >
                        <span>{store.phone}</span>
                        <span>•</span>
                        <span>{store.opening_hours}</span>
                      </div>
                      {store.distance && (
                        <div
                          className='text-sm text-blue-600 dark:text-blue-400 font-medium 
                          group-hover:text-blue-700 dark:group-hover:text-blue-300 
                          transition-colors duration-200'
                        >
                          {store.distance.toFixed(1)} km away
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Map */}
            <div
              className='lg:flex-1 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 
              bg-slate-100 dark:bg-slate-800 shadow-lg h-[600px]'
            >
              <MapContainer
                center={mapCenter}
                zoom={15}
                className='h-full w-full'
                zoomControl={false}
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
                    <Popup className='rounded-xl overflow-hidden dark:bg-slate-800'>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 '
                      >
                        <h3 className='font-semibold text-lg mb-2'>
                          {store.name}
                        </h3>
                        <p className='text-sm text-slate-600 dark:text-slate-400 mb-3'>
                          {store.address}
                        </p>
                        <div className='flex items-center gap-2 mb-4 text-sm text-slate-500 dark:text-slate-400'>
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
                          className='flex items-center justify-center gap-2 w-full px-4 py-2.5 
                            bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 
                            hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600 
                            text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl 
                            hover:-translate-y-0.5 group'
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Navigation2 className='w-5 h-5 group-hover:translate-y-0.5 transition-transform fill-slate-50' />
                          <span className='font-medium text-slate-50'>
                            Navigate
                          </span>
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
                      <div className='p-4 bg-white dark:bg-slate-800 rounded-lg'>
                        <h3 className='font-semibold text-slate-800 dark:text-slate-100'>
                          Your Location
                        </h3>
                      </div>
                    </Popup>
                  </Marker>
                )}
                <MapController center={mapCenter} />
              </MapContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add global styles for dark mode scrollbar */}
      <style jsx global>{`
        .dark .overflow-y-auto {
          --scrollbar-thumb: rgb(51 65 85);
          --scrollbar-track: rgb(30 41 59);
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: var(--scrollbar-width);
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb);
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgb(148 163 184);
        }

        .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgb(71 85 105);
        }
      `}</style>
    </section>
  );
}
