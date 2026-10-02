import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ecocollect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ecocollect_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('ecocollect_user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, token: authToken } = res.data.data;

    setUser(loggedInUser);
    setToken(authToken);
    localStorage.setItem('ecocollect_token', authToken);
    localStorage.setItem('ecocollect_user', JSON.stringify(loggedInUser));

    return loggedInUser;
  };

  const register = async (data: any): Promise<User> => {
    const res = await api.post('/auth/register', data);
    const { user: registeredUser, token: authToken } = res.data.data;

    setUser(registeredUser);
    setToken(authToken);
    localStorage.setItem('ecocollect_token', authToken);
    localStorage.setItem('ecocollect_user', JSON.stringify(registeredUser));

    return registeredUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ecocollect_token');
    localStorage.removeItem('ecocollect_user');
    api.post('/auth/logout').catch(() => {});
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('ecocollect_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
