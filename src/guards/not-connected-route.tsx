import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const NotConnectedRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isFirstLogin = useAppSelector((state) => state.auth.tokenPayload?.is_first_login);

  if (isAuthenticated) {
    if (isFirstLogin) {
      return <Navigate to="/first-login" replace />;
    }
    return <Navigate to="/courts" replace />;
  }

  return <Outlet />;
};

export default NotConnectedRoute;
