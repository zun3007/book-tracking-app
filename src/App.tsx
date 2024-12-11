import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingSpinner from './ui/LoadingSpinner';

import ProtectedRoute from './components/ProtectedRoute';
import AuthProtectedRoute from './components/AuthProtectedRoute';
import ThemeProvider from './features/theme/ThemeProvider';
import store from './store';
import ThemeToggle from './components/ui/ThemeToggle';

const LandingPage = lazy(() => import('./ui/LandingPage'));
const UserDashboardPage = lazy(() => import('./features/user/UserDashboard'));
const SignInPage = lazy(() => import('./features/auth/SignIn'));
const Register = lazy(() => import('./features/auth/Register'));
const NotFound = lazy(() => import('./ui/NotFound'));
const Navbar = lazy(() => import('./ui/Navbar'));
const LandingNavbar = lazy(() => import('./ui/LandingNavbar'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./features/auth/ResetPassword'));
const LogoutPage = lazy(() => import('./features/auth/Logout'));
const SettingsPage = lazy(() => import('./features/user/Settings'));

const BookshelfPage = lazy(() => import('./features/books/BookshelfPage'));
const AllBooksPage = lazy(() => import('./features/books/AllBooks'));
const BookDescriptionPage = lazy(
  () => import('./features/books/BookDescription')
);
const FavoritesPage = lazy(() => import('./features/books/Favorites'));

const PageLoader = () => (
  <div className='min-h-screen flex items-center justify-center'>
    <LoadingSpinner />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      suspense: true,
    },
  },
});

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
      {
        path: '*',
        element: (
          <>
            <LandingNavbar />
            <div className='pt-16'>
              <NotFound />
            </div>
          </>
        ),
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
      {
        path: '*',
        element: (
          <>
            <Navbar />
            <div className='pt-16'>
              <NotFound />
            </div>
          </>
        ),
      },
    ],
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '*',
    element: (
      <>
        <LandingNavbar />
        <div className='pt-16'>
          <NotFound />
        </div>
      </>
    ),
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
    <Suspense fallback={<PageLoader />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <div className='min-h-screen bg-white dark:bg-dark-900 text-dark-900 dark:text-white transition-colors duration-200'>
                <nav className='fixed top-0 left-0 right-0 z-50 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-800'>
                  <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <ThemeToggle />
                    </div>
                  </div>
                </nav>
                <Toaster
                  position='bottom-right'
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                  }}
                />
                <RouterProvider router={router} />
              </div>
            </ThemeProvider>
          </QueryClientProvider>
        </Provider>
      </ErrorBoundary>
    </Suspense>
  );
}

export default App;
