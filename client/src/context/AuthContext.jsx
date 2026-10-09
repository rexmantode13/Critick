import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
    }
  };

  const updateUserState = (updatedUser) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
  };

  const toggleFavourite = async (titleData) => {
    if (!user) throw new Error('Authentication required');
    const res = await userApi.toggleFavourite(titleData);
    if (res.success && res.data?.favourites) {
      setUser((prev) => ({ ...prev, favourites: res.data.favourites }));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        checkAuth,
        updateUserState,
        toggleFavourite,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCritic: user?.role === 'critic' || user?.plan === 'critic',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
