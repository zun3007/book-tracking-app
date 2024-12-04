export interface Book {
  id: number;
  title: string;
  authors: string[];
  description?: string;
  thumbnail?: string;
  published_date?: string;
  isbn: string;
  genres?: string[];
  average_rating: number;
  ratings_count: number;
  userRating?: number;
}

export interface UserBook {
  id: number;
  user_id: string;
  book_id: number;
  read_status: 'reading' | 'want_to_read' | 'read' | 'favorite';
  rating?: number;
  added_at: string;
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface ApiError {
  message: string;
  status?: number;
}

export interface FilterState {
  genre: string[];
  minRating: number;
  author: string;
  year: string;
  sortBy: 'latest' | 'rating' | 'title';
}

export interface FetchBooksParams {
  page: number;
  filters: FilterState;
  searchQuery: string;
}
