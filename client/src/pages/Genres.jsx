import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../api/catalogApi';
import { Skeleton } from '../components/ui/Skeleton';
import './Genres.css';

export const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    catalogApi
      .getGenres()
      .then((res) => {
        if (res.success && res.data?.genres) {
          setGenres(res.data.genres);
        }
      })
      .catch((err) => console.error('Failed to load genres', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="genres-page-root container">
      <div className="genres-header">
        <h1 className="page-title">Explore Film Genres</h1>
        <p className="page-subtitle">
          Discover movies and web series by category across our curated catalog.
        </p>
      </div>

      {loading ? (
        <div className="genres-skeleton-grid">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} height="120px" borderRadius="var(--radius-lg)" />
          ))}
        </div>
      ) : (
        <div className="genres-full-grid">
          {genres.map((g) => (
            <Link key={g.name} to={`/movies?genre=${g.name}`} className="genre-tile">
              <div className="genre-tile-content">
                <h3 className="genre-tile-title">{g.name}</h3>
                <span className="genre-tile-count">{g.count} titles available</span>
              </div>
              <span className="genre-tile-arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
