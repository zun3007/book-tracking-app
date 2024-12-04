-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON books;
DROP POLICY IF EXISTS "Enable book updates" ON books;
DROP POLICY IF EXISTS "Enable book inserts" ON books;
DROP POLICY IF EXISTS "Users can read own books" ON user_books;
DROP POLICY IF EXISTS "Users can create own books" ON user_books;
DROP POLICY IF EXISTS "Users can update own books" ON user_books;
DROP POLICY IF EXISTS "Users can delete own books" ON user_books;

-- Disable RLS temporarily
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_books DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- Create new policies for books
CREATE POLICY "Public read access"
  ON books FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update"
  ON books FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert"
  ON books FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create new policies for user_books
CREATE POLICY "Users can read own entries"
  ON user_books FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entries"
  ON user_books FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON user_books FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON user_books FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 