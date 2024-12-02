import { useLayoutEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

export default function ProtectedRoutes({ children }) {
  const loginUser = true;

  if (!loginUser) {
    return <Navigate to='/login' replace />;
  }

  return children;
}
