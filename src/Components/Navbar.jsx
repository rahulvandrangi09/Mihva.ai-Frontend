import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <nav className="ai-navbar animate-fade-in-down">
            
            {/* 
              Line & Logo Container
              This creates a physical gap for the logo without a background color mask.
            */}
            <div className="brand-line-container">
                <div className="animated-line left-line"></div>
                <Link to="/" className="ai-logo-link">
                    <div className="ai-logo">Mihva.Ai</div>
                </Link>
                <div className="animated-line right-line"></div>
            </div>

            {/* Links positioned above the line */}
            <div className="ai-nav-links">
                <Link to="/bodha">Bodha</Link>
                <Link to="/vidya">Vidya</Link>
                <Link to="/abhyas">Abhyas</Link>
            </div>

            {/* Login/Logout positioned above the line */}
            {isLoggedIn ? (
                <button className="login-btn push-right" onClick={handleLogout}>
                    Logout
                </button>
            ) : (
                <button className="login-btn push-right">
                    <Link to='/login'>Login/Signup</Link>
                </button>
            )}
        </nav>
    );
}

export default Navbar;