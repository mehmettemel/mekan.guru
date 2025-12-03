'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoginDialog } from './login-dialog';
import { SignupDialog } from './signup-dialog';
import { ResetPasswordDialog } from './reset-password-dialog';
import { User, LogOut, BookMarked, Star, Shield } from 'lucide-react';
import Link from 'next/link';

export function AuthButton() {
  const { user, profile, signOut, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showReset, setShowReset] = useState(false);

  // Listen for custom event to open login dialog
  useEffect(() => {
    const handleOpenLogin = () => setShowLogin(true);
    window.addEventListener('open-login-dialog', handleOpenLogin);
    return () => window.removeEventListener('open-login-dialog', handleOpenLogin);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="h-9 w-20 animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md" />
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLogin(true)}
          >
            Giriş Yap
          </Button>
          <Button
            size="sm"
            onClick={() => setShowSignup(true)}
          >
            Kayıt Ol
          </Button>
        </div>

        <LoginDialog
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onSwitchToReset={() => {
            setShowLogin(false);
            setShowReset(true);
          }}
        />

        <SignupDialog
          isOpen={showSignup}
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />

        <ResetPasswordDialog
          isOpen={showReset}
          onClose={() => setShowReset(false)}
          onSwitchToLogin={() => {
            setShowReset(false);
            setShowLogin(true);
          }}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline-block">
            {profile?.username || 'User'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.username}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/profil/${profile?.username}`}>
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/koleksiyonlarim">
            <BookMarked className="mr-2 h-4 w-4" />
            <span>Koleksiyonlarım</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/favoriler">
            <Star className="mr-2 h-4 w-4" />
            <span>Favorilerim</span>
          </Link>
        </DropdownMenuItem>

        {(profile?.role === 'admin' || profile?.role === 'moderator') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Paneli</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Çıkış Yap</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
