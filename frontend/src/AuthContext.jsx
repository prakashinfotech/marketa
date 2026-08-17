import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AUTH_FORCED_LOGOUT_EVENT } from './api';

const AuthContext = createContext(null);

function readUser() {
  const saved = sessionStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [user, setUser] = useState(readUser);

  const login = useCallback((accessToken, refreshToken, userData) => {
    sessionStorage.setItem('token', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    // Defensive: clear any legacy localStorage tokens from a previous version.
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Merge a partial user object into the current user, keeping tokens intact.
   * Use this when the user updates their profile / avatar / name — much safer
   * than re-calling `login(...)` with the same tokens just to refresh state.
   */
  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...(partial || {}) };
      sessionStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  // Cross-tab sync: when another tab logs in/out, mirror its state here.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') {
        setToken(e.newValue);
      } else if (e.key === 'user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Forced logout triggered by the API layer when refresh-token fails.
  useEffect(() => {
    const onForcedLogout = () => {
      logout();
      // Navigation handled by react-router on next render via guards;
      // no hard window.location redirect here to avoid losing app state.
    };
    window.addEventListener(AUTH_FORCED_LOGOUT_EVENT, onForcedLogout);
    return () => window.removeEventListener(AUTH_FORCED_LOGOUT_EVENT, onForcedLogout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
