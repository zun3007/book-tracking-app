import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import SignIn from './pages/SignIn';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import AllBooksPage from './pages/AllBooks';

const router = createBrowserRouter([
  {
    index: true,
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <SignIn />,
  },
  {
    path: '/sign-up',
    element: <h1>Hello World!</h1>,
  },
  {
    path: '/forgot-password',
    element: <h1>Hello World!</h1>,
  },
  {
    path: '/forgot-password/:id',
    element: <h1>Hello World!</h1>,
  },
  { path: '/dashboard', element: <UserDashboard /> },
  { path: '/all-books', element: <AllBooksPage /> },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
