import React, { useState } from 'react';
import { User } from '../types/auth';
import { AuthContext } from './authContextDef';
import { api } from '../services/api';

/**
 * Storage Strategy & Tradeoffs:
 * - Persistence: The JWT token and basic user profile are persisted in localStorage
 *   under 'taskflow_token' and 'taskflow_user'.
 * - Tradeoffs: Storing tokens in localStorage allows persistent user sessions across
 *   page reloads and browser tabs without backend session state. However, localStorage is
 *   accessible to any JavaScript executing in the origin, so it is not immune to cross-site
 *   scripting (XSS).
 * - Mitigations: Strict server input validation, Helmet headers (CSP/HSTS) on the Express backend,
 *   sanitized React rendering, and automatic session cleanup on 401 token expiration.
 */
const TOKEN_KEY = 'taskflow_token';
const USER_KEY = 'taskflow_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      setSessionExpired(false);
      try {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      } catch {
        // Storage access failure
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.auth.register({ name, email, password });
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (expired: boolean = false) => {
    setToken(null);
    setUser(null);
    if (expired) {
      setSessionExpired(true);
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem('taskflow_local_tasks');
    } catch {
      // Storage access failure
    }
  };

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        sessionExpired,
        login,
        register,
        logout,
        clearSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
