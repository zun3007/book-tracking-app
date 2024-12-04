import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfileUpdate } from '../hooks/useProfileUpdate';
import Navbar from '../ui/Navbar';
import LoadingSpinner from '../ui/LoadingSpinner';

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  useProfileUpdate();

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
