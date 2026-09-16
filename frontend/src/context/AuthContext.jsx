import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, userApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(true);

  const setAuthData = (newToken, newUser) => {
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('accessToken', newToken);
    }
    if (newUser) {
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const clearAuthData = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  };

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('accessToken');
    try {
      if (storedToken) {
        const res = await authApi.getMe();
        if (res.data?.data?.user) {
          setUser(res.data.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.data.user));
        }
      } else {
        // Try refreshing via HTTP-only cookie if no token in localStorage
        const refreshRes = await authApi.refresh();
        const newToken = refreshRes.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          setToken(newToken);
          const meRes = await authApi.getMe();
          if (meRes.data?.data?.user) {
            setUser(meRes.data.data.user);
            localStorage.setItem('user', JSON.stringify(meRes.data.data.user));
          }
        }
      }
    } catch {
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleForceLogout = () => {
      clearAuthData();
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { accessToken, user: userData } = res.data.data;
    setAuthData(accessToken, userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    const { accessToken, user: userData } = res.data.data;
    setAuthData(accessToken, userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthData();
    }
  };

  const updateCurrentUser = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const refreshProfile = async () => {
    try {
      const res = await userApi.getProfile();
      if (res.data?.data?.user) {
        updateCurrentUser(res.data.data.user);
        return res.data.data.user;
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateCurrentUser,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
