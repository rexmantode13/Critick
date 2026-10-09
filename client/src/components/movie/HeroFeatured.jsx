import React from 'react';
import { Link } from 'react-router-dom';
import { getPosterUrl, formatRuntime } from '../../utils/formatters';
import { Button } from '../ui/Button';
import './HeroFeatured.css';

export const HeroFeatured = ({ title }) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  if (!title) return null;

  return (
    <div className="hero-featured-root">
      <div className="container hero-container">
        <div className="hero-content">
          <span className="editorial-tag">FEATURED FILM</span>
          <h1 className="hero-title">{title.title}</h1>

          <div className="hero-meta-row">
            {title.imdbRating && (
              <div className="hero-rating-badge">
                <span className="star-icon">★</span>
                <span>{title.imdbRating}</span>
                <span className="meta-scale">/10</span>
              </div>
            )}
            <span className="meta-item">{title.year}</span>
            {title.runtimeMinutes && (
              <span className="meta-item">• {formatRuntime(title.runtimeMinutes)}</span>
            )}
            {title.genres && title.genres.length > 0 && (
              <span className="meta-item">• {title.genres.join(', ')}</span>
            )}
          </div>

          <p className="hero-plot line-clamp-3">{title.plot}</p>

          <div className="hero-actions">
            <Link to={`/movies/${title.imdbID}`}>
              <Button variant="primary" size="large">
                Read Reviews
              </Button>
            </Link>
            <Link to={`/movies/${title.imdbID}`}>
              <Button variant="outline" size="large">
                View Movie Details
              </Button>
            </Link>
          </div>
        </div>

        <div className="hero-poster-column">
          <div className="hero-poster-frame">
            {!imgFailed ? (
              <img
                src={getPosterUrl(title.posterUrl, true)}
                alt={`${title.title} poster`}
                className="hero-poster-img"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="poster-fallback-text-container">
                <span className="poster-fallback-text">( poster not available ) - critick archive</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
