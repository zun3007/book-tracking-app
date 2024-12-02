import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Book {
  id: string;
  title: string;
  authors: string[];
  genres: string[];
  thumbnail: string;
}

interface BookState {
  items: Book[];
  genres: string[];
}

const initialState: BookState = {
  items: [],
  genres: ['All'],
};

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setBooks(
      state,
      action: PayloadAction<{ books: Book[]; genres: string[] }>
    ) {
      state.items = action.payload.books;
      state.genres = action.payload.genres;
    },
  },
});

export const { setBooks } = bookSlice.actions;

export default bookSlice.reducer;
