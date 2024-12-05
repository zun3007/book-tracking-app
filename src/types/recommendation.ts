export interface Book {
  id: number;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  genres: string[];
  average_rating: number;
  published_date: string;
}

export interface Recommendation {
  id: number;
  user_id: string;
  book: Book;
  score: number;
  reason: string;
  feedback?: 'liked' | 'disliked';
  is_dismissed: boolean;
  created_at: string;
}

export interface RecommendationMetrics {
  total_recommendations: number;
  liked_count: number;
  disliked_count: number;
  accuracy_rate: number;
}

export interface UserStats {
  totalBooks: number;
  reading: number;
  completed: number;
  favorites: number;
  genres_distribution: Record<string, number>;
  reading_streak: number;
  monthly_progress: {
    month: string;
    books_read: number;
  }[];
}
