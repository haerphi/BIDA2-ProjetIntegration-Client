import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const ConnectedRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};

export default ConnectedRoute;
