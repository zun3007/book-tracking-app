import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';

import store from './store';
import SignInPage from './pages/SignIn';
import LandingPage from './pages/LandingPage';
import UserDashboardPage from './pages/UserDashboard';
import AllBooksPage from './pages/AllBooks';
import FavoritesPage from './pages/Favorites';
import SettingsPage from './pages/Settings';
import { Suspense } from 'react';

// Initialize React Query client
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    index: true,
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <SignInPage />,
  },
  {
    path: '/dashboard',
    element: <UserDashboardPage />,
  },
  {
    path: '/books',
    element: <AllBooksPage />,
  },
  {
    path: '/favorites',
    element: <FavoritesPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
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
          <QueryClientProvider client={queryClient}>
            <Toaster />
            <RouterProvider router={router} />
          </QueryClientProvider>
        </Provider>
      </ErrorBoundary>
    </Suspense>
  );
}

export default App;
