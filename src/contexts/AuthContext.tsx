import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import supabase from '@/lib/supabase';
import type { Profile } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        .from('users')
        .select('id, email, name, role')
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
      setLoading(false); // Ensure loading is set to false after fetch
    }
  }

  async function signIn(email: string, password: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        await fetchProfile(data.user.id);
        navigate('/'); // Navigate only after profile is fetched
      }
    } catch (error) {
      console.error('SignIn Error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    setLoading(true);
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError || !user) throw signUpError;

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email,
          name: fullName,
          password_hash: password,
          role: 'accountant', // Default role
        });

      if (profileError) throw profileError;
    } catch (error) {
      console.error('SignUp Error:', error);
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      navigate('/auth/login');
    } catch (error) {
      console.error('SignOut Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };

  // console.log('The Loading state:', loading);
  // console.log('The User state:', user);
  // console.log('Profile state:', profile);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};