import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const ConnectedRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isFirstLogin = useAppSelector((state) => state.auth.tokenPayload?.is_first_login);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  console.log(isFirstLogin);

  if (isFirstLogin) {
    return <Navigate to="/first-login" replace />;
  }

  return <Outlet />;
};

export default ConnectedRoute;
