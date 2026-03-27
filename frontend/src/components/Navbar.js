import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const history = useHistory();

    useEffect(() => {
        const checkUser = () => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        };
        checkUser();
        window.addEventListener('storage', checkUser);
        const interval = setInterval(checkUser, 1000);
        return () => {
            window.removeEventListener('storage', checkUser);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        history.push('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-rainbow-bar"></div>
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">
                    <img src="/logo.png" alt="PHV - Resenha Sagrada" className="navbar-logo" />
                </Link>

                <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                    &#9776;
                </button>

                <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
                    <Link to="/" onClick={() => setMenuOpen(false)}>
                        <span className="nav-emoji">&#127968;</span> Feed
                    </Link>
                    {user ? (
                        <>
                            <Link to="/create" onClick={() => setMenuOpen(false)}>
                                <span className="nav-emoji">&#10133;</span> Criar Post
                            </Link>
                            <div className="navbar-user-area">
                                <span className="navbar-welcome">
                                    <span className="nav-emoji">&#9996;&#65039;</span> Olá, <strong>{user.username}</strong>
                                </span>
                                <button className="navbar-logout-btn" onClick={handleLogout}>
                                    Sair
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMenuOpen(false)}>
                                <span className="nav-emoji">&#128274;</span> Login
                            </Link>
                            <Link to="/register" onClick={() => setMenuOpen(false)}>
                                <span className="nav-emoji">&#9997;&#65039;</span> Registrar
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;