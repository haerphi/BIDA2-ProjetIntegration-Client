import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const NotConnectedRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/courts" replace />;
  }

  return <Outlet />;
};

export default NotConnectedRoute;
