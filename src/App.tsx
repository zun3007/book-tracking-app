import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import State from './pages/State';
import Homepage from './pages/Homepage';
import Form from './pages/Form';
import RenderList from './pages/RenderList';
import SignIn from './pages/SignIn';

const router = createBrowserRouter([
  {
    index: true,
    element: <Homepage />,
  },
  {
    path: '/sign-in',
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
