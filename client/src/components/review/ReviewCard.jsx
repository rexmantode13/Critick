import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reviewApi } from '../../api/reviewApi';
import { RatingStars } from '../ui/RatingStars';
import { Badge } from '../ui/Badge';
import { SpoilerToggle } from './SpoilerToggle';
import { ReplyList } from './ReplyList';
import { formatRelativeTime, getInitials } from '../../utils/formatters';
import './ReviewCard.css';

export const ReviewCard = ({ review, onUpdate, onDelete }) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [helpfulCount, setHelpfulCount] = useState(review.helpfulVotes?.length || 0);
  const [isHelpful, setIsHelpful] = useState(
    review.helpfulVotes?.some((v) => (typeof v === 'string' ? v : v._id) === user?._id)
  );
  const [showReplies, setShowReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(review.replyCount || 0);

  const isOwner = user && (review.user?._id === user._id || review.user === user._id);
  const reviewer = review.user || {};
  const isCritic = reviewer.role === 'critic' || reviewer.plan === 'critic';

  const handleHelpfulClick = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to vote on helpful reviews.');
      return;
    }
    try {
      const res = await reviewApi.toggleHelpful(review._id);
      if (res.success) {
        setHelpfulCount(res.data.helpfulVotesCount);
        setIsHelpful(res.data.isHelpful);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to record vote');
    }
  };

  const handleReport = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to report reviews.');
      return;
    }
    const reason = window.prompt('Please enter the reason for reporting this review (e.g. spam, hate speech, inappropriate):');
    if (reason && reason.trim()) {
      try {
        await reviewApi.reportReview(review._id, reason.trim());
        toast.success('Thank you. Review has been reported to moderators.');
      } catch (err) {
        toast.error(err.message || 'Failed to submit report');
      }
    }
  };

  return (
    <article className="review-card">
      <div className="review-card-header">
        <div className="reviewer-info">
          <Link to={`/u/${reviewer.username || ''}`} className="avatar-link">
            <div className="reviewer-avatar">
              {reviewer.name ? getInitials(reviewer.name) : 'U'}
            </div>
          </Link>
          <div className="reviewer-meta">
            <div className="name-row">
              <Link to={`/u/${reviewer.username || ''}`} className="reviewer-name">
                {reviewer.name || 'Anonymous User'}
              </Link>
              {isCritic && <Badge variant="critic">Verified Critic</Badge>}
              {reviewer.role === 'admin' && <Badge variant="admin">Admin</Badge>}
            </div>
            <span className="review-timestamp">{formatRelativeTime(review.createdAt)}</span>
          </div>
        </div>

        <div className="review-rating-block">
          <RatingStars rating={review.rating} size="small" />
          <span className="rating-num">{review.rating}/5</span>
        </div>
      </div>

      <div className="review-card-body">
        <h4 className="review-heading">{review.title}</h4>

        {review.containsSpoilers ? (
          <SpoilerToggle>
            <p className="review-text-content">{review.body}</p>
          </SpoilerToggle>
        ) : (
          <p className="review-text-content">{review.body}</p>
        )}
      </div>

      <div className="review-card-footer">
        <div className="footer-actions-left">
          <button
            className={`action-btn helpful-btn ${isHelpful ? 'active' : ''}`}
            onClick={handleHelpfulClick}
          >
            <span>👍 Helpful</span>
            {helpfulCount > 0 && <span className="action-count">({helpfulCount})</span>}
          </button>

          <button
            className="action-btn reply-toggle-btn"
            onClick={() => setShowReplies(!showReplies)}
          >
            <span>💬 Replies</span>
            <span className="action-count">({replyCount})</span>
          </button>
        </div>

        <div className="footer-actions-right">
          {isOwner && (
            <>
              <button className="action-btn edit-btn" onClick={() => onUpdate && onUpdate(review)}>
                Edit
              </button>
              <button className="action-btn delete-btn" onClick={() => onDelete && onDelete(review._id)}>
                Delete
              </button>
            </>
          )}
          {!isOwner && (
            <button className="action-btn report-btn" onClick={handleReport}>
              Flag / Report
            </button>
          )}
        </div>
      </div>

      {showReplies && (
        <ReplyList
          reviewId={review._id}
          onReplyAdded={() => setReplyCount((prev) => prev + 1)}
        />
      )}
    </article>
  );
};
