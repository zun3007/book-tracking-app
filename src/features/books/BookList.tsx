import VirtualizedList from '../../components/ui/VirtualizedList';
import OptimizedImage from '../../components/ui/OptimizedImage';
import { Book } from '../../types/book';

interface BookListProps {
  books: Book[];
}

export default function BookList({ books }: BookListProps) {
  return (
    <VirtualizedList
      items={books}
      itemHeight={300}
      renderItem={(book) => (
        <div className='p-4'>
          <OptimizedImage
            src={book.coverImage}
            alt={book.title}
            width={200}
            height={300}
            className='rounded-lg shadow-lg'
            priority={false}
            quality={80}
          />
          <h3 className='mt-2 font-semibold'>{book.title}</h3>
          <p className='text-sm text-gray-600'>{book.author}</p>
        </div>
      )}
    />
  );
}
