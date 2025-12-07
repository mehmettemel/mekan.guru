// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];
type UserRole = Database['public']['Enums']['user_role'];

const supabase = createClient();

// Query keys
export const authKeys = {
  session: ['auth', 'session'] as const,
  profile: (userId: string) => ['auth', 'profile', userId] as const,
  user: ['auth', 'user'] as const,
};

// Fetch session
async function fetchSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// Fetch user profile
async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Main auth hook
export function useAuth() {
  const queryClient = useQueryClient();

  // Query for session
  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: authKeys.session,
    queryFn: fetchSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  const user = session?.user ?? null;

  // Query for profile (only if user exists)
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: user ? authKeys.profile(user.id) : ['no-user'],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });

  // Listen to auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Update session cache
      queryClient.setQueryData(authKeys.session, newSession);

      if (event === 'SIGNED_OUT') {
        // Clear all auth data
        queryClient.removeQueries({ queryKey: ['auth'] });
      }

      if (event === 'SIGNED_IN' && newSession?.user) {
        // Prefetch profile
        queryClient.prefetchQuery({
          queryKey: authKeys.profile(newSession.user.id),
          queryFn: () => fetchUserProfile(newSession.user.id),
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const loading = sessionLoading || (!!user && profileLoading);

  return {
    user,
    profile: profile ?? null,
    session,
    loading,
    error: sessionError || profileError,
  };
}

// Sign up mutation
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      username,
    }: {
      email: string;
      password: string;
      username?: string;
    }) => {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: username || email.split('@')[0] },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.session) {
        queryClient.setQueryData(authKeys.session, data.session);
      }
    },
  });
}

// Sign in mutation
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.session, data.session);
    },
  });
}

// Sign out mutation
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['auth'] });
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<UserProfile>;
    }) => {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({
        queryKey: authKeys.profile(variables.userId),
      });
    },
  });
}

// Password reset mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/reset-password`,
      });

      if (error) throw error;
    },
  });
}

// Refresh profile helper
export function useRefreshProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return () => {
    if (user) {
      queryClient.invalidateQueries({
        queryKey: authKeys.profile(user.id),
      });
    }
  };
}
