import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

const NavBar = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

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
            <Link to="/courts">Court Listing</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
