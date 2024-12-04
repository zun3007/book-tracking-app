import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import OptimizedImage from '../../components/ui/OptimizedImage';
import { Book } from '../../types';

interface BookDetailsProps {
  book: Book;
  favorites: Book[];
  handleRatingChange: (rating: number) => void;
  handleToggleFavorite: () => void;
  user: { id: string } | null;
}

export default function BookDetails({
  book,
  favorites,
  handleRatingChange,
  handleToggleFavorite,
  user,
}: BookDetailsProps) {
  return (
    <div className='flex flex-col md:flex-row'>
      <div className='md:w-1/3'>
        <OptimizedImage
          src={book.thumbnail || '/placeholder-book.jpg'}
          alt={book.title}
          className='w-full h-full object-cover'
        />
      </div>
      <div className='md:w-2/3 p-6'>
        <h1 className='text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2'>
          {book.title}
        </h1>
        <p className='text-lg text-gray-600 dark:text-gray-300 mb-6'>
          {book.authors?.join(', ')}
        </p>

        <div className='flex items-center space-x-4 mb-8'>
          <div className='flex items-center'>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                disabled={!user}
                className={`w-8 h-8 ${
                  rating <= (book.userRating || 0)
                    ? 'text-amber-400'
                    : 'text-gray-300 dark:text-gray-600'
                } hover:text-amber-500 transition-colors disabled:cursor-not-allowed`}
              >
                ⭐
              </button>
            ))}
          </div>

          <button
            onClick={handleToggleFavorite}
            disabled={!user}
            className='flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {favorites.some((f) => f.id === book.id) ? (
              <HeartSolidIcon className='w-5 h-5 text-red-500' />
            ) : (
              <HeartIcon className='w-5 h-5 text-gray-400 dark:text-gray-500' />
            )}
            <span className='text-gray-600 dark:text-gray-300'>
              {favorites.some((f) => f.id === book.id)
                ? 'Remove from Favorites'
                : 'Add to Favorites'}
            </span>
          </button>
        </div>

        <div className='prose prose-gray dark:prose-invert max-w-none mt-6'>
          <p className='text-gray-600 dark:text-gray-300'>{book.description}</p>

          <div className='border-t border-gray-200 dark:border-gray-700 pt-6'>
            <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4'>
              Book Details
            </h2>
            <dl className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <dt className='text-sm text-gray-500 dark:text-gray-400'>
                  ISBN
                </dt>
                <dd className='text-gray-700 dark:text-gray-300'>
                  {book.isbn}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-500 dark:text-gray-400'>
                  Published
                </dt>
                <dd className='text-gray-700 dark:text-gray-300'>
                  {book.published_date}
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-500 dark:text-gray-400'>
                  Rating
                </dt>
                <dd className='text-gray-700 dark:text-gray-300'>
                  ⭐ {book.average_rating.toFixed(1)} (
                  {book.ratings_count.toLocaleString()} ratings)
                </dd>
              </div>
              <div>
                <dt className='text-sm text-gray-500 dark:text-gray-400'>
                  Genres
                </dt>
                <dd className='text-gray-700 dark:text-gray-300'>
                  {book.genres?.join(', ')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
