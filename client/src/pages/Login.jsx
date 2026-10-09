import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.emailOrUsername || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(form);
      if (res.success) {
        toast.success('Welcome back!');
        navigate('/');
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="logo-wordmark">CRITICK</span>
          <h1>Welcome Back</h1>
          <p>Sign in to continue your cinema journey</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="login-email">Email or Username</label>
            <input
              id="login-email"
              type="text"
              name="emailOrUsername"
              placeholder="you@example.com or username"
              value={form.emailOrUsername}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one now</Link>
        </div>
      </div>
    </div>
  );
};
