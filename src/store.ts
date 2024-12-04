import { configureStore } from '@reduxjs/toolkit';

import authReducer from './features/auth/authSlice';
import bookReducer from './features/books/bookSlice';
import themeReducer from './features/theme/themeSlice';

// Initialize store with preloaded theme state
const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
const preloadedState = {
  theme: {
    mode: savedTheme || 'light',
  },
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    theme: themeReducer,
  },
  preloadedState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
