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
  type SignUpData,
} from '@/lib/auth';
import { User } from '@supabase/supabase-js';
import supabase, { type Profile } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearError: () => void;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Removed conflicting auth state listener to prevent navigation conflicts

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(false);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ? {
          id: session.user.id,
          email: session.user.email || '',
          role: 'user',
          full_name: session.user.user_metadata?.full_name || session.user.email || ''
        } : null);
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
      console.log('Auth state changed:', event, session);
      setLoading(true);
      
      try {
        const user = session?.user;
        if (user?.email) {
          const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            role: 'user',
            full_name: user.user_metadata?.full_name || user.email.split('@')[0]
          };
          setUser(authUser);
          await fetchProfile(user.id);
          
          // Navigate only on specific events to prevent loops
          if (event === 'SIGNED_IN') {
            navigate('/dashboard');
          }
        } else {
          setUser(null);
          setProfile(null);
          
          // Only navigate to login on sign out, not on initial load
          if (event === 'SIGNED_OUT') {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
      } finally {
        setLoading(false);
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
        .select('id, user_id, email, full_name, role, organization_id, is_active, last_login, created_at, updated_at')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        console.log('Profile data:', data);
        setProfile(data as Profile);
      } else {
        console.warn('No profile data found for user ID:', userId);
        // Create a profile for the user if one doesn't exist
        await createProfileForUser(userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  }

  async function createProfileForUser(userId: string) {
    try {
      console.log('Creating profile for user ID:', userId);
      
      // Get user data from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create a new profile
      const newProfile = {
        user_id: userId,
        email: user.email!,
        full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
        role: 'accountant' as const,
        organization_id: null, // Will be set when user creates/joins an organization
        is_active: true
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select('id, user_id, email, full_name, role, organization_id, is_active, last_login, created_at, updated_at')
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      if (data) {
        console.log('Profile created successfully:', data);
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error creating profile for user:', error);
      setProfile(null);
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

  const signUp = async (credentials: SignUpData) => {
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

  const hasRole = (role: string) => {
    return profile?.role === role;
  };

  const hasPermission = (permission: string) => {
    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'], // Admin has all permissions
      accountant: [
        'invoices:read', 'invoices:write', 'invoices:delete',
        'expenses:read', 'expenses:write', 'expenses:delete',
        'transactions:read', 'transactions:write', 'transactions:delete',
        'ledger:read', 'ledger:write', 'ledger:delete',
        'reports:read', 'reports:export',
        'payroll:read', 'payroll:write'
      ],
      manager: [
        'invoices:read', 'invoices:write',
        'expenses:read', 'expenses:write',
        'transactions:read', 'transactions:write',
        'ledger:read',
        'reports:read', 'reports:export',
        'payroll:read',
        'employees:read'
      ],
      staff: [
        'invoices:read',
        'expenses:read', 'expenses:write',
        'transactions:read',
        'reports:read'
      ],
      viewer: [
        'invoices:read',
        'expenses:read',
        'transactions:read',
        'reports:read'
      ]
    };

    const userRole = profile?.role || 'viewer';
    const permissions = rolePermissions[userRole] || [];
    
    // Admin has all permissions
    if (permissions.includes('*')) {
      return true;
    }
    
    return permissions.includes(permission);
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
    hasRole,
    hasPermission,
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