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
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'user',
            full_name: session.user.user_metadata?.full_name || session.user.email || ''
          };
          setUser(authUser);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        console.log('Session fetched successfully');
      } catch (error) {
        console.error('Error fetching session:', error);
        setError(error instanceof Error ? error.message : 'Failed to load session');
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
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      const fetchPromise = supabase
        .from('profiles')
        .select('id, user_id, email, full_name, role, organization_id, is_active, last_login, created_at, updated_at')
        .eq('user_id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error && error.code === 'PGRST116') {
        // No profile found, create one
        console.warn('No profile found for user ID:', userId, 'Creating new profile...');
        await createProfileForUser(userId);
        return;
      }

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        console.log('Profile fetched successfully:', data);
        setProfile(data as Profile);
      } else {
        console.warn('No profile data returned, creating new profile...');
        await createProfileForUser(userId);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      // Don't block the app if profile fetch fails
      setProfile(null);
      if (error instanceof Error && error.message !== 'Profile fetch timeout') {
        console.log('Attempting to create new profile due to error...');
        try {
          await createProfileForUser(userId);
        } catch (createError) {
          console.error('Failed to create profile as fallback:', createError);
        }
      }
    }
  }

  async function createProfileForUser(userId: string) {
    try {
      console.log('Creating profile for user ID:', userId);
      
      // Add timeout for profile creation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile creation timeout')), 8000)
      );

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

      const createPromise = supabase
        .from('profiles')
        .insert([newProfile])
        .select('id, user_id, email, full_name, role, organization_id, is_active, last_login, created_at, updated_at')
        .single();

      const { data, error } = await Promise.race([createPromise, timeoutPromise]) as any;

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
      // Don't block the app, allow user to continue with null profile
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
        // Invoice management
        'invoices:read', 'invoices:write', 'invoices:delete',
        
        // Expense management
        'expenses:read', 'expenses:write', 'expenses:delete',
        
        // Transaction management
        'transactions:read', 'transactions:write', 'transactions:delete',
        
        // Ledger and accounting
        'ledger:read', 'ledger:write', 'ledger:delete',
        'journal_entries:read', 'journal_entries:write', 'journal_entries:delete', // Alternative naming
        
        // Product and inventory management
        'products:read', 'products:write', 'products:delete',
        'inventory:read', 'inventory:write', 'inventory:delete',
        
        // Asset management
        'assets:read', 'assets:write', 'assets:delete',
        'fixed_assets:read', 'fixed_assets:write', 'fixed_assets:delete',
        
        // Employee and HR management
        'employees:read', 'employees:write', 'employees:delete',
        'payroll:read', 'payroll:write', 'payroll:delete',
        'departments:read', 'departments:write', 'departments:delete',
        
        // Purchase management
        'purchases:read', 'purchases:write', 'purchases:delete',
        'purchase_returns:read', 'purchase_returns:write', 'purchase_returns:delete',
        
        // Sales management
        'sales:read', 'sales:write', 'sales:delete',
        'sales_returns:read', 'sales_returns:write', 'sales_returns:delete',
        'orders:read', 'orders:write', 'orders:delete',
        'quotations:read', 'quotations:write', 'quotations:delete',
        
        // Tax and compliance
        'tax:read', 'tax:write', 'tax:delete',
        'vat:read', 'vat:write', 'vat:delete',
        
        // Reports and analytics
        'reports:read', 'reports:export',
        
        // Bank and reconciliation
        'bank:read', 'bank:write', 'bank:delete',
        
        // Master data
        'contacts:read', 'contacts:write', 'contacts:delete',
        'categories:read', 'categories:write', 'categories:delete',
        
        // Settings and configuration
        'settings:read', 'settings:write', 'settings:delete'
      ],
      manager: [
        'invoices:read', 'invoices:write',
        'expenses:read', 'expenses:write',
        'transactions:read', 'transactions:write',
        'products:read', 'products:write',
        'employees:read', 'employees:write',
        'payroll:read', 'payroll:write',
        'ledger:read',
        'reports:read', 'reports:export'
      ],
      staff: [
        'invoices:read',
        'expenses:read', 'expenses:write',
        'transactions:read',
        'products:read',
        'reports:read'
      ],
      viewer: [
        'invoices:read',
        'expenses:read',
        'transactions:read',
        'products:read',
        'reports:read'
      ]
    };

    const userRole = profile?.role || 'accountant'; // Default to accountant instead of viewer
    const permissions = rolePermissions[userRole] || rolePermissions['accountant']; // Fallback to accountant permissions
    
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