import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './../hooks/useAuth';

import Navbar from '../ui/Navbar';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
