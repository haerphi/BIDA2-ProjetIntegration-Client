import { Outlet, NavLink } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAdmin, selectIsMember } from '../store/slices/auth.slice';
import { authService } from '../api/auth.service';

export default function DashboardLayout() {
  const { tokenPayload } = useAppSelector((state) => state.auth);
  const isMember = useAppSelector(selectIsMember);
  const isAdmin = useAppSelector(selectIsAdmin);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    authService.logout();
  };

  return (
    <div className="d-flex vh-100">
      <aside className="bg-emerald-900 text-white d-flex flex-column flex-shrink-0" style={{ width: '260px' }}>
        <div className="p-4 border-bottom border-emerald-800">
          <h1 className="h5 d-flex align-items-center gap-2 mb-1">
            <span
              className="bg-emerald-500 rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px' }}
            >
              📍
            </span>
            TennisClub
          </h1>
          <p className="text-emerald-400 small mb-0">Saison 2026</p>
        </div>

        <nav className="nav flex-column flex-grow-1 py-3">
          {isMember && (
            <NavLink
              to="/courts"
              className={({ isActive }) =>
                `nav-link px-4 py-2 d-flex align-items-center gap-2 ${
                  isActive ? 'text-white bg-emerald-800 border-end border-4 border-emerald-400' : 'text-decoration-none'
                }`
              }
              style={({ isActive }) => (!isActive ? { color: '#d1fae5', transition: '0.2s' } : {})}
            >
              📅 Réservations
            </NavLink>
          )}

          {isAdmin && (
            <>
              <div
                className="nav-link px-4 py-2 d-flex align-items-center gap-2"
                style={{
                  color: '#6ee7b7',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  cursor: 'default',
                }}
              >
                🛡️ Administration
              </div>

              <NavLink
                to="/members"
                className={({ isActive }) =>
                  `nav-link px-5 py-2 d-flex align-items-center gap-2 ${
                    isActive
                      ? 'text-white bg-emerald-800 border-end border-4 border-emerald-400'
                      : 'text-decoration-none'
                  }`
                }
                style={({ isActive }) => (!isActive ? { color: '#d1fae5', transition: '0.2s' } : {})}
              >
                👥 Membres
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-3 border-top border-emerald-800">
          <p className="fw-bold mb-0">AFT: {tokenPayload?.affiliation_number}</p>
          <p className="small text-emerald-400 mb-3">{tokenPayload?.groups.join(', ') || 'Membre'}</p>
          <a
            href="#"
            className="btn btn-emerald-600 bg-emerald-800 border-0 w-100 text-white py-2 small hover-bg-emerald-600 transition"
            style={{ fontSize: '0.85rem' }}
          >
            👤 Mon profil
          </a>
          <a
            href="#"
            onClick={handleLogout}
            className="d-block text-center mt-2 small text-emerald-400 text-decoration-none hover-text-white transition"
          >
            ↪ Déconnexion
          </a>
        </div>
      </aside>

      <main className="flex-grow-1 d-flex flex-column overflow-hidden bg-stone-100 text-stone-900">
        <Outlet />
      </main>
    </div>
  );
}
