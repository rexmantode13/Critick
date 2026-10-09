import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { Skeleton } from './components/ui/Skeleton';
import './App.css';

/* ── Lazy-loaded pages ── */
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Movies = lazy(() => import('./pages/Movies').then((m) => ({ default: m.Movies })));
const MovieDetail = lazy(() => import('./pages/MovieDetail').then((m) => ({ default: m.MovieDetail })));
const Reviews = lazy(() => import('./pages/Reviews').then((m) => ({ default: m.Reviews })));
const Watchlist = lazy(() => import('./pages/Watchlist').then((m) => ({ default: m.Watchlist })));
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })));
const Genres = lazy(() => import('./pages/Genres').then((m) => ({ default: m.Genres })));
const Pro = lazy(() => import('./pages/Pro').then((m) => ({ default: m.Pro })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

/* ── Page loading fallback ── */
const PageLoader = () => (
  <div className="page-loader">
    <Skeleton height="60vh" borderRadius="var(--radius-xl)" />
  </div>
);

/* ── Route guards ── */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <ToastProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="movies" element={<Movies />} />
                <Route path="movies/:imdbID" element={<MovieDetail />} />
                <Route path="title/:imdbID" element={<MovieDetail />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="genres" element={<Genres />} />
                <Route path="pro" element={<Pro />} />

                {/* Watchlist — works for guests (localStorage) + auth users */}
                <Route path="watchlist" element={<Watchlist />} />

                {/* Auth-only routes */}
                <Route path="u/:username" element={<Profile />} />

                {/* Admin dashboard */}
                <Route
                  path="admin"
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  }
                />

                {/* Guest-only auth pages */}
                <Route
                  path="login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />
                <Route
                  path="register"
                  element={
                    <GuestRoute>
                      <Register />
                    </GuestRoute>
                  }
                />

                {/* 404 catch-all */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </WatchlistProvider>
    </AuthProvider>
  );
}

export default App;
