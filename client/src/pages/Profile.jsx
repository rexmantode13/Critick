import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getInitials, formatRelativeTime, getPosterUrl } from '../utils/formatters';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ReviewCard } from '../components/review/ReviewCard';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import './Profile.css';

export const Profile = () => {
  const { username: paramUsername } = useParams();
  const { user: currentUser, updateUserState } = useAuth();
  const toast = useToast();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'favourites' | 'activity'
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const targetUsername = paramUsername || currentUser?.username;
  const isOwnProfile = currentUser && currentUser.username === targetUsername;

  useEffect(() => {
    if (!targetUsername) return;
    let isMounted = true;
    setLoading(true);

    userApi
      .getUserProfile(targetUsername)
      .then((res) => {
        if (isMounted && res.success) {
          setProfileData(res.data);
          setEditName(res.data.name || '');
          setEditBio(res.data.bio || '');
          setEditAvatarUrl(res.data.avatarUrl || '');
        }
      })
      .catch((err) => {
        console.error('Failed to load profile', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetUsername]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userApi.updateProfile({
        name: editName.trim(),
        bio: editBio.trim(),
        avatarUrl: editAvatarUrl.trim(),
      });

      if (res.success && res.data?.user) {
        updateUserState(res.data.user);
        setProfileData((prev) => ({
          ...prev,
          name: res.data.user.name,
          bio: res.data.user.bio,
          avatarUrl: res.data.user.avatarUrl,
        }));
        toast.success('Profile updated!');
        setEditModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container profile-loading">
        <Skeleton height="200px" borderRadius="var(--radius-xl)" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container profile-error">
        <h2>User Not Found</h2>
        <p>No account found with username '@{targetUsername}'.</p>
      </div>
    );
  }

  const stats = profileData.stats || { reviewsCount: 0, watchedCount: 0, favouritesCount: 0 };

  return (
    <div className="profile-page-root container">
      {/* Header Banner */}
      <div className="profile-header-card">
        <div className="profile-header-main">
          <div className="profile-avatar">
            {profileData.avatarUrl ? (
              <img src={profileData.avatarUrl} alt={profileData.name} className="avatar-img" />
            ) : (
              <span>{getInitials(profileData.name)}</span>
            )}
          </div>

          <div className="profile-info">
            <div className="profile-title-row">
              <h1 className="profile-name">{profileData.name}</h1>
              {profileData.role === 'critic' && <Badge variant="critic">Verified Critic</Badge>}
              {profileData.role === 'admin' && <Badge variant="admin">Admin</Badge>}
              {profileData.plan === 'pro' && <Badge variant="pro">Critick Pro</Badge>}
            </div>
            <p className="profile-username">@{profileData.username}</p>
            {profileData.bio && <p className="profile-bio">{profileData.bio}</p>}
          </div>

          {isOwnProfile && (
            <Button variant="outline" onClick={() => setEditModalOpen(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {/* Stats Summary Bar */}
        <div className="profile-stats-bar">
          <div className="profile-stat-box">
            <span className="stat-num">{stats.reviewsCount}</span>
            <span className="stat-name">Reviews</span>
          </div>
          <div className="profile-stat-box">
            <span className="stat-num">{stats.watchedCount}</span>
            <span className="stat-name">Watched</span>
          </div>
          <div className="profile-stat-box">
            <span className="stat-num">{stats.favouritesCount}</span>
            <span className="stat-name">Favourites</span>
          </div>
        </div>
      </div>

      {/* Critic Insights Panel (Gated Gated Feature) */}
      {profileData.criticInsights && (
        <div className="critic-insights-panel">
          <h4 className="insights-heading">👑 Verified Critic Insights</h4>
          <div className="insights-metrics">
            <div className="metric">
              <span>Average Star Rating Given:</span>
              <strong>{profileData.criticInsights.avgRatingGiven} ★ / 5</strong>
            </div>
            <div className="metric">
              <span>Total Published Reviews:</span>
              <strong>{profileData.criticInsights.totalReviewsGiven} reviews</strong>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="profile-tabs-header">
        <button
          className={`profile-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Recent Reviews ({profileData.recentReviews?.length || 0})
        </button>
        <button
          className={`profile-tab ${activeTab === 'favourites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favourites')}
        >
          Favourites ({profileData.favourites?.length || 0})
        </button>
        <button
          className={`profile-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity Log
        </button>
      </div>

      {/* Tab Contents */}
      <div className="profile-tab-content">
        {activeTab === 'reviews' && (
          <div className="reviews-section">
            {!profileData.recentReviews || profileData.recentReviews.length === 0 ? (
              <p className="tab-empty-msg">No published reviews yet.</p>
            ) : (
              profileData.recentReviews.map((rev) => (
                <ReviewCard key={rev._id} review={{ ...rev, user: profileData }} />
              ))
            )}
          </div>
        )}

        {activeTab === 'favourites' && (
          <div className="favourites-grid">
            {!profileData.favourites || profileData.favourites.length === 0 ? (
              <p className="tab-empty-msg">No favourite titles added yet.</p>
            ) : (
              profileData.favourites.map((fav) => (
                <Link key={fav.imdbID} to={`/movies/${fav.imdbID}`} className="fav-card">
                  <img
                    src={getPosterUrl(fav.posterUrl)}
                    alt={fav.title}
                    className="fav-poster"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.target.src = '/fallbacks/poster.svg'; }}
                  />
                  <p className="fav-title line-clamp-1">{fav.title}</p>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-timeline">
            {!profileData.activityTimeline || profileData.activityTimeline.length === 0 ? (
              <p className="tab-empty-msg">No activity recorded yet.</p>
            ) : (
              profileData.activityTimeline.map((act) => (
                <div key={act._id} className="activity-row">
                  <span className="activity-dot" />
                  <div className="activity-details">
                    <span className="activity-text">
                      {act.type === 'reviewed' && `Reviewed "${act.title}"`}
                      {act.type === 'watchlisted' && `Added "${act.title}" to watchlist`}
                      {act.type === 'watched' && `Marked "${act.title}" as watched`}
                      {act.type === 'favourited' && `Favourited "${act.title}"`}
                      {act.type === 'viewed' && `Viewed details for "${act.title}"`}
                    </span>
                    <span className="activity-time">{formatRelativeTime(act.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Your Profile"
      >
        <form onSubmit={handleSaveProfile} className="edit-profile-form">
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Profile Description</label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              maxLength={300}
              placeholder="Tell film lovers about your favourite genres or directors..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Avatar Image URL (Optional)</label>
            <input
              type="url"
              value={editAvatarUrl}
              onChange={(e) => setEditAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div className="modal-footer-actions">
            <Button variant="ghost" onClick={() => setEditModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
