import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

export default function LateContributionPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user && user.contribution_paid) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <h1>Late Contribution</h1>
    </div>
  );
}
