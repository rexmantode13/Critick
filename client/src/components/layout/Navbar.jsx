import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWatchlist } from '../../context/WatchlistContext';
import { SearchOverlay } from '../search/SearchOverlay';
import './Navbar.css';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { watchlist } = useWatchlist();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileDrawerOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className={`navbar-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-container">
          {/* Logo Wordmark */}
          <Link to="/" className="navbar-logo" onClick={() => setMobileDrawerOpen(false)}>
            <span className="logo-wordmark">CRITICK</span>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="navbar-nav desktop-only">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/movies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Movies
            </NavLink>
            <NavLink to="/reviews" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Reviews
            </NavLink>
            <NavLink to="/genres" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Genres
            </NavLink>
            <NavLink to="/watchlist" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Watchlist
              {watchlist.length > 0 && <span className="watchlist-badge">{watchlist.length}</span>}
            </NavLink>
            <NavLink to="/pro" className={({ isActive }) => `nav-link nav-link-pro ${isActive ? 'active' : ''}`}>
              Critick Pro
            </NavLink>
          </nav>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Search Trigger Button */}
            <button
              className="search-trigger-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="search-placeholder desktop-only">Search movies, actors...</span>
              <kbd className="search-kbd desktop-only">⌘K</kbd>
            </button>

            {/* Auth Buttons / Avatar */}
            {isAuthenticated ? (
              <div className="user-menu-wrapper">
                <button
                  className="avatar-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                >
                  <span className="avatar-monogram">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </span>
                  <span className="user-name desktop-only">{user.name.split(' ')[0]}</span>
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu" onMouseLeave={() => setUserMenuOpen(false)}>
                    <div className="dropdown-user-info">
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-username">@{user.username}</p>
                      <span className={`role-badge role-${user.role}`}>{user.role}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to={`/u/${user.username}`} className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      My Profile
                    </Link>
                    <Link to="/watchlist" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      My Watchlist ({watchlist.length})
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item dropdown-admin" onClick={() => setUserMenuOpen(false)}>
                        👑 Admin Console
                      </Link>
                    )}
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-signin">
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              className="hamburger-btn mobile-only"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              aria-label="Toggle navigation drawer"
            >
              <span className={`hamburger-line ${mobileDrawerOpen ? 'open' : ''}`} />
              <span className={`hamburger-line ${mobileDrawerOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="mobile-drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
            <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
              <nav className="mobile-nav-links">
                <NavLink to="/" onClick={() => setMobileDrawerOpen(false)}>Home</NavLink>
                <NavLink to="/movies" onClick={() => setMobileDrawerOpen(false)}>Movies & Series</NavLink>
                <NavLink to="/reviews" onClick={() => setMobileDrawerOpen(false)}>Community Reviews</NavLink>
                <NavLink to="/genres" onClick={() => setMobileDrawerOpen(false)}>Browse Genres</NavLink>
                <NavLink to="/watchlist" onClick={() => setMobileDrawerOpen(false)}>
                  Watchlist ({watchlist.length})
                </NavLink>
                <NavLink to="/pro" onClick={() => setMobileDrawerOpen(false)}>Critick Pro</NavLink>
                {isAuthenticated ? (
                  <>
                    <Link to={`/u/${user?.username}`} onClick={() => setMobileDrawerOpen(false)}>
                      Profile (@{user?.username})
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileDrawerOpen(false)}>Admin Panel</Link>
                    )}
                    <button className="mobile-logout-btn" onClick={handleLogout}>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="mobile-signin-btn" onClick={() => setMobileDrawerOpen(false)}>
                    Sign In / Register
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Overlay Modal */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
