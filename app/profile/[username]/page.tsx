'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  User,
  Calendar,
  Star,
  FolderTree,
  Users,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { CollectionCard } from '@/components/collections/collection-card';
import Link from 'next/link';

interface Profile {
  id: string;
  username: string;
  trust_score: number;
  role: string;
  email_verified: boolean;
  followers_count: number;
  following_count: number;
  collections_count: number;
  reputation_score: number;
  created_at: string;
}

interface Collection {
  id: string;
  slug: string;
  names: { en: string; tr: string };
  descriptions: { en: string; tr: string };
  status: string;
  vote_count: number;
  is_featured: boolean;
  created_at: string;
  location?: { id: string; names: { en: string; tr: string } };
  category?: { id: string; names: { en: string; tr: string } };
  places_count?: number;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const username = params.username as string;
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  console.log('🔍 ProfilePage - Render started');
  console.log('📌 Username from params:', username);
  console.log('👤 Current user:', currentUser?.id);
  console.log('📊 Profile state:', profile);
  console.log('⏳ Loading state:', loading);

  useEffect(() => {
    console.log('🔄 useEffect triggered - fetching profile for:', username);
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      console.log('🚀 fetchProfile started for username:', username);
      setLoading(true);

      // Fetch user profile
      console.log('📡 Fetching user from database...');
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      console.log('📥 Profile data received:', profileData);
      console.log('❌ Profile error:', profileError);

      if (profileError) {
        console.error('⚠️ Error fetching profile:', profileError);
        throw profileError;
      }
      console.log('✅ Setting profile state with data:', profileData);
      setProfile(profileData);

      // Fetch user's collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select(
          `
          *,
          location:locations(id, names),
          category:categories!collections_category_id_fkey(id, names)
        `
        )
        .eq('creator_id', profileData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      if (collectionsError) throw collectionsError;

      // Get places count for each collection
      const collectionsWithCounts = await Promise.all(
        (collectionsData || []).map(async (collection) => {
          const { count } = await supabase
            .from('collection_places')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);

          return {
            ...collection,
            places_count: count || 0,
          };
        })
      );

      setCollections(collectionsWithCounts);
      console.log('📚 Collections set:', collectionsWithCounts.length);

      // Check if current user follows this profile
      if (currentUser && currentUser.id !== profileData.id) {
        console.log('👥 Checking follow status...');
        const { data: followData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileData.id)
          .single();

        setIsFollowing(!!followData);
        console.log('💚 Is following:', !!followData);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    } finally {
      console.log('🏁 fetchProfile completed, setting loading to false');
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/?auth=login');
      return;
    }

    setFollowLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile!.id);
        setIsFollowing(false);
      } else {
        // Follow
        await supabase.from('user_follows').insert({
          follower_id: currentUser.id,
          following_id: profile!.id,
        });
        setIsFollowing(true);
      }

      // Refresh profile to update counts
      fetchProfile();
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    console.log('⏳ Rendering loading state');
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    console.log('❌ Rendering not found state');
    return (
      <div className="container mx-auto max-w-4xl space-y-8 py-16 px-4 text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          User not found
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          The profile you're looking for doesn't exist.
        </p>
        <Link href="/">
          <Button>Ana Sayfaya Dön</Button>
        </Link>
      </div>
    );
  }

  console.log('✨ Rendering profile page with data');
  const isOwnProfile = currentUser?.id === profile.id;
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container mx-auto max-w-7xl space-y-8 py-8 px-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* User Info */}
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                <User className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                    {profile.username}
                  </h1>
                  {profile.role === 'admin' && (
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      Admin
                    </span>
                  )}
                  {profile.role === 'moderator' && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Moderator
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {joinDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-neutral-900 dark:text-neutral-50">
                    {profile.trust_score} Trust Score
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && currentUser && (
              <Button
                onClick={handleFollow}
                disabled={followLoading}
                variant={isFollowing ? 'outline' : 'default'}
              >
                {followLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <FolderTree className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.collections_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.followers_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Following</CardTitle>
            <Users className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.following_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation</CardTitle>
            <Star className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.reputation_score || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Collections</CardTitle>
              <CardDescription>
                {isOwnProfile ? 'Your' : `${profile.username}'s`} curated
                collections
              </CardDescription>
            </div>
            {isOwnProfile && (
              <Link href="/my-collections">
                <Button variant="outline" size="sm">
                  Tümünü Gör
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderTree className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                No collections yet
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
