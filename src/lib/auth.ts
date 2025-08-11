import { createClient } from '@supabase/supabase-js';
import { AuthError, AuthResponse, Provider } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SignInCredentials = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  full_name?: string;
};

export async function signInWithGoogle(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    // Note: For OAuth, the user data will be available after the redirect
    // The actual user data handling will be done in the auth state change listener
    return { user: null, error: null };
  } catch (error) {
    console.error('Google sign in error:', error);
    return {
      user: null,
      error: error as AuthError,
    };
  }
}

export async function signIn({ email, password }: SignInCredentials): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('No user returned from Supabase');
    }

    // Get the user's profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    const user: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      role: profile?.role || 'user',
      full_name: profile?.full_name,
    };

    return { user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      user: null,
      error: error as AuthError,
    };
  }
}

export type SignUpData = SignInCredentials & { 
  full_name: string;
  role?: string;
  organization_name?: string;
  business_type?: string;
  tax_number?: string;
  phone?: string;
  address?: string;
};

export async function signUp(credentials: SignUpData): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        full_name: credentials.full_name,
      },
    },
  });

  if (error) throw error;

  // Create organization and profile after successful signup
  if (data.user) {
    try {
      let organizationId = null;

      // Create organization if data provided
      if (credentials.organization_name) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .insert([
            {
              name: credentials.organization_name,
              business_type: credentials.business_type || 'company',
              tax_number: credentials.tax_number,
              phone: credentials.phone,
              address: credentials.address,
              email: credentials.email,
            },
          ])
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          throw orgError;
        }
        organizationId = orgData.id;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            user_id: data.user.id,
            email: data.user.email,
            full_name: credentials.full_name,
            role: credentials.role || 'accountant',
            organization_id: organizationId,
          },
        ]);

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }
    } catch (setupError) {
      // If there's an error with organization/profile creation, we should clean up
      console.error('Error during user setup:', setupError);
      throw setupError;
    }
  }

  return { data, error };
}

export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
}

export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: error as Error };
  }
}

export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: error as Error };
  }
}

// Auth state management
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        role: profile?.role || 'user',
        full_name: profile?.full_name,
      };
      callback(user);
    } else {
      callback(null);
    }
  });
} 