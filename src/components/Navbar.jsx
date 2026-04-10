import { Link } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalRequest } from '../authConfig';
 
export default function Navbar() {
    // ✅ useMsal() is correctly inside a React component now
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const userName = accounts[0]?.name;
    
    const handleLogin = () => {
        instance.loginRedirect(msalRequest).catch(console.error);
    };
    
    const handleLogout = () => {
        instance.logoutRedirect({postLogoutRedirectUri: `http://localhost:5173/` })
        .catch(console.error);
    };

    return(
        <nav className="navbar">
            <div className="nav-left">
                <Link to="/">Home</Link> | {" "}
                <Link to="/tracker">Wellness Tracker</Link> | {" "}
                <Link to="/resources">Resources</Link> | {" "}
            </div>
            <div className="nav-right">
                {isAuthenticated ? (
                <>
                    {userName && <span style={{ marginRight: '1rem', fontSize: '0.9rem', color: '#213547' }}>{userName}</span>}
                    <button className="login-link" onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    Sign Out
                    </button>
                </>
                ) : (
                <button className="login-link" onClick={handleLogin} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    Sign In
                </button>
                )}
            </div>
        </nav>
    );
}