import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import bookReducer from './slices/bookSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
