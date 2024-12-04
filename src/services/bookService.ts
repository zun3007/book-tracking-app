import { supabase } from '../config/supabaseClient';
import { Book, UserBook } from '../types';

export const bookService = {
  async getAllBooks(): Promise<Book[]> {
    const { data } = await supabase
      .from('books')
      .select(
        `
        id,
        title,
        authors,
        description,
        thumbnail,
        published_date,
        isbn,
        genres,
        average_rating,
        ratings_count
      `
      )
      .order('title')
      .throwOnError();

    if (!data) return [];
    return data;
  },

  async getBookById(id: number): Promise<Book | null> {
    const { data } = await supabase
      .from('books')
      .select(
        `
        id,
        title,
        authors,
        description,
        thumbnail,
        published_date,
        isbn,
        genres,
        average_rating,
        ratings_count
      `
      )
      .eq('id', id)
      .single()
      .throwOnError();

    return data;
  },

  async getUserBooks(userId: string): Promise<UserBook[]> {
    const { data } = await supabase
      .from('user_books')
      .select('*')
      .eq('user_id', userId)
      .throwOnError();

    if (!data) return [];
    return data;
  },

  async updateBookRating(
    bookId: number,
    userId: string,
    rating: number
  ): Promise<void> {
    await supabase
      .from('user_books')
      .upsert({
        book_id: bookId,
        user_id: userId,
        rating,
        read_status: 'read',
      })
      .throwOnError();
  },

  async toggleFavorite(bookId: number, userId: string): Promise<void> {
    const { data: existingFavorite } = await supabase
      .from('user_books')
      .select('*')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .single();

    if (existingFavorite) {
      await supabase
        .from('user_books')
        .update({
          read_status:
            existingFavorite.read_status === 'favorite' ? 'read' : 'favorite',
        })
        .eq('id', existingFavorite.id)
        .throwOnError();
    } else {
      await supabase
        .from('user_books')
        .insert({
          book_id: bookId,
          user_id: userId,
          read_status: 'favorite',
        })
        .throwOnError();
    }
  },
};
