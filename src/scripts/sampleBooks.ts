import 'cross-fetch/polyfill';
import { supabase } from '../config/supabaseClient';

const sampleBooks = [
  {
    title: 'The Great Gatsby',
    authors: ['F. Scott Fitzgerald'],
    description:
      'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
    thumbnail: 'https://covers.openlibrary.org/b/id/6498519-L.jpg',
    published_date: '1925-04-10',
    isbn: '9780743273565',
    genres: ['Fiction', 'Classic'],
    average_rating: 4.2,
    ratings_count: 0,
  },
  {
    title: '1984',
    authors: ['George Orwell'],
    description:
      'A dystopian novel set in a totalitarian society where critical thought is suppressed.',
    thumbnail: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
    published_date: '1949-06-08',
    isbn: '9780451524935',
    genres: ['Fiction', 'Dystopian'],
    average_rating: 4.5,
    ratings_count: 0,
  },
  {
    title: 'To Kill a Mockingbird',
    authors: ['Harper Lee'],
    description:
      'The story of racial injustice and the loss of innocence in the American South.',
    thumbnail: 'https://covers.openlibrary.org/b/id/7890671-L.jpg',
    published_date: '1960-07-11',
    isbn: '9780446310789',
    genres: ['Fiction', 'Classic'],
    average_rating: 4.7,
    ratings_count: 0,
  },
];

async function addSampleBooks() {
  try {
    const { data, error } = await supabase
      .from('books')
      .upsert(sampleBooks, { onConflict: 'isbn' });

    if (error) {
      console.error('Error adding sample books:', error);
      return;
    }

    console.log('Sample books added successfully:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
addSampleBooks();
