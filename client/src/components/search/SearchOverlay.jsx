import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { catalogApi } from '../../api/catalogApi';
import { useDebounce } from '../../hooks/useDebounce';
import { getPosterUrl } from '../../utils/formatters';
import './SearchOverlay.css';

export const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open modal
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 3) {
      setResults(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    catalogApi
      .search(debouncedQuery)
      .then((res) => {
        if (isMounted && res.success) {
          setResults(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) setResults({ movies: [], series: [], castCrewMatches: [] });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  if (!isOpen) return null;

  const handleSelectResult = (imdbID) => {
    onClose();
    navigate(`/movies/${imdbID}`);
  };

  const hasResults =
    results &&
    (results.movies.length > 0 || results.series.length > 0 || results.castCrewMatches?.length > 0);

  return (
    <div className="search-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Search Bar Header */}
        <div className="search-input-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-header-icon">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-main-input"
            placeholder="Search by title, director, actor or genre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="clear-query-btn" onClick={() => setQuery('')}>
              ✕
            </button>
          )}
          <span className="close-kbd-hint">ESC</span>
        </div>

        {/* Results Body */}
        <div className="search-results-body">
          {loading && (
            <div className="search-status-message">Searching OMDb archive...</div>
          )}

          {!loading && query.length >= 3 && !hasResults && (
            <div className="search-empty-state">
              <p className="empty-title">No movies found</p>
              <p className="empty-desc">
                Try searching for another movie title, actor (e.g. "Cillian Murphy") or genre.
              </p>
            </div>
          )}

          {!loading && query.length > 0 && query.length < 3 && (
            <div className="search-hint-message">Please type at least 3 characters to search.</div>
          )}

          {!loading && hasResults && (
            <div className="search-grouped-lists">
              {/* Movies Group */}
              {results.movies.length > 0 && (
                <div className="result-group">
                  <h4 className="group-heading">Movies ({results.movies.length})</h4>
                  <div className="result-items">
                    {results.movies.slice(0, 5).map((m) => (
                      <div
                        key={m.imdbID}
                        className="result-row"
                        onClick={() => handleSelectResult(m.imdbID)}
                      >
                        <img
                          src={getPosterUrl(m.posterUrl)}
                          alt={m.title}
                          className="result-thumb"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.target.src = '/fallbacks/poster.svg'; }}
                        />
                        <div className="result-info">
                          <p className="result-title">{m.title}</p>
                          <span className="result-meta">{m.year} • Movie</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Series Group */}
              {results.series.length > 0 && (
                <div className="result-group">
                  <h4 className="group-heading">Web Series ({results.series.length})</h4>
                  <div className="result-items">
                    {results.series.slice(0, 5).map((s) => (
                      <div
                        key={s.imdbID}
                        className="result-row"
                        onClick={() => handleSelectResult(s.imdbID)}
                      >
                        <img
                          src={getPosterUrl(s.posterUrl)}
                          alt={s.title}
                          className="result-thumb"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.target.src = '/fallbacks/poster.svg'; }}
                        />
                        <div className="result-info">
                          <p className="result-title">{s.title}</p>
                          <span className="result-meta">{s.year} • Series</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast & Crew Matches */}
              {results.castCrewMatches && results.castCrewMatches.length > 0 && (
                <div className="result-group">
                  <h4 className="group-heading">Matches in Cast & Crew</h4>
                  <div className="result-items">
                    {results.castCrewMatches.slice(0, 4).map((c) => (
                      <div
                        key={c.imdbID}
                        className="result-row"
                        onClick={() => handleSelectResult(c.imdbID)}
                      >
                        <img
                          src={getPosterUrl(c.posterUrl)}
                          alt={c.title}
                          className="result-thumb"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.target.src = '/fallbacks/poster.svg'; }}
                        />
                        <div className="result-info">
                          <p className="result-title">{c.title}</p>
                          <span className="result-meta">
                            {c.actors ? c.actors.slice(0, 2).join(', ') : c.year}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
