import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';

export const Admin = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, reportsRes] = await Promise.all([
        adminApi.getUsers().catch(() => ({ success: false })),
        adminApi.getReports().catch(() => ({ success: false })),
      ]);
      if (usersRes.success) setUsers(usersRes.data?.items || []);
      if (reportsRes.success) setReports(reportsRes.data?.items || []);
    } catch (err) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await adminApi.updateUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        toast.success(`User role updated to ${newRole}.`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update role.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Permanently delete this review?')) return;
    try {
      const res = await adminApi.deleteReview(reviewId);
      if (res.success) {
        setReports((prev) => prev.filter((r) => r.review?._id !== reviewId));
        toast.success('Review deleted.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete review.');
    }
  };

  return (
    <div className="admin-page container">
      <div className="admin-page-header">
        <span className="editorial-tag">ADMINISTRATION</span>
        <h1>Admin Console</h1>
        <p>Manage users, review reports, and moderate content.</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports ({reports.length})
        </button>
      </div>

      {loading ? (
        <div className="admin-empty">Loading admin data…</div>
      ) : activeTab === 'users' ? (
        <div className="admin-table-wrapper">
          {users.length === 0 ? (
            <div className="admin-empty">No registered users yet.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                      {u.name}
                    </td>
                    <td>@{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        background: u.role === 'admin' ? 'rgba(212,169,74,0.15)' : 'var(--bg-card)',
                        color: u.role === 'admin' ? 'var(--accent-gold)' : 'var(--text-muted)',
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      {u.role !== 'admin' ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.82rem',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <option value="user">user</option>
                          <option value="critic">critic</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="admin-table-wrapper">
          {reports.length === 0 ? (
            <div className="admin-empty">No reports filed.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reported By</th>
                  <th>Review Author</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td>@{r.reporter?.username || 'N/A'}</td>
                    <td>@{r.review?.user?.username || 'N/A'}</td>
                    <td style={{ maxWidth: '240px' }}>{r.reason}</td>
                    <td>{formatDate(r.createdAt)}</td>
                    <td>
                      {r.review && (
                        <button
                          className="admin-action-btn danger"
                          onClick={() => handleDeleteReview(r.review._id)}
                        >
                          Delete Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
