import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

type AuthContextType = {
  user: any | null;
  token: string | null;
  login: (token: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('auth_token');
      const storedUser = await SecureStore.getItemAsync('auth_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Set default header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (e) {
      console.error('Failed to load auth state', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    await SecureStore.setItemAsync('auth_token', newToken);
    await SecureStore.setItemAsync('auth_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
