'use client';

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';
import api from '@/services/api';

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
    const checkUser = async () => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
            setToken(storedToken);
            try {
                // Fetch user profile with the stored token
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                // Token is invalid or expired
                logout();
            }
        }
        setLoading(false);
    }
    checkUser();
  }, []);

  const handleAuthSuccess = (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    setToken(token);
    setUser(user);
    setAuthError(null);
    router.push('/dashboard');
  };

  const handleAuthError = (error: any, defaultMessage: string) => {
    const message = error.response?.data?.message || error.message || defaultMessage;
    setAuthError(message);
    toast({
      variant: 'destructive',
      title: 'Falha na Autenticação',
      description: message,
    });
  };

  const login = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      handleAuthSuccess(token, user);
    } catch (error: any) {
      handleAuthError(error, 'Falha ao iniciar sessão.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      await api.post('/auth/register', data);
      toast({
        title: 'Registo Bem-sucedido',
        description: 'Agora pode iniciar sessão com as suas credenciais.',
      });
      router.push('/login');
    } catch (error: any) {
      handleAuthError(error, 'Falha ao registar.');
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
