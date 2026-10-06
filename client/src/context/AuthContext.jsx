import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { isSupabaseConfigured, supabaseAuth } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cbsi_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed.role === 'authenticated') {
        if (parsed.email?.toLowerCase().includes('admin')) parsed.role = 'admin';
        else if (parsed.email?.toLowerCase().includes('faculty')) parsed.role = 'faculty';
        else parsed.role = 'participant';
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('cbsi_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (isSupabaseConfigured) {
        try {
          const session = await supabaseAuth.getSession();
          if (session?.user) {
            const profile = await supabaseAuth.getProfile(session.user.id, session.user);
            if (profile) {
              setUser(profile);
              setToken(session.access_token);
              localStorage.setItem('cbsi_user', JSON.stringify(profile));
            }
          }
        } catch (err) {
          console.error('Failed to load Supabase session:', err);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data.user);
          localStorage.setItem('cbsi_user', JSON.stringify(res.data.data.user));
        } catch (err) {
          console.error('Failed to load user:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    if (isSupabaseConfigured) {
      const { user: supabaseUser, session } = await supabaseAuth.login(email, password);
      setUser(supabaseUser);
      setToken(session?.access_token || null);
      if (session?.access_token) {
        localStorage.setItem('cbsi_token', session.access_token);
      }
      localStorage.setItem('cbsi_user', JSON.stringify(supabaseUser));
      return supabaseUser;
    }

    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('cbsi_token', newToken);
    localStorage.setItem('cbsi_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (userData) => {
    if (isSupabaseConfigured) {
      const { user: supabaseUser, session } = await supabaseAuth.register(userData);
      setUser(supabaseUser);
      setToken(session?.access_token || null);
      if (session?.access_token) {
        localStorage.setItem('cbsi_token', session.access_token);
      }
      localStorage.setItem('cbsi_user', JSON.stringify(supabaseUser));
      return supabaseUser;
    }

    const res = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('cbsi_token', newToken);
    localStorage.setItem('cbsi_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabaseAuth.logout();
    }
    localStorage.removeItem('cbsi_token');
    localStorage.removeItem('cbsi_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    localStorage.setItem('cbsi_user', JSON.stringify({ ...user, ...updatedData }));
  };

  const role = (user?.role || '').toLowerCase();
  const isAdmin = role === 'admin';
  const isFaculty = role === 'faculty';
  const isStaffOrAdmin = isAdmin || isFaculty;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isFaculty,
        isStaffOrAdmin,
        login,
        register,
        logout,
        updateUser,
        loading,
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
