-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS reading_history CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS user_books CASCADE;
DROP TABLE IF EXISTS bookshelves CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bio TEXT,
  profile_picture TEXT,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create books table
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  description TEXT,
  thumbnail TEXT,
  published_date DATE,
  isbn TEXT UNIQUE NOT NULL,
  genres TEXT[],
  average_rating DECIMAL(3,1) DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create bookshelves table
CREATE TABLE bookshelves (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create user_books table
CREATE TABLE user_books (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  bookshelf_id INTEGER REFERENCES bookshelves(id) ON DELETE CASCADE,
  read_status TEXT CHECK (read_status IN ('reading', 'want_to_read', 'read', 'favorite')),
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  "order" INTEGER,
  UNIQUE(user_id, book_id)
);

-- Create reading_history table
CREATE TABLE reading_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create recommendations table
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  score DECIMAL(3,2),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookshelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables
-- Books policies
CREATE POLICY "Enable read access for all users"
  ON books FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable book updates"
  ON books FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable book inserts"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Bookshelves policies
CREATE POLICY "Users can manage their own bookshelves"
  ON bookshelves FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User books policies
CREATE POLICY "Users can read own books"
  ON user_books FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own books"
  ON user_books FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books"
  ON user_books FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books"
  ON user_books FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

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
  ); 