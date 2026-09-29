import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  switchDemoUser: (role: 'admin' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('zingoo_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const loadCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('zingoo_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await authService.getMe();
      setUser(data.user);
    } catch (err) {
      console.warn('Failed to load user from session token:', err);
      localStorage.removeItem('zingoo_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (credentials: LoginPayload) => {
    try {
      const data = await authService.login(credentials);
      localStorage.setItem('zingoo_token', data.token);
      setToken(data.token);
      setUser(data.user);
      success(`Welcome back, ${data.user.name}!`);
    } catch (err: any) {
      error(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const data = await authService.register(payload);
      localStorage.setItem('zingoo_token', data.token);
      setToken(data.token);
      setUser(data.user);
      success('Account registered successfully!');
    } catch (err: any) {
      error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('zingoo_token');
    setToken(null);
    setUser(null);
    success('Logged out successfully');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await authService.updateProfile(data);
      setUser(res.user);
      success('Profile updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const switchDemoUser = async (role: 'admin' | 'customer') => {
    try {
      if (role === 'admin') {
        await login({ email: 'admin@ecommerce.com', password: 'password123' });
      } else {
        await login({ email: 'customer@ecommerce.com', password: 'password123' });
      }
    } catch (err: any) {
      // If demo user does not exist in the database, attempt to auto-register
      try {
        if (role === 'admin') {
          await register({
            name: 'Demo Admin',
            email: 'admin@ecommerce.com',
            password: 'password123',
            phone: '9999999999',
            collegeId: 'ADMIN001',
            collegeName: 'RentPe Administration',
          });
        } else {
          await register({
            name: 'Demo Student',
            email: 'customer@ecommerce.com',
            password: 'password123',
            phone: '9876543210',
            collegeId: 'STU202401',
            collegeName: 'IIT Delhi',
            address: {
              street: 'Hostel 4, Room 204',
              city: 'New Delhi',
              state: 'Delhi',
              zipCode: '110016',
              country: 'India',
            },
          });
        }
      } catch (regErr: any) {
        error(`Demo login failed: ${regErr.message}`);
      }
    }
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        switchDemoUser,
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
