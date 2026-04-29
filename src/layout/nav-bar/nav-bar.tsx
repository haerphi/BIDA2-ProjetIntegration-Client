import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/auth.slice';
import { useAppSelector } from '../../store/hooks';

const NavBar = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {!isAuthenticated && (
          <li>
            <Link to="/auth">Login</Link>
          </li>
        )}
        {isAuthenticated && (
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        )}
        {isAuthenticated && (
          <li>
            <Link to="/courts">Court Listing</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
