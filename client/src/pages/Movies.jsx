import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { catalogApi } from '../api/catalogApi';
import { MovieCard } from '../components/movie/MovieCard';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import './Movies.css';

const GENRE_LIST = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Western'
];

export const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [titles, setTitles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States from URL
  const selectedGenres = searchParams.get('genre') ? searchParams.get('genre').split(',') : [];
  const selectedType = searchParams.get('type') || '';
  const selectedSort = searchParams.get('sort') || 'popular';
  const minRating = searchParams.get('minRating') || '';
  const yearFrom = searchParams.get('yearFrom') || '';
  const yearTo = searchParams.get('yearTo') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const params = {
      page: currentPage,
      limit: 12,
      sort: selectedSort,
      ...(selectedGenres.length > 0 && { genre: selectedGenres.join(',') }),
      ...(selectedType && { type: selectedType }),
      ...(minRating && { minRating }),
      ...(yearFrom && { yearFrom }),
      ...(yearTo && { yearTo }),
    };

    catalogApi
      .getDiscover(params)
      .then((res) => {
        if (isMounted && res.success) {
          setTitles(res.data.items || []);
          setPagination(res.data.pagination || { page: 1, totalPages: 1, totalItems: 0 });
        }
      })
      .catch((err) => {
        console.error('Catalog discover error', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach((key) => {
      const val = newParams[key];
      if (val !== null && val !== undefined && val !== '') {
        updated.set(key, val);
      } else {
        updated.delete(key);
      }
    });
    // Reset to page 1 on filter change if page not explicitly passed
    if (!newParams.page) updated.set('page', '1');
    setSearchParams(updated);
  };

  const handleGenreToggle = (gName) => {
    const updatedGenres = selectedGenres.includes(gName)
      ? selectedGenres.filter((g) => g !== gName)
      : [...selectedGenres, gName];
    updateFilters({ genre: updatedGenres.length > 0 ? updatedGenres.join(',') : '' });
  };

  const handleClearAll = () => {
    setSearchParams({});
  };

  return (
    <div className="movies-page-root container">
      {/* Header Bar */}
      <div className="movies-page-header">
        <div>
          <h1 className="movies-page-title">Movies & Series Catalog</h1>
          <p className="catalog-growth-note">
            Catalog grows automatically as titles are searched and viewed across Critick.
          </p>
        </div>

        <div className="header-controls">
          <button
            className="mobile-filter-toggle-btn mobile-only"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            ⚙ Filters ({selectedGenres.length + (selectedType ? 1 : 0)})
          </button>

          <div className="sort-dropdown-wrapper">
            <label htmlFor="sort-select" className="sort-label">Sort by:</label>
            <select
              id="sort-select"
              value={selectedSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="sort-select"
            >
              <option value="popular">Popularity (IMDb Votes)</option>
              <option value="rating">Highest Rated (IMDb Rating)</option>
              <option value="newest">Release Date (Newest First)</option>
              <option value="recently_added">Recently Added to Critick</option>
            </select>
          </div>
        </div>
      </div>

      <div className="catalog-layout">
        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
        <aside className={`filters-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h3 className="filter-group-title">Filters</h3>
            <button className="clear-filters-btn" onClick={handleClearAll}>
              Clear All
            </button>
          </div>

          {/* Media Type Filter */}
          <div className="filter-group">
            <h4 className="filter-subtitle">Media Type</h4>
            <div className="radio-group">
              <label className="filter-radio-label">
                <input
                  type="radio"
                  name="type"
                  checked={selectedType === ''}
                  onChange={() => updateFilters({ type: '' })}
                />
                All Types
              </label>
              <label className="filter-radio-label">
                <input
                  type="radio"
                  name="type"
                  checked={selectedType === 'movie'}
                  onChange={() => updateFilters({ type: 'movie' })}
                />
                Movies Only
              </label>
              <label className="filter-radio-label">
                <input
                  type="radio"
                  name="type"
                  checked={selectedType === 'series'}
                  onChange={() => updateFilters({ type: 'series' })}
                />
                Web Series Only
              </label>
            </div>
          </div>

          {/* Minimum Rating Filter */}
          <div className="filter-group">
            <h4 className="filter-subtitle">Minimum Rating</h4>
            <div className="radio-group">
              {['9.0', '8.0', '7.0', '6.0'].map((r) => (
                <label key={r} className="filter-radio-label">
                  <input
                    type="radio"
                    name="minRating"
                    checked={minRating === r}
                    onChange={() => updateFilters({ minRating: minRating === r ? '' : r })}
                  />
                  ★ {r}+ and above
                </label>
              ))}
            </div>
          </div>

          {/* Genres Multi-Select */}
          <div className="filter-group">
            <h4 className="filter-subtitle">Genres</h4>
            <div className="checkbox-list">
              {GENRE_LIST.map((g) => (
                <label key={g} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(g)}
                    onChange={() => handleGenreToggle(g)}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* Year Range Filter */}
          <div className="filter-group">
            <h4 className="filter-subtitle">Release Year Range</h4>
            <div className="year-inputs-row">
              <input
                type="number"
                placeholder="From (e.g. 1990)"
                value={yearFrom}
                onChange={(e) => updateFilters({ yearFrom: e.target.value })}
                className="year-input"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="To (e.g. 2026)"
                value={yearTo}
                onChange={(e) => updateFilters({ yearTo: e.target.value })}
                className="year-input"
              />
            </div>
          </div>
        </aside>

        {/* Main Grid Content */}
        <main className="catalog-main">
          {loading ? (
            <div className="catalog-skeleton-grid">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} height="320px" borderRadius="var(--radius-lg)" />
              ))}
            </div>
          ) : titles.length === 0 ? (
            <div className="catalog-empty-state">
              <h3>No titles found matching your filters</h3>
              <p>Try resetting some filters or searching for specific titles in the search bar.</p>
              <Button variant="secondary" onClick={handleClearAll}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="movie-cards-grid">
                {titles.map((t) => (
                  <MovieCard key={t.imdbID} title={t} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => updateFilters({ page: String(p) })}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};
