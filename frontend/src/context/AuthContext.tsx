import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserDto, Role } from '../types';
import { authApi } from '../api/client';

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  login: (token: string, user: UserDto) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  role: Role | null;
  isDonor: boolean;
  isNgo: boolean;
  isVolunteer: boolean;
  isAdmin: boolean;
  isNgoVerified: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(() => {
    const saved = localStorage.getItem('foodbridge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('foodbridge_token');
  });
  const [loading, setLoading] = useState<boolean>(true);

  const login = (newToken: string, newUser: UserDto) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('foodbridge_token', newToken);
    localStorage.setItem('foodbridge_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await authApi.getMe();
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('foodbridge_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const isAuthenticated = !!token && !!user;
  const role = user?.role || null;
  const isDonor = role === 'DONOR';
  const isNgo = role === 'NGO';
  const isVolunteer = role === 'VOLUNTEER';
  const isAdmin = role === 'ADMIN';
  const isNgoVerified = isNgo && user?.organization?.verificationStatus === 'VERIFIED';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshUser,
        isAuthenticated,
        role,
        isDonor,
        isNgo,
        isVolunteer,
        isAdmin,
        isNgoVerified,
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
