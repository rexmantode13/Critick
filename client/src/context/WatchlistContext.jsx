import React, { createContext, useState, useEffect, useContext } from 'react';
import { watchlistApi } from '../api/watchlistApi';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);
const GUEST_STORAGE_KEY = 'critick_guest_watchlist';

export const WatchlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch watchlist from API (for user) or LocalStorage (for guest)
  const fetchWatchlist = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await watchlistApi.getWatchlist();
        if (res.success && res.data?.items) {
          setWatchlist(res.data.items);
          
          // Merge local guest watchlist if any
          const guestItems = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '[]');
          if (guestItems.length > 0) {
            for (const item of guestItems) {
              await watchlistApi.addToWatchlist(item).catch(() => {});
            }
            localStorage.removeItem(GUEST_STORAGE_KEY);
            const updated = await watchlistApi.getWatchlist();
            if (updated.success) setWatchlist(updated.data.items);
          }
        }
      } catch (err) {
        console.error('Failed to load user watchlist', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest local storage
      const localItems = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '[]');
      setWatchlist(localItems);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [isAuthenticated, user?._id]);

  const addToWatchlist = async (titleData) => {
    const newItem = {
      _id: titleData._id || titleData.imdbID,
      imdbID: titleData.imdbID,
      mediaType: titleData.mediaType || titleData.type || 'movie',
      title: titleData.title,
      posterUrl: titleData.posterUrl,
      year: titleData.year,
      status: 'planned',
      addedAt: new Date().toISOString(),
    };

    if (isAuthenticated) {
      const res = await watchlistApi.addToWatchlist(newItem);
      if (res.success && res.data?.item) {
        setWatchlist((prev) => [res.data.item, ...prev.filter((i) => i.imdbID !== newItem.imdbID)]);
      }
      return res;
    } else {
      const updated = [newItem, ...watchlist.filter((i) => i.imdbID !== newItem.imdbID)];
      setWatchlist(updated);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      return { success: true, message: 'Added to guest watchlist!' };
    }
  };

  const removeFromWatchlist = async (idOrImdbId) => {
    // Optimistic update
    setWatchlist((prev) => prev.filter((i) => i._id !== idOrImdbId && i.imdbID !== idOrImdbId));

    if (isAuthenticated) {
      await watchlistApi.removeFromWatchlist(idOrImdbId);
    } else {
      const updated = watchlist.filter((i) => i._id !== idOrImdbId && i.imdbID !== idOrImdbId);
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const toggleStatus = async (id, newStatus) => {
    setWatchlist((prev) =>
      prev.map((i) => (i._id === id || i.imdbID === id ? { ...i, status: newStatus } : i))
    );

    if (isAuthenticated) {
      await watchlistApi.updateStatus(id, newStatus);
    } else {
      const updated = watchlist.map((i) => (i._id === id || i.imdbID === id ? { ...i, status: newStatus } : i));
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const isInWatchlist = (imdbID) => {
    return watchlist.some((i) => i.imdbID === imdbID);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        loading,
        addToWatchlist,
        removeFromWatchlist,
        toggleStatus,
        isInWatchlist,
        refreshWatchlist: fetchWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
