import { Link } from "react-router-dom"

const NavBar = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/auth">Auth</Link>
                </li>
                <li>
                    <Link to="/courts">Court Listing</Link>
                </li>
            </ul>
        </nav>
    )
}

export default NavBar;