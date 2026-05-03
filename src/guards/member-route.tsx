import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsMember } from '../store/slices/auth.slice';

const MemberRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isMember = useAppSelector(selectIsMember);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isMember) {
    return <Navigate to="/contribution/pay" replace />;
  }

  return <Outlet />;
};

export default MemberRoute;
