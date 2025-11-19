'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

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

  // 1. Profil Çekme Fonksiyonunu Sadeleştirdik
  // Retry mantığını kaldırdık çünkü sayfa yüklenirken bloklamaması gerekiyor.
  // Hata olsa bile 'null' dönerek uygulamanın açılmasını sağlıyoruz.
  const fetchProfile = async (userId: string) => {
    try {
      // console.log('🔍 Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error(
          '❌ Profil çekilemedi (Sayfa yüklenmeye devam edecek):',
          error.message
        );
        // Hata olsa bile null set ediyoruz ki eski profil kalmasın
        setProfile(null);
        return null;
      }

      // console.log('✅ Profile fetched:', data);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('❌ Unexpected error fetching profile:', error);
      setProfile(null);
      return null;
    }
  };

  // 2. Initialization Mantığını Düzelttik
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        // Mevcut oturumu al
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);

          // Kullanıcı varsa profilini çekmeyi dene ama hata verirse de devam et
          if (initialSession.user) {
            await fetchProfile(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error('Auth başlatma hatası:', error);
      } finally {
        // 3. NE OLURSA OLSUN LOADING'I KAPAT (Garanti Çıkış)
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // Başlat
    initializeAuth();

    // Auth state değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      // console.log('🔄 Auth state changed:', event);
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Sadece oturum açıldığında (SIGNED_IN) veya token yenilendiğinde profili güncelle
        // INITIAL_SESSION olayını atlıyoruz çünkü yukarıdaki initializeAuth bunu zaten yaptı
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Eğer profilimiz yoksa veya kullanıcı değiştiyse çek
          if (!profile || profile.id !== newSession.user.id) {
            await fetchProfile(newSession.user.id);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false); // Çıkışta hemen loading kapat
      }

      // Her durumda loading'i kapat (güvenlik önlemi)
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Dependency array boş olmalı

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
      await fetchProfile(user.id);
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
