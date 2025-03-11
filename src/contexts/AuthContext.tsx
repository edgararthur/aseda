import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthError } from '@supabase/supabase-js';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword,
  signInWithGoogle as authSignInWithGoogle,
  onAuthStateChange,
  type AuthUser,
  type SignInCredentials,
} from '@/lib/auth';
import { User } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';
import type { Profile } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignInCredentials & { full_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearError: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => {
      unsubscribe.data?.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(false);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        console.log('The User state:', user);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
        navigate('/');
      } else {
        setProfile(null);
        navigate('/auth/login');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  async function fetchProfile(userId: string) {
    console.log('Fetching profile for user ID:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        console.log('Profile data:', data);
        setProfile(data);
      } else {
        console.warn('No profile data found for user ID:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  const handleError = (error: AuthError | Error) => {
    console.error('Auth error:', error);
    if ('message' in error) {
      switch (error.message) {
        case 'Invalid login credentials':
          setError('Invalid email or password. Please try again.');
          break;
        case 'Email not confirmed':
          setError('Please verify your email address before signing in.');
          break;
        case 'Password should be at least 6 characters':
          setError('Password must be at least 6 characters long.');
          break;
        case 'User already registered':
          setError('An account with this email already exists.');
          break;
        default:
          setError(error.message);
      }
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const clearError = () => setError(null);

  const signIn = async (credentials: SignInCredentials) => {
    try {
      setLoading(true);
      clearError();
      const { user, error } = await authSignIn(credentials);
      if (error) throw error;
      if (!user) throw new Error('No user returned from sign in');
    } catch (error) {
      handleError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      clearError();
      const { error } = await authSignInWithGoogle();
      if (error) throw error;
    } catch (error) {
      handleError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (credentials: SignInCredentials & { full_name: string }) => {
    try {
      setLoading(true);
      clearError();
      const { error } = await authSignUp(credentials);
      if (error) throw error;
      setError('Please check your email to verify your account.');
    } catch (error) {
      handleError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      clearError();
      const { error } = await authSignOut();
      if (error) throw error;
    } catch (error) {
      handleError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      clearError();
      const { error } = await authResetPassword(email);
      if (error) throw error;
      setError('Password reset instructions have been sent to your email.');
    } catch (error) {
      handleError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      clearError();
      const { error } = await authUpdatePassword(newPassword);
      if (error) throw error;
      setError('Password has been updated successfully.');
    } catch (error) {
      handleError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    clearError,
    isAdmin,
  };

  // console.log('The Loading state:', loading);
  // console.log('The User state:', user);
  // console.log('Profile state:', profile);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}