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
          published_date: string | null;
          isbn: string;
          genres: string[] | null;
          average_rating: number;
          ratings_count: number;
          created_at: string;
          updated_at: string;
        };
      };
      user_books: {
        Row: {
          id: number;
          user_id: string;
          book_id: number;
          read_status: 'none' | 'reading' | 'finished';
          rating: number | null;
          favorite: boolean;
          order: number;
          created_at: string;
          updated_at: string;
        };
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
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          content: string;
          read: boolean;
          created_at: string;
        };
      };
      recommendations: {
        Row: {
          id: number;
          user_id: string;
          book_id: number;
          score: number;
          reason: string;
          feedback: string | null;
          is_dismissed: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
