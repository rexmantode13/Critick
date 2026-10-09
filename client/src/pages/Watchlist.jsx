import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { getPosterUrl } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import './Watchlist.css';

export const Watchlist = () => {
  const { watchlist, removeFromWatchlist, toggleStatus, loading } = useWatchlist();
  const [activeTab, setActiveTab] = useState('planned'); // 'planned' | 'watched'

  const filteredItems = watchlist.filter((item) => item.status === activeTab);
  const plannedCount = watchlist.filter((i) => i.status === 'planned').length;
  const watchedCount = watchlist.filter((i) => i.status === 'watched').length;

  return (
    <div className="watchlist-page-root container">
      <div className="watchlist-header">
        <div>
          <h1 className="page-title">My Watchlist</h1>
          <p className="page-subtitle">
            {watchlist.length} total title{watchlist.length !== 1 ? 's' : ''} saved in your film collection
          </p>
        </div>

        {/* Watchlist Tabs */}
        <div className="watchlist-tabs">
          <button
            className={`watchlist-tab-btn ${activeTab === 'planned' ? 'active' : ''}`}
            onClick={() => setActiveTab('planned')}
          >
            To Watch ({plannedCount})
          </button>
          <button
            className={`watchlist-tab-btn ${activeTab === 'watched' ? 'active' : ''}`}
            onClick={() => setActiveTab('watched')}
          >
            Watched ({watchedCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="watchlist-loading-grid">
          <p>Loading your watchlist...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="watchlist-empty-state">
          <h3>No titles in your "{activeTab === 'planned' ? 'To Watch' : 'Watched'}" list</h3>
          <p>
            {activeTab === 'planned'
              ? 'Save movies and web series to track what you want to watch next.'
              : "Mark items as watched to build your personal viewing log."}
          </p>
          <Link to="/movies">
            <Button variant="primary" size="large">
              Explore Movies Catalog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="watchlist-grid">
          {filteredItems.map((item) => (
            <div key={item._id || item.imdbID} className="watchlist-item-card">
              <Link to={`/movies/${item.imdbID}`} className="watchlist-poster-link">
                <img
                  src={getPosterUrl(item.posterUrl)}
                  alt={item.title}
                  className="watchlist-poster"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.target.src = '/fallbacks/poster.svg'; }}
                />
              </Link>

              <div className="watchlist-item-details">
                <Link to={`/movies/${item.imdbID}`} className="item-title line-clamp-1">
                  {item.title}
                </Link>
                <span className="item-year">{item.year}</span>

                <div className="watchlist-card-actions">
                  <button
                    className="status-toggle-btn"
                    onClick={() => toggleStatus(item._id || item.imdbID, activeTab === 'planned' ? 'watched' : 'planned')}
                  >
                    {activeTab === 'planned' ? '✓ Mark Watched' : '↩ Move to To Watch'}
                  </button>

                  <button
                    className="remove-item-btn"
                    onClick={() => removeFromWatchlist(item._id || item.imdbID)}
                    title="Remove from watchlist"
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
