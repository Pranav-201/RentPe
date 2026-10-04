import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { User } from '../types';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';
import { useToast } from './ToastContext';
import { firebaseAuth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  token: string | null;
  firebaseUser: FirebaseUser | null;
  firebaseToken: string | null;
  loading: boolean;
  firebaseLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isFirebaseAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  signUpWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  resendVerificationEmail: (customUser?: FirebaseUser | null) => Promise<void>;
  getFirebaseIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  switchDemoUser: (role: 'admin' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('zingoo_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseToken, setFirebaseToken] = useState<string | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState<boolean>(true);
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

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(firebaseAuth, async (currentFirebaseUser) => {
      setFirebaseUser(currentFirebaseUser);

      if (!currentFirebaseUser) {
        setFirebaseToken(null);
        setFirebaseLoading(false);
        return;
      }

      // If registered/logged in via password, verify email before granting normal RentPe access
      const isPasswordProvider = currentFirebaseUser.providerData.some(
        (p) => p.providerId === 'password'
      );
      if (isPasswordProvider && !currentFirebaseUser.emailVerified) {
        setFirebaseToken(null);
        setFirebaseLoading(false);
        setUser(null);
        return;
      }

      let idToken: string;
      try {
        idToken = await currentFirebaseUser.getIdToken();
        setFirebaseToken(idToken);
      } catch (err) {
        console.warn('Failed to retrieve Firebase ID token:', err);
        setFirebaseToken(null);
        setFirebaseLoading(false);
        return;
      }

      try {
        const syncedAccount = await authService.syncFirebaseAccount(idToken);
        setUser(syncedAccount.user);
      } catch (err) {
        console.warn('Failed to synchronize Firebase account:', err);
      } finally {
        setFirebaseLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const getFirebaseErrorMessage = (err: any) => {
    switch (err?.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please log in instead.';
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Incorrect email or password.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled.';
      case 'auth/popup-blocked':
        return 'Your browser blocked the sign-in popup. Please allow popups and try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with a different sign-in method.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      case 'auth/unverified-email':
        return 'Please verify your email before signing in.';
      default:
        return err?.message || 'Incorrect email or password.';
    }
  };

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

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err);
      error(message);
      throw new Error(message);
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      await sendEmailVerification(userCredential.user);
      return userCredential.user;
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err);
      error(message);
      throw new Error(message);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      await userCredential.user.reload();

      const isPasswordProvider = userCredential.user.providerData.some(
        (p) => p.providerId === 'password'
      );

      if (isPasswordProvider && !userCredential.user.emailVerified) {
        const unverifiedError: any = new Error('Please verify your email before signing in.');
        unverifiedError.code = 'auth/unverified-email';
        unverifiedError.user = userCredential.user;
        error('Please verify your email before signing in.');
        throw unverifiedError;
      }

      return userCredential.user;
    } catch (err: any) {
      if (err?.code !== 'auth/unverified-email') {
        const message = getFirebaseErrorMessage(err);
        error(message);
      }
      throw err;
    }
  };

  const resendVerificationEmail = async (customUser?: FirebaseUser | null) => {
    try {
      const targetUser = customUser || firebaseAuth.currentUser;
      if (!targetUser) {
        throw new Error('No account found to resend verification email. Please log in first.');
      }
      await sendEmailVerification(targetUser);
      success('Verification email sent successfully.');
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err);
      error(message);
      throw new Error(message);
    }
  };

  const getFirebaseIdToken = async (forceRefresh = false) => {
    const currentFirebaseUser = firebaseAuth.currentUser;
    if (!currentFirebaseUser) return null;

    const idToken = await currentFirebaseUser.getIdToken(forceRefresh);
    setFirebaseToken(idToken);
    return idToken;
  };

  const logout = async () => {
    localStorage.removeItem('zingoo_token');
    setToken(null);
    setUser(null);

    try {
      await signOut(firebaseAuth);
      success('Logged out successfully');
    } catch (err) {
      error('Failed to sign out of Firebase. Please try again.');
    }
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
  const isFirebaseAuthenticated = !!firebaseUser;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        firebaseUser,
        firebaseToken,
        loading,
        firebaseLoading,
        isAdmin,
        isAuthenticated,
        isFirebaseAuthenticated,
        login,
        register,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resendVerificationEmail,
        getFirebaseIdToken,
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
