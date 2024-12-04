import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';

import LandingPage from './ui/LandingPage';
import UserDashboardPage from './features/user/UserDashboard';
import FavoritesPage from './features/books/Favorites';
import SettingsPage from './features/user/Settings';
import SignInPage from './features/auth/SignIn';

import AllBooksPage from './features/books/AllBooks';
import Register from './features/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AuthProtectedRoute from './components/AuthProtectedRoute';
import LogoutPage from './features/auth/Logout';
import ForgotPasswordPage from './features/auth/ForgotPassword';
import ResetPasswordPage from './features/auth/ResetPassword';
import BookDescriptionPage from './features/books/BookDescription';
import ThemeProvider from './features/theme/ThemeProvider';

import store from './store';

// Initialize React Query client
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <AuthProtectedRoute />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <SignInPage />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <UserDashboardPage />,
      },
      {
        path: '/books',
        element: <AllBooksPage />,
      },
      {
        path: '/book/:bookId',
        element: <BookDescriptionPage />,
      },
      {
        path: '/favorites',
        element: <FavoritesPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '/logout',
        element: <LogoutPage />,
      },
    ],
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
]);

const ErrorFallback = ({ error }: { error: Error }) => (
  <div role='alert' className='p-4 bg-red-100 text-red-700'>
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
  </div>
);

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Provider store={store}>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <Toaster />
              <RouterProvider router={router} />
            </QueryClientProvider>
          </ThemeProvider>
        </Provider>
      </ErrorBoundary>
    </Suspense>
  );
}

export default App;
