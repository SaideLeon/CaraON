'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

const API_BASE_URL = 'http://caraonback.cognick.qzz.io/api/v1';
const TOKEN_KEY = 'caraon-token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      // Here you would typically fetch the user profile with the token
      // For now, we'll assume the token is valid and just need to navigate
      // A proper implementation would decode the token or call a /me endpoint
      setUser({ id: '', name: 'User', email: '' }); // Placeholder user
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser({ id: '', name: 'User', email: '' }); // Placeholder
    setAuthError(null);
    router.push('/dashboard');
  };

  const handleAuthError = (error: any, defaultMessage: string) => {
    const message = error.message || defaultMessage;
    setAuthError(message);
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: message,
    });
  };

  const login = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Invalid credentials');
      }
      handleAuthSuccess(result.token);
    } catch (error: any) {
      handleAuthError(error, 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Could not create account.');
      }
      toast({
        title: 'Registration Successful',
        description: 'You can now log in with your credentials.',
      });
      router.push('/login');
    } catch (error: any) {
      handleAuthError(error, 'Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    router.push('/login');
  };

  const value = { user, token, login, register, logout, loading, authError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
