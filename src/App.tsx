import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import State from './pages/State';
import Form from './pages/Form';
import RenderList from './pages/RenderList';
import SignIn from './pages/SignIn';
import LandingPage from './pages/LandingPage';

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
    path: '/state',
    element: <State />,
  },
  {
    path: '/form',
    element: <Form />,
  },
  {
    path: '/render-list',
    element: <RenderList />,
  },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
