-- Create books table if it doesn't exist
CREATE TABLE IF NOT EXISTS books (
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

-- Create user_books table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_books (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  read_status TEXT CHECK (read_status IN ('reading', 'want_to_read', 'read', 'favorite')),
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, book_id)
);

-- Create RLS policies
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- Books policies
CREATE POLICY "Everyone can read books"
  ON books FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can insert books"
  ON books FOR INSERT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

CREATE POLICY "Only admins can update books"
  ON books FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

-- User books policies
CREATE POLICY "Users can read their own book entries"
  ON user_books FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own book entries"
  ON user_books FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own book entries"
  ON user_books FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own book entries"
  ON user_books FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 