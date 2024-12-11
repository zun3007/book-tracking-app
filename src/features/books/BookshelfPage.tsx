import { useState, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useScroll,
  useSpring,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import BookCard from './BookCard';
import {
  BookOpen,
  CheckCircle2,
  Library,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useBookSync } from '../../hooks/useBookSync';
import { animations } from '../../config/animations';
import { toast } from 'react-hot-toast';

interface BookshelfBook extends Book {
  read_status: 'none' | 'reading' | 'finished';
}

interface BookSection {
  id: 'reading' | 'finished';
  title: string;
  icon: typeof BookOpen | typeof CheckCircle2;
  iconColor: string;
  books: BookshelfBook[];
  emptyMessage: string;
}

const gridVariants = {
  hidden: {
    opacity: 0,
    transition: { staggerChildren: 0.05 },
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

export default function BookshelfPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [currentPage, setCurrentPage] = useState({ reading: 1, finished: 1 });
  const [activeTab, setActiveTab] = useState<'reading' | 'finished'>('reading');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const {
    readingBooks,
    finishedBooks,
    isLoading,
    isError,
    refetch,
    updateBookStatus,
  } = useBookSync(user?.id);

  const BOOKS_PER_PAGE = 12;

  const sections: BookSection[] = [
    {
      id: 'reading',
      title: 'Currently Reading',
      icon: BookOpen,
      iconColor: 'text-blue-500',
      books: readingBooks,
      emptyMessage:
        'Start your reading journey by adding books to your reading list!',
    },
    {
      id: 'finished',
      title: 'Finished Books',
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      books: finishedBooks,
      emptyMessage: 'Complete your first book to see it here!',
    },
  ];

  const getPaginatedBooks = (books: BookshelfBook[], page: number) => {
    const startIndex = (page - 1) * BOOKS_PER_PAGE;
    return books.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  };

  const getPageCount = (totalItems: number) => {
    return Math.ceil(totalItems / BOOKS_PER_PAGE);
  };

  const TabButton = ({ section }: { section: BookSection }) => {
    const Icon = section.icon;
    const isActive = activeTab === section.id;
    const bookCount = section.books.length;

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setActiveTab(section.id)}
        className={`relative flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 
          dark:focus-visible:ring-offset-gray-900 ${
            isActive
              ? 'bg-white dark:bg-gray-800 shadow-lg'
              : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
          }`}
        aria-selected={isActive}
        role='tab'
        aria-controls={`${section.id}-panel`}
        id={`${section.id}-tab`}
      >
        <Icon className={`w-5 h-5 ${section.iconColor}`} aria-hidden='true' />
        <span
          className={`font-medium ${
            isActive
              ? 'text-gray-900 dark:text-gray-50'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          {section.title}
        </span>
        <span
          className={`px-2.5 py-1 text-sm rounded-full font-medium ${
            isActive
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
          aria-label={`${bookCount} ${bookCount === 1 ? 'book' : 'books'}`}
        >
          {bookCount}
        </span>
        {isActive && (
          <motion.div
            layoutId='activeTab'
            className='absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg -z-10'
          />
        )}
      </motion.button>
    );
  };

  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;

    return (
      <nav
        aria-label='Bookshelf pagination'
        className='flex justify-center items-center gap-3 mt-10'
      >
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className='p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-gray-100 dark:hover:bg-gray-800 
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
            dark:focus-visible:ring-offset-gray-900'
          aria-label='Previous page'
        >
          <ChevronLeft
            className='w-5 h-5 text-gray-600 dark:text-gray-400'
            aria-hidden='true'
          />
        </button>
        <div className='flex gap-2' role='group' aria-label='Page navigation'>
          {Array.from({ length: totalPages }, (_, i) => (
            <motion.button
              key={i + 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(i + 1)}
              className={`min-w-[2.5rem] px-4 py-2.5 rounded-lg transition-colors font-medium
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                dark:focus-visible:ring-offset-gray-900 ${
                  currentPage === i + 1
                    ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              aria-label={`Page ${i + 1}`}
              aria-current={currentPage === i + 1 ? 'page' : undefined}
            >
              {i + 1}
            </motion.button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className='p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-gray-100 dark:hover:bg-gray-800
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
            dark:focus-visible:ring-offset-gray-900'
          aria-label='Next page'
        >
          <ChevronRight
            className='w-5 h-5 text-gray-600 dark:text-gray-400'
            aria-hidden='true'
          />
        </button>
      </nav>
    );
  };

  const handleReadStatusChange = useCallback(
    async (book: BookshelfBook, newStatus: 'none' | 'reading' | 'finished') => {
      // Remove book from current list immediately (optimistic update)
      if (book.read_status === 'reading') {
        setReadingBooks((prev) => prev.filter((b) => b.id !== book.id));
      } else if (book.read_status === 'finished') {
        setFinishedBooks((prev) => prev.filter((b) => b.id !== book.id));
      }

      // Add book to new list immediately (optimistic update)
      const updatedBook = { ...book, read_status: newStatus };
      if (newStatus === 'reading') {
        setReadingBooks((prev) => [updatedBook, ...prev]);
      } else if (newStatus === 'finished') {
        setFinishedBooks((prev) => [updatedBook, ...prev]);
      }

      // Reset pagination when lists change
      setCurrentPage((prev) => ({
        ...prev,
        [book.read_status]: 1,
        [newStatus]: 1,
      }));
    },
    []
  );

  if (isLoading) {
    return (
      <div
        className='min-h-screen flex items-center justify-center'
        role='status'
        aria-label='Loading bookshelf'
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className='flex flex-col items-center justify-center min-h-screen gap-6 px-4'
        role='alert'
        aria-live='polite'
      >
        <div className='w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center'>
          <AlertCircle
            className='w-10 h-10 text-red-600 dark:text-red-500'
            aria-hidden='true'
          />
        </div>
        <div className='text-center'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2'>
            Unable to Load Bookshelf
          </h2>
          <p className='text-gray-600 dark:text-gray-300 max-w-md mb-4'>
            We encountered an error while loading your bookshelf. Please try
            again.
          </p>
          <motion.button
            whileHover={animations.hover}
            whileTap={animations.tap}
            onClick={refetch}
            className='px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg
              shadow-sm transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
              dark:focus-visible:ring-offset-gray-900'
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  const activeSection = sections.find((section) => section.id === activeTab)!;
  const paginatedBooks = getPaginatedBooks(
    activeSection.books,
    currentPage[activeTab]
  );
  const totalPages = getPageCount(activeSection.books.length);

  return (
    <LayoutGroup>
      <motion.div
        style={{ scaleX }}
        className='fixed top-0 left-0 right-0 h-1 bg-primary-600 transform origin-left z-50'
        role='progressbar'
        aria-label='Page scroll progress'
      />

      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16'>
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col items-center mb-12 text-center'
        >
          <div className='flex items-center gap-4 mb-3'>
            <div className='p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30 shadow-sm'>
              <Library
                className='w-8 h-8 text-primary-600 dark:text-primary-400'
                aria-hidden='true'
              />
            </div>
            <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50'>
              My Bookshelf
            </h1>
          </div>
          <p className='text-gray-600 dark:text-gray-300 text-lg'>
            Track your reading progress and achievements
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='sticky top-20 z-40 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md p-3 rounded-xl mb-10 shadow-sm border border-gray-200/50 dark:border-gray-700/50'
        >
          <nav
            className='flex gap-3'
            role='tablist'
            aria-label='Bookshelf sections'
          >
            {sections.map((section) => (
              <TabButton key={section.id} section={section} />
            ))}
          </nav>
        </motion.div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            role='tabpanel'
            id={`${activeTab}-panel`}
            aria-labelledby={`${activeTab}-tab`}
          >
            {activeSection.books.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className='flex flex-col items-center gap-6 py-16 text-center'
              >
                <div className='w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800/50 shadow-inner flex items-center justify-center'>
                  <activeSection.icon
                    className={`w-12 h-12 ${activeSection.iconColor} opacity-60`}
                    aria-hidden='true'
                  />
                </div>
                <div className='space-y-2'>
                  <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-50'>
                    No Books{' '}
                    {activeTab === 'reading' ? 'Being Read' : 'Finished'} Yet
                  </h2>
                  <p className='text-gray-600 dark:text-gray-300 max-w-md'>
                    {activeSection.emptyMessage}
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={gridVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6 sm:gap-8'
                >
                  {paginatedBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      variants={itemVariants}
                      layout
                      className='relative'
                      style={{
                        originX: 0.5,
                        originY: 0.5,
                      }}
                    >
                      <BookCard
                        book={book}
                        index={index}
                        showReadStatus
                        onReadStatusChange={(newStatus) =>
                          handleReadStatusChange(book, newStatus)
                        }
                      />
                    </motion.div>
                  ))}
                </motion.div>

                <Pagination
                  currentPage={currentPage[activeTab]}
                  totalPages={totalPages}
                  onPageChange={(page) =>
                    setCurrentPage((prev) => ({
                      ...prev,
                      [activeTab]: page,
                    }))
                  }
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <FloatingActionButton
          onClick={() => navigate('/books')}
          aria-label='Add new books to bookshelf'
        />
      </main>
    </LayoutGroup>
  );
}
