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
import { BookOpen, CheckCircle2, Library, BookMarked } from 'lucide-react';
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

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setActiveTab(section.id)}
        className={`relative flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
          isActive
            ? 'bg-white dark:bg-gray-800 shadow-lg'
            : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
        }`}
      >
        <Icon className={`w-5 h-5 ${section.iconColor}`} />
        <span
          className={`font-medium ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}
        >
          {section.title}
        </span>
        <span
          className={`ml-2 px-2 py-0.5 text-sm rounded-full ${
            isActive
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {section.books.length}
        </span>
        {isActive && (
          <motion.div
            layoutId='activeTab'
            className='absolute inset-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg -z-10'
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex justify-center items-center gap-2 mt-8'
      >
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className='p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          ←
        </button>
        <div className='flex gap-2'>
          {Array.from({ length: totalPages }, (_, i) => (
            <motion.button
              key={i + 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(i + 1)}
              className={`min-w-[2.5rem] px-3 py-2 rounded-lg transition-colors ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {i + 1}
            </motion.button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className='p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          →
        </button>
      </motion.div>
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
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='text-red-500 dark:text-red-400'
        >
          Failed to load bookshelf
        </motion.p>
        <motion.button
          whileHover={animations.hover}
          whileTap={animations.tap}
          onClick={refetch}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg'
        >
          Try Again
        </motion.button>
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
        className='fixed top-0 left-0 right-0 h-1 bg-blue-500 transform origin-left z-50'
      />

      <div className='container mx-auto px-4 py-8 mt-16'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-col items-center mb-12'
        >
          <div className='flex items-center gap-3 mb-2'>
            <Library className='w-8 h-8 text-blue-500' />
            <h1 className='text-3xl font-bold'>My Bookshelf</h1>
          </div>
          <p className='text-gray-600 dark:text-gray-400'>
            Track your reading progress and achievements
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='sticky top-20 z-40 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm p-2 rounded-xl mb-8'
        >
          <nav className='flex gap-2'>
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
            transition={{ duration: 0.2 }}
          >
            {activeSection.books.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex flex-col items-center gap-4 py-12 text-center'
              >
                <activeSection.icon
                  className={`w-16 h-16 ${activeSection.iconColor} opacity-50`}
                />
                <p className='text-gray-500 dark:text-gray-400 max-w-md'>
                  {activeSection.emptyMessage}
                </p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 },
                    },
                  }}
                  initial='hidden'
                  animate='show'
                  className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6'
                >
                  <AnimatePresence mode='popLayout'>
                    {paginatedBooks.map((book, index) => (
                      <motion.div
                        key={book.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
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
                  </AnimatePresence>
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

        <FloatingActionButton onClick={() => navigate('/books')} />
      </div>
    </LayoutGroup>
  );
}
