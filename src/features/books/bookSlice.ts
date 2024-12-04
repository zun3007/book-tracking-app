import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Book, UserBook } from '../types/supabase';
import { supabase } from '../../config/supabaseClient';

interface BookState {
  books: Book[];
  selectedBook: Book | null;
  userBooks: UserBook[];
  favorites: Book[];
  loading: boolean;
  error: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  totalBooks: number;
}

const initialState: BookState = {
  books: [],
  selectedBook: null,
  userBooks: [],
  favorites: [],
  loading: false,
  error: null,
  status: 'idle',
  totalBooks: 0,
};

export const fetchAllBooks = createAsyncThunk(
  'books/fetchAllBooks',
  async (
    {
      page,
      filters,
      searchQuery,
    }: {
      page: number;
      filters: FilterState;
      searchQuery: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Build base query
      let query = supabase.from('books').select('*', { count: 'exact' });

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,authors.cs.{%${searchQuery}%}`
        );
      }

      // Apply genre filter
      if (filters.genre.length > 0) {
        query = query.contains('genres', filters.genre);
      }

      // Apply rating filter
      if (filters.minRating > 0) {
        query = query.gte('average_rating', filters.minRating);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'rating':
          query = query.order('average_rating', { ascending: false });
          break;
        case 'title':
          query = query.order('title');
          break;
        default: // 'latest'
          query = query.order('published_date', { ascending: false });
      }

      // Get total count of filtered results first
      const { count } = await query;

      // Then get paginated results
      const { data, error } = await query.range((page - 1) * 8, page * 8 - 1);

      if (error) throw error;

      return {
        data: data || [],
        totalCount: count || 0,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch books'
      );
    }
  }
);

export const updateBookRating = createAsyncThunk(
  'books/updateRating',
  async (
    {
      bookId,
      userId,
      rating,
    }: { bookId: number; userId: string; rating: number },
    { rejectWithValue }
  ) => {
    try {
      await bookService.updateBookRating(bookId, userId, rating);
      return { bookId, rating };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update rating'
      );
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'books/toggleFavorite',
  async (
    { bookId, userId }: { bookId: number; userId: string },
    { rejectWithValue }
  ) => {
    try {
      // First check if the book exists in user_books
      const { data: existingBook, error: fetchError } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingBook) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_books')
          .update({ favorite: !existingBook.favorite })
          .eq('user_id', userId)
          .eq('book_id', bookId);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_books')
          .insert({
            user_id: userId,
            book_id: bookId,
            favorite: true,
            read_status: 'none',
            order: 0,
          });

        if (insertError) throw insertError;
      }

      return bookId;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to toggle favorite'
      );
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'books/fetchFavorites',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('user_books')
        .select(
          `
          book_id,
          books (
            id,
            title,
            authors,
            thumbnail,
            description,
            isbn,
            published_date,
            genres,
            average_rating,
            ratings_count
          )
        `
        )
        .eq('user_id', userId)
        .eq('favorite', true);

      if (error) throw error;

      const favorites = data.map((item) => ({
        ...item.books,
        id: item.book_id,
      })) as Book[];

      return favorites;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch favorites');
    }
  }
);

export const updateReadStatus = createAsyncThunk(
  'books/updateReadStatus',
  async (
    {
      bookId,
      userId,
      status,
    }: {
      bookId: number;
      userId: string;
      status: 'none' | 'reading' | 'finished';
    },
    { rejectWithValue }
  ) => {
    try {
      const { data: existingBook, error: fetchError } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingBook) {
        const { error: updateError } = await supabase
          .from('user_books')
          .update({ read_status: status })
          .eq('user_id', userId)
          .eq('book_id', bookId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_books')
          .insert({
            user_id: userId,
            book_id: bookId,
            read_status: status,
            favorite: false,
            order: 0,
          });

        if (insertError) throw insertError;
      }

      return { bookId, status };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update read status'
      );
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setSelectedBook: (state, action) => {
      state.selectedBook = action.payload;
    },
    clearSelectedBook: (state) => {
      state.selectedBook = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all books
      .addCase(fetchAllBooks.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBooks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.books = action.payload.data;
        state.totalBooks = action.payload.totalCount;
        state.error = null;
      })
      .addCase(fetchAllBooks.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch books';
      })
      // Update rating
      .addCase(updateBookRating.fulfilled, (state, action) => {
        const { bookId, rating } = action.payload;
        const book = state.books.find((b) => b.id === bookId);
        if (book) {
          book.userRating = rating;
        }
        if (state.selectedBook?.id === bookId) {
          state.selectedBook.userRating = rating;
        }
      })
      // Toggle favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const bookId = action.payload;
        const book = state.books.find((b) => b.id === bookId);
        if (book) {
          const isFavorite = state.favorites.some((f) => f.id === bookId);
          if (isFavorite) {
            state.favorites = state.favorites.filter((f) => f.id !== bookId);
          } else {
            state.favorites.push(book);
          }
        }
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(updateReadStatus.fulfilled, (state, action) => {
        const { bookId, status } = action.payload;
        const book = state.books.find((b) => b.id === bookId);
        if (book) {
          book.read_status = status;
        }
        if (state.selectedBook?.id === bookId) {
          state.selectedBook.read_status = status;
        }
      });
  },
});

export const { setSelectedBook, clearSelectedBook } = bookSlice.actions;
export default bookSlice.reducer;
