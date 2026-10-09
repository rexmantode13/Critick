import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { catalogApi } from '../api/catalogApi';
import { reviewApi } from '../api/reviewApi';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useToast } from '../context/ToastContext';
import { getPosterUrl, formatRuntime, formatNumber, formatDate } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { RatingStars } from '../components/ui/RatingStars';
import { CastMonogram } from '../components/movie/CastMonogram';
import { SeasonAccordion } from '../components/movie/SeasonAccordion';
import { MovieCard } from '../components/movie/MovieCard';
import { ReviewCard } from '../components/review/ReviewCard';
import { ReviewFormModal } from '../components/review/ReviewFormModal';
import { Skeleton } from '../components/ui/Skeleton';
import './MovieDetail.css';

export const MovieDetail = () => {
  const { imdbID } = useParams();
  const { isAuthenticated, toggleFavourite, user } = useAuth();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const toast = useToast();

  const [titleData, setTitleData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [readMore, setReadMore] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [imgFailed, setImgFailed] = useState(false);

  const inWatchlist = isInWatchlist(imdbID);
  const isFavourited = user?.favourites?.some((f) => f.imdbID === imdbID);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    catalogApi
      .getTitleDetails(imdbID)
      .then((res) => {
        if (isMounted && res.success) {
          setTitleData(res.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching title details', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    catalogApi
      .getRecommendations(imdbID)
      .then((res) => {
        if (isMounted && res.success) setRecommendations(res.data.items || []);
      })
      .catch(() => {});

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [imdbID]);

  const loadReviews = () => {
    setReviewsLoading(true);
    reviewApi
      .getTitleReviews(imdbID)
      .then((res) => {
        if (res.success && res.data?.items) {
          setReviews(res.data.items);
        }
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  };

  const handleWatchlistClick = () => {
    if (inWatchlist) {
      removeFromWatchlist(imdbID);
      toast.info('Removed from Watchlist');
    } else {
      addToWatchlist({
        imdbID: titleData.imdbID,
        title: titleData.title,
        mediaType: titleData.type,
        posterUrl: titleData.posterUrl,
        year: titleData.year,
      });
      toast.success('Added to Watchlist!');
    }
  };

  const handleFavouriteClick = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to add to favourites.');
      return;
    }
    try {
      const res = await toggleFavourite({
        imdbID: titleData.imdbID,
        mediaType: titleData.type,
        title: titleData.title,
        posterUrl: titleData.posterUrl,
        year: titleData.year,
      });
      if (res.success) {
        toast.success(res.data.isFavourited ? 'Added to Favourites!' : 'Removed from Favourites');
      }
    } catch (err) {
      toast.error('Failed to update favourites');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete your review?')) {
      try {
        await reviewApi.deleteReview(reviewId);
        toast.success('Review deleted.');
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      } catch (err) {
        toast.error('Failed to delete review');
      }
    }
  };

  if (loading) {
    return (
      <div className="container detail-loading">
        <Skeleton height="450px" borderRadius="var(--radius-xl)" />
      </div>
    );
  }

  if (!titleData) {
    return (
      <div className="container detail-error">
        <h2>Title Not Found</h2>
        <p>The requested title could not be found in our database or OMDb archive.</p>
        <Link to="/movies">
          <Button variant="primary">Browse Movies</Button>
        </Link>
      </div>
    );
  }

  const critickRating = titleData.critickRating || {};
  const dist = critickRating.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalCritickRev = critickRating.totalReviews || 0;

  return (
    <div className="movie-detail-root">
      {/* 1. Poster-Led Header */}
      <section className="detail-hero-banner">
        <div className="container detail-hero-container">
          {/* Large Poster Left */}
          <div className="detail-poster-col">
            <div className="detail-poster-frame">
              {!imgFailed ? (
                <img
                  src={getPosterUrl(titleData.posterUrl, true)}
                  alt={`${titleData.title} poster`}
                  className="detail-poster-img"
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

          {/* Details Right */}
          <div className="detail-info-col">
            <div className="detail-title-header">
              <h1 className="detail-title">{titleData.title}</h1>
              <div className="detail-sub-meta">
                <span className="meta-tag">{titleData.year}</span>
                {titleData.rated && titleData.rated !== 'N/A' && (
                  <span className="meta-tag">{titleData.rated}</span>
                )}
                {titleData.runtimeMinutes && (
                  <span className="meta-tag">{formatRuntime(titleData.runtimeMinutes)}</span>
                )}
                {titleData.totalSeasons && (
                  <span className="meta-tag">{titleData.totalSeasons} Seasons</span>
                )}
                <span className="meta-type">{titleData.type === 'series' ? 'Web Series' : 'Movie'}</span>
              </div>
            </div>

            {/* 3 Rating Blocks */}
            <div className="rating-blocks-row">
              {/* Block 1: Critick Community */}
              <div className="rating-block critick-rating-block">
                <span className="block-label">Critick Community</span>
                {critickRating.avgRating ? (
                  <div className="rating-score-row">
                    <span className="score-val">{critickRating.avgRating}</span>
                    <span className="score-max">/5</span>
                  </div>
                ) : (
                  <span className="unrated-text">Not rated yet</span>
                )}
                <span className="vote-count">{totalCritickRev} user reviews</span>
              </div>

              {/* Block 2: IMDb */}
              <div className="rating-block imdb-rating-block">
                <span className="block-label">IMDb Score</span>
                {titleData.imdbRating ? (
                  <div className="rating-score-row">
                    <span className="score-val">★ {titleData.imdbRating}</span>
                    <span className="score-max">/10</span>
                  </div>
                ) : (
                  <span className="unrated-text">N/A</span>
                )}
                <span className="vote-count">
                  {titleData.imdbVotes ? `${formatNumber(titleData.imdbVotes)} votes` : 'External'}
                </span>
              </div>

              {/* Block 3: Rotten Tomatoes & Metacritic */}
              <div className="rating-block external-ratings-block">
                <span className="block-label">Critics Ratings</span>
                <div className="critics-scores">
                  {titleData.ratings?.rottenTomatoes && (
                    <div className="critic-score-pill">
                      <span>🍅 Rotten Tomatoes:</span>
                      <strong className="score-txt">{titleData.ratings.rottenTomatoes}</strong>
                    </div>
                  )}
                  {titleData.metascore && (
                    <div className="critic-score-pill">
                      <span>🎯 Metascore:</span>
                      <strong className="score-txt">{titleData.metascore}/100</strong>
                    </div>
                  )}
                  {!titleData.ratings?.rottenTomatoes && !titleData.metascore && (
                    <span className="unrated-text">N/A</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="detail-actions-row">
              <Button
                variant={inWatchlist ? 'secondary' : 'primary'}
                onClick={handleWatchlistClick}
              >
                {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </Button>

              <Button
                variant={isFavourited ? 'secondary' : 'outline'}
                onClick={handleFavouriteClick}
              >
                {isFavourited ? '❤️ Favourited' : '🤍 Favourite'}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  if (!isAuthenticated) toast.info('Please sign in to write a review.');
                  else {
                    setEditingReview(null);
                    setReviewModalOpen(true);
                  }
                }}
              >
                ✍ Write Review
              </Button>
            </div>

            {/* External Plain Links */}
            <div className="external-links-row">
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${titleData.title} ${titleData.year} trailer`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                ▶ Search Trailer on YouTube
              </a>
              <a
                href={`https://www.imdb.com/title/${titleData.imdbID}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                ↗ Open on IMDb
              </a>
            </div>

            {/* Synopsis */}
            <div className="synopsis-block">
              <h3 className="section-subheading">Synopsis</h3>
              <p className={`synopsis-text ${!readMore ? 'line-clamp-3' : ''}`}>
                {titleData.plot}
              </p>
              {titleData.plot && titleData.plot.length > 180 && (
                <button className="read-more-btn" onClick={() => setReadMore(!readMore)}>
                  {readMore ? 'Show Less ↑' : 'Read More ↓'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <div className="container detail-body-container">
        {/* Metadata Grid (Genres, Crew, Box Office) */}
        <section className="detail-metadata-grid">
          <div className="meta-column">
            <span className="meta-label">Genres</span>
            <p className="meta-value">{titleData.genres?.join(', ') || 'N/A'}</p>
          </div>
          <div className="meta-column">
            <span className="meta-label">Director</span>
            <p className="meta-value">{titleData.directors?.join(', ') || 'N/A'}</p>
          </div>
          <div className="meta-column">
            <span className="meta-label">Writers</span>
            <p className="meta-value">{titleData.writers?.join(', ') || 'N/A'}</p>
          </div>
          <div className="meta-column">
            <span className="meta-label">Languages</span>
            <p className="meta-value">{titleData.languages?.join(', ') || 'N/A'}</p>
          </div>
          <div className="meta-column">
            <span className="meta-label">Countries</span>
            <p className="meta-value">{titleData.countries?.join(', ') || 'N/A'}</p>
          </div>
          {titleData.boxOffice && titleData.boxOffice !== 'N/A' && (
            <div className="meta-column">
              <span className="meta-label">Box Office</span>
              <p className="meta-value">{titleData.boxOffice}</p>
            </div>
          )}
          {titleData.production && titleData.production !== 'N/A' && (
            <div className="meta-column">
              <span className="meta-label">Production Company</span>
              <p className="meta-value">{titleData.production}</p>
            </div>
          )}
          {titleData.awards && titleData.awards !== 'N/A' && (
            <div className="meta-column full-width">
              <span className="meta-label">Awards & Honors</span>
              <p className="meta-value">{titleData.awards}</p>
            </div>
          )}
        </section>

        {/* Top-Billed Cast (ACTOR NAMES ONLY with Monograms) */}
        {titleData.actors && titleData.actors.length > 0 && (
          <section className="detail-section">
            <h3 className="section-title">Top-billed Cast</h3>
            <p className="section-note">Showing billed lead actors from OMDb data.</p>
            <div className="cast-grid">
              {titleData.actors.map((actor) => (
                <CastMonogram key={actor} actorName={actor} />
              ))}
            </div>
          </section>
        )}

        {/* Web Series Seasons Accordion */}
        {titleData.type === 'series' && titleData.totalSeasons > 0 && (
          <section className="detail-section">
            <h3 className="section-title">Seasons & Episodes ({titleData.totalSeasons})</h3>
            <div className="seasons-accordion-list">
              {Array.from({ length: titleData.totalSeasons }, (_, i) => (
                <SeasonAccordion key={i + 1} imdbID={titleData.imdbID} seasonNum={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Critick Rating Distribution & Reviews Section */}
        <section className="detail-section">
          <div className="reviews-section-header">
            <div>
              <h3 className="section-title">Critick Community Reviews</h3>
              <p className="section-note">
                {reviews.length} written review{reviews.length !== 1 ? 's' : ''} on Critick
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                if (!isAuthenticated) toast.info('Please sign in to write a review.');
                else {
                  setEditingReview(null);
                  setReviewModalOpen(true);
                }
              }}
            >
              ✍ Write Review
            </Button>
          </div>

          {/* Rating Distribution Bar Chart */}
          {totalCritickRev > 0 && (
            <div className="rating-distribution-card">
              <h4 className="dist-title">Rating Breakdown</h4>
              <div className="dist-bars">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = dist[star] || 0;
                  const pct = totalCritickRev > 0 ? Math.round((count / totalCritickRev) * 100) : 0;
                  return (
                    <div key={star} className="dist-row">
                      <span className="dist-star-label">{star} ★</span>
                      <div className="dist-bar-track">
                        <div className="dist-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="dist-pct">{pct}% ({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <Skeleton height="150px" borderRadius="var(--radius-lg)" />
          ) : reviews.length === 0 ? (
            <div className="reviews-empty-box">
              <p className="empty-txt">No community reviews yet for {titleData.title}.</p>
              <p className="empty-sub">Be the first to share your thoughts and rate this film!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((rev) => (
                <ReviewCard
                  key={rev._id}
                  review={rev}
                  onUpdate={(r) => {
                    setEditingReview(r);
                    setReviewModalOpen(true);
                  }}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          )}
        </section>

        {/* Similar Titles / Recommendations */}
        {recommendations.length > 0 && (
          <section className="detail-section">
            <h3 className="section-title">Similar Titles You Might Like</h3>
            <div className="movie-cards-grid">
              {recommendations.map((rec) => (
                <MovieCard key={rec.imdbID} title={rec} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        imdbID={titleData.imdbID}
        movieTitle={titleData.title}
        initialReview={editingReview}
        onSuccess={() => {
          loadReviews();
          // Reload title details for updated average rating
          catalogApi.getTitleDetails(imdbID).then((r) => r.success && setTitleData(r.data));
        }}
      />
    </div>
  );
};
