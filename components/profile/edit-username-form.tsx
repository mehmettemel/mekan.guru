// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EditUsernameForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkUsername = async (value: string) => {
    if (!value || value.length < 3) {
      setAvailable(null);
      return;
    }

    // Username validation: alphanumeric, underscore, hyphen only
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(value)) {
      setAvailable(false);
      return;
    }

    setChecking(true);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', value)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned - username is available
        setAvailable(true);
      } else if (data) {
        // Username exists
        setAvailable(false);
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value.toLowerCase().trim());
    // Debounce check
    const timeoutId = setTimeout(() => {
      checkUsername(value.toLowerCase().trim());
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !available || username.length < 3) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ username } as any)
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'Kullanıcı adınız güncellendi.',
      });

      // Redirect to new profile URL
      router.push(`/profil/${username}`);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Kullanıcı adı güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kullanıcı Adını Değiştir</CardTitle>
        <CardDescription>
          Profil URL'niz kullanıcı adınıza göre oluşturulur.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">
              Yeni Kullanıcı Adı <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="kullanici_adi"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                minLength={3}
                maxLength={30}
                required
                className="pr-10"
              />
              {checking && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
              )}
              {!checking && available === true && (
                <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
              )}
              {!checking && available === false && (
                <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
              )}
            </div>
            {username.length > 0 && username.length < 3 && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                En az 3 karakter olmalı
              </p>
            )}
            {username.length >= 3 && !/^[a-zA-Z0-9_-]+$/.test(username) && (
              <p className="text-sm text-red-500">
                Sadece harf, rakam, _ ve - karakterleri kullanılabilir
              </p>
            )}
            {available === false && username.length >= 3 && (
              <p className="text-sm text-red-500">
                Bu kullanıcı adı zaten kullanılıyor
              </p>
            )}
            {available === true && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Bu kullanıcı adı kullanılabilir
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !available || username.length < 3}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Güncelleniyor...
              </>
            ) : (
              'Kullanıcı Adını Güncelle'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
