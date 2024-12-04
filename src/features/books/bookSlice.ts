import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Book, UserBook, LoadingState } from '../../types';
import { bookService } from '../../services/bookService';
import { supabase } from '../../utils/supabaseClient';

// Add FilterState interface
interface FilterState {
  genre: string[];
  minRating: number;
  author: string;
  year: string;
  sortBy: 'latest' | 'rating' | 'title';
}

interface BookState {
  books: Book[];
  selectedBook: Book | null;
  userBooks: UserBook[];
  favorites: Book[];
  loading: boolean;
  error: string | null;
  status: LoadingState;
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
      await bookService.toggleFavorite(bookId, userId);
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
        .select('*, books(*)')
        .eq('user_id', userId)
        .eq('read_status', 'favorite');

      if (error) throw error;

      // Add proper type for the response
      interface FavoriteResponse {
        books: Book;
      }

      return (data as FavoriteResponse[]).map((item) => item.books);
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch favorites');
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
      });
  },
});

export const { setSelectedBook, clearSelectedBook } = bookSlice.actions;
export default bookSlice.reducer;
