import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWatchlist } from '../../context/WatchlistContext';
import { getPosterUrl } from '../../utils/formatters';
import './MovieCard.css';

export const MovieCard = ({ title }) => {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [imgSrc, setImgSrc] = useState(getPosterUrl(title.posterUrl));
  const [imgErrorCount, setImgErrorCount] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  const inWatchlist = isInWatchlist(title.imdbID);

  const handleImageError = () => {
    if (imgErrorCount === 0 && title.posterUrl && title.posterUrl !== 'N/A') {
      // Fallback from high-res rewrite to original
      setImgSrc(title.posterUrl);
      setImgErrorCount(1);
    } else {
      // Final fallback
      setImgFailed(true);
    }
  };

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(title.imdbID);
    } else {
      addToWatchlist({
        imdbID: title.imdbID,
        title: title.title,
        mediaType: title.type || 'movie',
        posterUrl: title.posterUrl,
        year: title.year,
      });
    }
  };

  return (
    <div className="movie-card">
      <Link to={`/movies/${title.imdbID}`} className="movie-card-link">
        <div className="poster-wrapper">
          {!imgFailed ? (
            <img
              src={imgSrc}
              alt={`${title.title} poster`}
              className="movie-poster"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
          ) : (
            <div className="poster-fallback-text-container">
              <span className="poster-fallback-text">( poster not available ) - critick archive</span>
            </div>
          )}
          {title.imdbRating && (
            <div className="rating-pill">
              <span className="star-icon">★</span>
              <span className="rating-val">{title.imdbRating}</span>
            </div>
          )}
          <button
            className={`watchlist-btn ${inWatchlist ? 'active' : ''}`}
            onClick={handleWatchlistClick}
            aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {inWatchlist ? '✓' : '+'}
          </button>
        </div>

        <div className="movie-card-info">
          <h3 className="movie-card-title line-clamp-1">{title.title}</h3>
          <div className="movie-card-meta">
            <span className="meta-year">{title.year}</span>
            {title.genres && title.genres.length > 0 && (
              <span className="meta-genre line-clamp-1">• {title.genres[0]}</span>
            )}
            {title.type === 'series' && <span className="type-tag">Series</span>}
          </div>
        </div>
      </Link>
    </div>
  );
};
