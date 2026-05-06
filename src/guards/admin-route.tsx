import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAdmin } from '../store/slices/auth.slice';

const AdminRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isAdmin = useAppSelector(selectIsAdmin);

  console.log(isAuthenticated, isAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/error/not-found" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
