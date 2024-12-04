export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: number;
          title: string;
          authors: string[];
          description: string | null;
          thumbnail: string | null;
          isbn: string;
          published_date: string | null;
          genres: string[];
          average_rating: number;
          ratings_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['books']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['books']['Insert']>;
      };
      user_books: {
        Row: {
          id: number;
          user_id: string;
          book_id: number;
          favorite: boolean;
          read_status: string;
          rating: number | null;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['user_books']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['user_books']['Insert']>;
      };
      comments: {
        Row: {
          id: number;
          user_id: string;
          book_id: number;
          content: string;
          mentions: string[] | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['comments']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
    };
  };
}

export type Book = Database['public']['Tables']['books']['Row'];
export type UserBook = Database['public']['Tables']['user_books']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];

export interface FavoriteBook {
  id: number;
  book: Book;
  order: number;
}

export interface Book {
  id: number;
  title: string;
  authors: string[];
  description: string | null;
  thumbnail: string | null;
  isbn: string;
  published_date: string | null;
  genres: string[];
  average_rating: number;
  ratings_count: number;
  created_at: string;
  updated_at: string;
  read_status?: 'none' | 'reading' | 'finished';
  userRating?: number;
}

export interface UserBook {
  id: number;
  user_id: string;
  book_id: number;
  read_status: 'none' | 'reading' | 'finished';
  rating: number | null;
  favorite: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}
