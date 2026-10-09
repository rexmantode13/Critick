import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reviewApi } from '../../api/reviewApi';
import { formatRelativeTime, getInitials } from '../../utils/formatters';
import { Button } from '../ui/Button';
import './ReplyList.css';

export const ReplyList = ({ reviewId, onReplyAdded }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReplyBody, setNewReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    reviewApi
      .getReplies(reviewId)
      .then((res) => {
        if (res.success && res.data?.items) {
          setReplies(res.data.items);
        }
      })
      .catch((err) => console.error('Failed to load replies', err))
      .finally(() => setLoading(false));
  }, [reviewId]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please sign in to reply.');
      return;
    }

    if (!newReplyBody.trim() || newReplyBody.trim().length < 2) {
      toast.error('Reply must be at least 2 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewApi.addReply(reviewId, newReplyBody.trim());
      if (res.success && res.data?.reply) {
        setReplies((prev) => [...prev, res.data.reply]);
        setNewReplyBody('');
        if (onReplyAdded) onReplyAdded();
        toast.success('Reply posted!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to post reply.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reply-list-container">
      {loading ? (
        <p className="reply-loading">Loading replies...</p>
      ) : (
        <div className="replies-wrapper">
          {replies.map((rep) => {
            const replier = rep.user || {};
            return (
              <div key={rep._id} className="reply-item">
                <div className="reply-avatar">{getInitials(replier.name || 'User')}</div>
                <div className="reply-content">
                  <div className="reply-header">
                    <span className="reply-author">{replier.name || 'User'}</span>
                    <span className="reply-time">{formatRelativeTime(rep.createdAt)}</span>
                  </div>
                  <p className="reply-body">{rep.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isAuthenticated ? (
        <form className="reply-form" onSubmit={handleSubmitReply}>
          <input
            type="text"
            className="reply-input"
            placeholder="Write a reply..."
            value={newReplyBody}
            onChange={(e) => setNewReplyBody(e.target.value)}
            disabled={submitting}
          />
          <Button type="submit" variant="primary" size="small" loading={submitting}>
            Reply
          </Button>
        </form>
      ) : (
        <p className="reply-login-prompt">
          Please <a href="/login">sign in</a> to participate in the discussion.
        </p>
      )}
    </div>
  );
};
