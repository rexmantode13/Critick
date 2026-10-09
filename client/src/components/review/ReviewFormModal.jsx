import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { reviewApi } from '../../api/reviewApi';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { RatingStars } from '../ui/RatingStars';
import './ReviewFormModal.css';

export const ReviewFormModal = ({
  isOpen,
  onClose,
  imdbID,
  movieTitle,
  initialReview = null, // if editing
  onSuccess,
}) => {
  const toast = useToast();

  const [rating, setRating] = useState(initialReview ? initialReview.rating : 5);
  const [title, setTitle] = useState(initialReview ? initialReview.title : '');
  const [body, setBody] = useState(initialReview ? initialReview.body : '');
  const [containsSpoilers, setContainsSpoilers] = useState(
    initialReview ? initialReview.containsSpoilers : false
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setTitle(initialReview.title);
      setBody(initialReview.body);
      setContainsSpoilers(initialReview.containsSpoilers);
    } else {
      setRating(5);
      setTitle('');
      setBody('');
      setContainsSpoilers(false);
    }
    setErrorMsg('');
  }, [initialReview, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating (1-5 stars).');
      return;
    }

    if (title.trim().length < 3 || title.trim().length > 100) {
      setErrorMsg('Review headline must be between 3 and 100 characters.');
      return;
    }

    if (body.trim().length < 20 || body.trim().length > 5000) {
      setErrorMsg('Review content must be between 20 and 5000 characters.');
      return;
    }

    setSubmitting(true);
    try {
      if (initialReview) {
        // Update
        const res = await reviewApi.updateReview(initialReview._id, {
          rating,
          title: title.trim(),
          body: body.trim(),
          containsSpoilers,
        });
        if (res.success) {
          toast.success('Review updated successfully!');
          onSuccess(res.data.review);
          onClose();
        }
      } else {
        // Create
        const res = await reviewApi.createReview({
          imdbID,
          rating,
          title: title.trim(),
          body: body.trim(),
          containsSpoilers,
        });
        if (res.success) {
          toast.success('Review published successfully!');
          onSuccess(res.data.review);
          onClose();
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialReview ? 'Edit Your Review' : `Write Review for ${movieTitle || 'Movie'}`}
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} className="review-form">
        {errorMsg && <div className="form-error-alert">{errorMsg}</div>}

        {/* Rating Picker */}
        <div className="form-group">
          <label className="form-label">Your Rating</label>
          <div className="rating-picker-wrapper">
            <RatingStars rating={rating} size="large" interactive onChange={setRating} />
            <span className="rating-picker-text">{rating} out of 5 stars</span>
          </div>
        </div>

        {/* Review Title Input */}
        <div className="form-group">
          <div className="label-with-counter">
            <label className="form-label" htmlFor="review-headline">
              Headline / Summary
            </label>
            <span className="char-counter">{title.length}/100</span>
          </div>
          <input
            id="review-headline"
            type="text"
            className="form-input"
            placeholder="e.g. A masterpiece of tension and visual brilliance"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        {/* Review Body Textarea */}
        <div className="form-group">
          <div className="label-with-counter">
            <label className="form-label" htmlFor="review-body">
              Your Review
            </label>
            <span className="char-counter">{body.length}/5000</span>
          </div>
          <textarea
            id="review-body"
            className="form-textarea"
            rows={6}
            placeholder="Share your thoughts on the performances, directing, story, and cinematography..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            required
          />
        </div>

        {/* Spoiler Toggle Checkbox */}
        <div className="form-checkbox-group">
          <input
            id="spoiler-checkbox"
            type="checkbox"
            checked={containsSpoilers}
            onChange={(e) => setContainsSpoilers(e.target.checked)}
          />
          <label htmlFor="spoiler-checkbox" className="checkbox-label">
            This review contains major plot spoilers
          </label>
        </div>

        <div className="modal-footer-actions">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting}>
            {initialReview ? 'Update Review' : 'Publish Review'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
