import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer-root">
      <div className="container footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              CRITICK
            </Link>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/movies">Movies & Series</Link></li>
              <li><Link to="/reviews">Community Reviews</Link></li>
              <li><Link to="/genres">Genres Catalog</Link></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/watchlist">My Watchlist</Link></li>
              <li><Link to="/pro">Critick Pro</Link></li>
              <li><Link to="/about">About & Data</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="copyright-text">© 2026 Critick. Designed for film lovers.</p>
        </div>
      </div>
    </footer>
  );
};
