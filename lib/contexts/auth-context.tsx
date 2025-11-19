// @ts-nocheck
'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient, resetClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { debugAuthState } from '@/lib/supabase/debug-client';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    username?: string
  ) => Promise<{
    user: User | null;
    error: AuthError | null;
  }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    user: User | null;
    error: AuthError | null;
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{
    error: Error | null;
  }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const fetchingProfile = useRef(false);

  // Optimized profile fetching with race condition protection
  const fetchProfile = useCallback(async (userId: string, force = false) => {
    console.log('📥 [FETCH PROFILE] Called for user:', userId, 'force:', force);

    // Prevent concurrent fetches for same user
    if (!force && fetchingProfile.current) {
      console.log('⏭️ [FETCH PROFILE] Already fetching, skipping');
      return null;
    }

    // Don't fetch if we already have the profile for this user
    if (!force && profile?.id === userId) {
      console.log('✅ [FETCH PROFILE] Profile already cached');
      return profile;
    }

    fetchingProfile.current = true;
    console.log('🔄 [FETCH PROFILE] Fetching from database...');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ [FETCH PROFILE] Error:', error.message);
        setProfile(null);
        return null;
      }

      console.log('✅ [FETCH PROFILE] Success! Profile:', data?.username);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('❌ [FETCH PROFILE] Unexpected error:', error);
      setProfile(null);
      return null;
    } finally {
      fetchingProfile.current = false;
    }
  }, [supabase, profile]);

  // Initialize auth and listen to changes
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Debug info
        console.log('🔄 [AUTH] Initializing auth...');
        debugAuthState();

        // Get current session from storage/cookies
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        console.log('🔄 [AUTH] Initial session:', initialSession ? 'EXISTS' : 'NULL');
        if (initialSession?.user) {
          console.log('✅ [AUTH] User ID:', initialSession.user.id);
        }

        if (!mounted) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          // Fetch profile for the authenticated user
          console.log('📥 [AUTH] Fetching profile...');
          const profileData = await fetchProfile(initialSession.user.id);
          console.log('✅ [AUTH] Profile fetched:', profileData ? 'SUCCESS' : 'FAILED');
        } else {
          // No session, clear everything
          console.log('⚠️ [AUTH] No session found, clearing state');
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ [AUTH] Initialization error:', error);
        // Clear state on error
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted) {
          console.log('✅ [AUTH] Loading complete');
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('🔔 [AUTH] Auth state changed:', event);
      console.log('🔔 [AUTH] New session:', newSession ? 'EXISTS' : 'NULL');

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Fetch profile on all auth events that indicate user is authenticated
        // This ensures profile is loaded even after page refresh
        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'INITIAL_SESSION' ||
          event === 'USER_UPDATED'
        ) {
          console.log('📥 [AUTH] Fetching profile for event:', event);
          const profileData = await fetchProfile(newSession.user.id);
          console.log('✅ [AUTH] Profile result:', profileData ? 'SUCCESS' : 'FAILED');
        }
      } else {
        // User signed out or session expired
        console.log('⚠️ [AUTH] Clearing profile (no session)');
        setProfile(null);
      }

      // Ensure loading is false after any auth state change
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      // Tarayıcı ortamında olduğumuzdan emin olalım
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const locale =
        typeof window !== 'undefined'
          ? window.location.pathname.split('/')[1] || 'en'
          : 'en';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
          emailRedirectTo: `${origin}/${locale}/auth/callback`,
        },
      });

      if (error) return { user: null, error };

      if (data.user && data.session) {
        await fetchProfile(data.user.id);
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { user: null, error };

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
      setSession(null);
      // Reset client singleton to ensure clean state
      resetClient();
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const locale =
      typeof window !== 'undefined'
        ? window.location.pathname.split('/')[1] || 'en'
        : 'en';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/${locale}/auth/reset-password`,
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, true); // Force refresh
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hooks
export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useProfile() {
  const { profile } = useAuth();
  return profile;
}

export function useSession() {
  const { session } = useAuth();
  return session;
}
