import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { catalogApi } from '../api/catalogApi';
import { reviewApi } from '../api/reviewApi';
import { HeroFeatured } from '../components/movie/HeroFeatured';
import { MovieCard } from '../components/movie/MovieCard';
import { ReviewCard } from '../components/review/ReviewCard';
import { Skeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import './Home.css';

export const Home = () => {
  const [heroTitle, setHeroTitle] = useState(null);
  const [trending, setTrending] = useState([]);
  const [trendingLabel, setTrendingLabel] = useState('Trending on Critick');
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [hiddenGems, setHiddenGems] = useState([]);
  const [genres, setGenres] = useState([]);
  const [communityReviews, setCommunityReviews] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        const results = await Promise.allSettled([
          catalogApi.getTrending(),
          catalogApi.getPopular(8),
          catalogApi.getTopRated(8),
          catalogApi.getHiddenGems(8),
          catalogApi.getGenres(),
          reviewApi.getReviews({ limit: 4 }),
          catalogApi.getStats(),
        ]);

        if (isMounted) {
          const [trendingRes, popularRes, topRatedRes, hiddenGemsRes, genresRes, reviewsRes, statsRes] = results.map(
            (r) => (r.status === 'fulfilled' ? r.value : null)
          );

          if (trendingRes?.success) {
            const validTrending = (trendingRes.data?.items || []).filter(item => item.posterUrl && item.posterUrl !== 'N/A');
            setTrending(validTrending);
            setTrendingLabel(trendingRes.data?.label || 'Trending on Critick');
          }
          
          // Fetch Dune: Part Two for Hero
          try {
            const duneRes = await catalogApi.getTitleDetails('tt15239678');
            if (duneRes.success) {
              setHeroTitle(duneRes.data);
            }
          } catch (e) {
            // fallback if it fails
          }

          if (popularRes?.success) setPopular((popularRes.data?.items || []).filter(item => item.posterUrl && item.posterUrl !== 'N/A'));
          if (topRatedRes?.success) setTopRated((topRatedRes.data?.items || []).filter(item => item.posterUrl && item.posterUrl !== 'N/A'));
          if (hiddenGemsRes?.success) setHiddenGems((hiddenGemsRes.data?.items || []).filter(item => item.posterUrl && item.posterUrl !== 'N/A'));
          if (genresRes?.success) setGenres(genresRes.data?.genres?.slice(0, 8) || []);
          if (reviewsRes?.success) setCommunityReviews(reviewsRes.data?.items || []);
          if (statsRes?.success) setStats(statsRes.data);

          // If trending has items or popular has items, clear any error
          if ((trendingRes?.data?.items?.length || 0) + (popularRes?.data?.items?.length || 0) === 0 && !trendingRes && !popularRes) {
            setErrorMsg("We couldn't load the movies right now. Please verify backend connection and OMDb key setup.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg("We couldn't load the movies right now. Please verify backend connection and OMDb key setup.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="container home-loading">
        <Skeleton height="380px" borderRadius="var(--radius-xl)" />
        <div className="skeleton-grid mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="280px" borderRadius="var(--radius-lg)" />
          ))}
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="container home-error-container">
        <h2>Something Went Wrong</h2>
        <p>{errorMsg}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="home-page-root">
      {/* 1. Poster-Led Featured Hero */}
      <HeroFeatured title={heroTitle} />

      <div className="container home-sections-wrapper">
        {/* 2. Trending on Critick / Editor's Picks */}
        <section className="home-section">
          <div className="section-header">
            <div>
              <span className="editorial-tag">CURATED SELECTION</span>
              <h2 className="section-title">{trendingLabel}</h2>
            </div>
            <Link to="/movies" className="view-all-link">
              View Catalog →
            </Link>
          </div>
          <div className="movie-cards-grid">
            {trending.slice(0, 6).map((item) => (
              <MovieCard key={item.imdbID} title={item} />
            ))}
          </div>
        </section>

        {/* 3. Popular This Week */}
        <section className="home-section">
          <div className="section-header">
            <div>
              <span className="editorial-tag">IMDb POPULARITY</span>
              <h2 className="section-title">Popular This Week</h2>
            </div>
            <Link to="/movies?sort=popular" className="view-all-link">
              View All →
            </Link>
          </div>
          <div className="movie-cards-grid">
            {popular.slice(0, 6).map((item) => (
              <MovieCard key={item.imdbID} title={item} />
            ))}
          </div>
        </section>

        {/* 4. Browse by Genre */}
        <section className="home-section">
          <div className="section-header">
            <div>
              <span className="editorial-tag">EXPLORE CATEGORIES</span>
              <h2 className="section-title">Browse by Genre</h2>
            </div>
            <Link to="/genres" className="view-all-link">
              All Genres →
            </Link>
          </div>
          <div className="genre-cards-grid">
            {genres.map((g) => (
              <Link key={g.name} to={`/movies?genre=${g.name}`} className="genre-box">
                <span className="genre-name">{g.name}</span>
                <span className="genre-count">{g.count} titles</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 5. Community Reviews */}
        {communityReviews.length > 0 && (
          <section className="home-section">
            <div className="section-header">
              <div>
                <span className="editorial-tag">HUMAN VOICES</span>
                <h2 className="section-title">Critick Community Reviews</h2>
              </div>
              <Link to="/reviews" className="view-all-link">
                All Reviews →
              </Link>
            </div>
            <div className="reviews-grid">
              {communityReviews.map((rev) => (
                <ReviewCard key={rev._id} review={rev} />
              ))}
            </div>
          </section>
        )}

        {/* 6. Popular With Critics / Top Rated */}
        <section className="home-section">
          <div className="section-header">
            <div>
              <span className="editorial-tag">CRITICAL ACCLAIM</span>
              <h2 className="section-title">Highest Rated Films</h2>
            </div>
            <Link to="/movies?sort=rating" className="view-all-link">
              View All →
            </Link>
          </div>
          <div className="movie-cards-grid">
            {topRated.slice(0, 6).map((item) => (
              <MovieCard key={item.imdbID} title={item} />
            ))}
          </div>
        </section>

        {/* 7. Hidden Gems */}
        <section className="home-section">
          <div className="section-header">
            <div>
              <span className="editorial-tag">UNDERRATED CINEMA</span>
              <h2 className="section-title">Hidden Gems</h2>
            </div>
            <Link to="/movies?minRating=7.5" className="view-all-link">
              Discover More →
            </Link>
          </div>
          <div className="movie-cards-grid">
            {hiddenGems.slice(0, 6).map((item) => (
              <MovieCard key={item.imdbID} title={item} />
            ))}
          </div>
        </section>

        {/* 8. Real Platform Stats */}
        {stats && (
          <section className="home-section stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{stats.totalTitles.toLocaleString()}</span>
                <span className="stat-label">Cached Titles</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.totalReviews.toLocaleString()}</span>
                <span className="stat-label">User Reviews</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.totalUsers.toLocaleString()}</span>
                <span className="stat-label">Film Lovers</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.totalWatchlists.toLocaleString()}</span>
                <span className="stat-label">Watchlist Saves</span>
              </div>
            </div>
          </section>
        )}

        {/* 9. Discovery CTA */}
        <section className="discovery-cta-card">
          <div className="cta-content">
            <h2 className="cta-title">Start Tracking Your Cinema Journey</h2>
            <p className="cta-desc">
              Save titles to your watchlist, rate your favourite films, and write reviews read by film lovers worldwide.
            </p>
            <Link to="/movies">
              <Button variant="primary" size="large">
                Explore Full Movies Catalog
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
