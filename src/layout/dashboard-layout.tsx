import { Link, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { authService } from '../api/auth.service';
import CustomIcon from '../components/common/Icons/custom-icon';
import NavBar from './nav-bar/nav-bar';

export default function DashboardLayout() {
  const { tokenPayload } = useAppSelector((state) => state.auth);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    authService.logout();
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="h5 d-flex align-items-center gap-2 mb-1">
            <span className="logo bg-emerald-500 rounded-circle d-flex align-items-center justify-content-center">
              <CustomIcon iconName="tennis-ball" className="w-50 h-50" />
            </span>
            TennisClub
          </h1>
          <p className="text-emerald-400 small mb-0">Saison 2026</p>
        </div>

        <NavBar className="sidebar-nav" />

        <div className="p-3 border-top border-emerald-800">
          <p className="fw-bold mb-0">{tokenPayload?.first_name + ' ' + tokenPayload?.last_name}</p>
          <p className="small text-emerald-400 mb-3">{tokenPayload?.groups.join(', ') || 'Membre'}</p>
          <Link
            to="/profile"
            className="btn btn-emerald-600 bg-emerald-800 border-0 w-100 small hover-bg-emerald-600 transition"
          >
            <CustomIcon iconName="PersonFill" className="me-3" /> Mon profil
          </Link>
          <a
            href="#"
            onClick={handleLogout}
            className="d-block text-center mt-2 small text-emerald-400 text-decoration-none hover-text-white transition"
          >
            <CustomIcon iconName="BoxArrowRight" className="me-3" /> Déconnexion
          </a>
        </div>
      </aside>

      <main className="flex-fill flex-column overflow-y-auto bg-stone-100 text-stone-900">
        <Outlet />
      </main>
    </div>
  );
}
