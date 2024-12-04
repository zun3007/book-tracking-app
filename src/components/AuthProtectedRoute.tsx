import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfileUpdate } from '../hooks/useProfileUpdate';
import LoadingSpinner from '../ui/LoadingSpinner';
import LandingNavbar from '../ui/LandingNavbar';

const AuthProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  useProfileUpdate();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <>
      <LandingNavbar />
      <Outlet />
    </>
  );
};

export default AuthProtectedRoute;
