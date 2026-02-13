import { Link } from 'react-router-dom';

export default function Navbar(){
    return(
        <nav className="navbar">
            <div className="nav-left">
                <Link to="/">Home</Link> | {" "}
                <Link to="/tracker">Wellness Tracker</Link> | {" "}
            </div>
            <div className="nav-right">
               <Link to="/login" className="login-link">Login</Link>  {"  "}
            </div>
        </nav>
    );
}