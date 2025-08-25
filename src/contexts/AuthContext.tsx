import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type User = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string, newPassword?: string) => Promise<{ error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ error?: string; resetLink?: string }>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const token = localStorage.getItem('moodmoment_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('moodmoment_token');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      localStorage.removeItem('moodmoment_token');
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Registration failed' };
      }

      localStorage.setItem('moodmoment_token', data.access_token);
      setUser(data.user);
      return {};
    } catch (error) {
      return { error: 'Registration failed. Please try again.' };
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Login failed' };
      }

      localStorage.setItem('moodmoment_token', data.access_token);
      setUser(data.user);
      return {};
    } catch (error) {
      return { error: 'Login failed. Please try again.' };
    }
  }

  async function signOut() {
    localStorage.removeItem('moodmoment_token');
    setUser(null);
  }

  async function updateProfile(fullName: string, newPassword?: string) {
    try {
      const token = localStorage.getItem('moodmoment_token');
      const body: any = { fullName };
      if (newPassword) {
        body.newPassword = newPassword;
      }

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Update failed' };
      }

      setUser(data.user);
      return {};
    } catch (error) {
      return { error: 'Update failed. Please try again.' };
    }
  }

  async function requestPasswordReset(email: string) {
    try {
      const response = await fetch('/api/auth/password/reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Reset request failed' };
      }

      return { resetLink: data.resetLink };
    } catch (error) {
      return { error: 'Reset request failed. Please try again.' };
    }
  }

  async function confirmPasswordReset(token: string, newPassword: string) {
    try {
      const response = await fetch('/api/auth/password/reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Password reset failed' };
      }

      return {};
    } catch (error) {
      return { error: 'Password reset failed. Please try again.' };
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    requestPasswordReset,
    confirmPasswordReset,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}