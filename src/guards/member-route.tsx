import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAdmin, selectIsMember } from '../store/slices/auth.slice';

const MemberRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isMember = useAppSelector(selectIsMember);
  const isAdmin = useAppSelector(selectIsAdmin);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isMember && !isAdmin) {
    return <Navigate to="/contribution/pay" replace />;
  }

  return <Outlet />;
};

export default MemberRoute;
