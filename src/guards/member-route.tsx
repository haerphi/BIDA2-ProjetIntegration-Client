import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const MemberRoute = () => {
  const { tokenPayload, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  console.log(tokenPayload?.groups.includes('admin'));

  if (!tokenPayload?.contribution_paid && !tokenPayload?.groups.includes('admin')) {
    return <Navigate to="/contribution/pay" replace />;
  }

  return <Outlet />;
};

export default MemberRoute;
