import React, { useState, useEffect } from 'react';
import { reviewApi } from '../api/reviewApi';
import { ReviewCard } from '../components/review/ReviewCard';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import './Reviews.css';

export const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    reviewApi
      .getReviews({ sort, page, limit: 10 })
      .then((res) => {
        if (isMounted && res.success) {
          setReviews(res.data.items || []);
          setPagination(res.data.pagination || { page: 1, totalPages: 1, totalItems: 0 });
        }
      })
      .catch((err) => console.error('Failed to load reviews', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sort, page]);

  return (
    <div className="reviews-page-root container">
      <div className="reviews-page-header">
        <div>
          <h1 className="page-title">Community Reviews</h1>
          <p className="page-subtitle">
            Authentic, un-edited human opinions and reviews on movies and web series.
          </p>
        </div>

        {/* Sort Filter Tabs */}
        <div className="sort-tabs-row">
          {[
            { id: 'latest', label: 'Latest' },
            { id: 'helpful', label: 'Most Helpful' },
            { id: 'top-rated', label: 'Highest Rated' },
            { id: 'discussed', label: 'Most Discussed' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`sort-tab-btn ${sort === tab.id ? 'active' : ''}`}
              onClick={() => {
                setSort(tab.id);
                setPage(1);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="reviews-loading-list">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="180px" borderRadius="var(--radius-lg)" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="reviews-empty-state">
          <h3>No reviews written yet</h3>
          <p>Be the first film lover to publish a review on Critick!</p>
        </div>
      ) : (
        <div className="reviews-main-list">
          {reviews.map((rev) => (
            <ReviewCard key={rev._id} review={rev} />
          ))}

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};
