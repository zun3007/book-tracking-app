-- Insert sample books
INSERT INTO books (title, authors, description, thumbnail, published_date, isbn, genres, average_rating, ratings_count)
VALUES 
  (
    'The Great Gatsby',
    ARRAY['F. Scott Fitzgerald'],
    'The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
    'https://covers.openlibrary.org/b/id/6498519-L.jpg',
    '1925-04-10',
    '9780743273565',
    ARRAY['Fiction', 'Classic'],
    4.2,
    0
  ),
  (
    '1984',
    ARRAY['George Orwell'],
    'A dystopian novel set in a totalitarian society where critical thought is suppressed.',
    'https://covers.openlibrary.org/b/id/7222246-L.jpg',
    '1949-06-08',
    '9780451524935',
    ARRAY['Fiction', 'Dystopian'],
    4.5,
    0
  ),
  (
    'To Kill a Mockingbird',
    ARRAY['Harper Lee'],
    'The story of racial injustice and the loss of innocence in the American South.',
    'https://covers.openlibrary.org/b/id/7890671-L.jpg',
    '1960-07-11',
    '9780446310789',
    ARRAY['Fiction', 'Classic'],
    4.7,
    0
  )
ON CONFLICT (isbn) 
DO UPDATE SET 
  title = EXCLUDED.title,
  authors = EXCLUDED.authors,
  description = EXCLUDED.description,
  thumbnail = EXCLUDED.thumbnail,
  published_date = EXCLUDED.published_date,
  genres = EXCLUDED.genres,
  average_rating = EXCLUDED.average_rating,
  ratings_count = EXCLUDED.ratings_count; 