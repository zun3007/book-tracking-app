import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';

import ProtectedRoute from './components/ProtectedRoute';
import AuthProtectedRoute from './components/AuthProtectedRoute';
import ThemeProvider from './features/theme/ThemeProvider';
import store from './store';
import BookshelfPage from './features/books/BookshelfPage';

// Lazy load pages
const LandingPage = lazy(() => import('./ui/LandingPage'));
const UserDashboardPage = lazy(() => import('./features/user/UserDashboard'));
const FavoritesPage = lazy(() => import('./features/books/Favorites'));
const SettingsPage = lazy(() => import('./features/user/Settings'));
const SignInPage = lazy(() => import('./features/auth/SignIn'));
const AllBooksPage = lazy(() => import('./features/books/AllBooks'));
const Register = lazy(() => import('./features/auth/Register'));
const LogoutPage = lazy(() => import('./features/auth/Logout'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPassword'));
const BookDescriptionPage = lazy(
  () => import('./features/books/BookDescription')
);

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
      {
        path: '/bookshelf',
        element: <BookshelfPage />,
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
    <Suspense fallback={<div className='text-secondary'>Loading...</div>}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Provider store={store}>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <Toaster />
              <div className='container mx-auto'>
                <RouterProvider router={router} />
              </div>
            </QueryClientProvider>
          </ThemeProvider>
        </Provider>
      </ErrorBoundary>
    </Suspense>
  );
}

export default App;
