'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Heart,
  MapPin,
  FolderTree,
} from 'lucide-react';
import { CollectionCard } from '@/components/collections/collection-card';
import Link from 'next/link';

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

interface VotedCollection {
  collection: Collection;
  voted_at: string;
  vote_type: 'upvote' | 'downvote';
}

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [upvotedCollections, setUpvotedCollections] = useState<
    VotedCollection[]
  >([]);
  const [downvotedCollections, setDownvotedCollections] = useState<
    VotedCollection[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/?auth=login');
    }
  }, [authLoading, user, router]);

  // Fetch user's voted collections
  useEffect(() => {
    if (user) {
      fetchVotedCollections();
    }
  }, [user]);

  const fetchVotedCollections = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch upvoted collections
      const { data: upvotesData, error: upvotesError } = await supabase
        .from('collection_votes')
        .select(
          `
          created_at,
          collection:collections!inner(
            *,
            location:locations(id, names),
            category:categories!collections_category_id_fkey(id, names)
          )
        `
        )
        .eq('user_id', user.id)
        .eq('value', 1)
        .order('created_at', { ascending: false });

      if (upvotesError) throw upvotesError;

      // Fetch downvoted collections
      const { data: downvotesData, error: downvotesError } = await supabase
        .from('collection_votes')
        .select(
          `
          created_at,
          collection:collections!inner(
            *,
            location:locations(id, names),
            category:categories!collections_category_id_fkey(id, names)
          )
        `
        )
        .eq('user_id', user.id)
        .eq('value', -1)
        .order('created_at', { ascending: false });

      if (downvotesError) throw downvotesError;

      // Get places count for each collection
      const processCollections = async (votesData: any[], voteType: 'upvote' | 'downvote') => {
        return await Promise.all(
          (votesData || []).map(async (vote) => {
            const { count } = await supabase
              .from('collection_places')
              .select('*', { count: 'exact', head: true })
              .eq('collection_id', vote.collection.id);

            return {
              collection: {
                ...vote.collection,
                places_count: count || 0,
              },
              voted_at: vote.created_at,
              vote_type: voteType,
            } as VotedCollection;
          })
        );
      };

      const upvotedWithCounts = await processCollections(upvotesData || [], 'upvote');
      const downvotedWithCounts = await processCollections(downvotesData || [], 'downvote');

      setUpvotedCollections(upvotedWithCounts);
      setDownvotedCollections(downvotedWithCounts);
    } catch (error) {
      console.error('Error fetching voted collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVote = async (collectionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('collection_votes')
        .delete()
        .eq('user_id', user.id)
        .eq('collection_id', collectionId);

      if (error) throw error;

      // Refresh the lists
      fetchVotedCollections();
    } catch (error) {
      console.error('Error removing vote:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 py-8 px-4">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Favorilerim
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Oy verdiğin koleksiyonları görüntüle
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Oy</CardTitle>
              <Heart className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upvotedCollections.length + downvotedCollections.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beğeniler</CardTitle>
              <ThumbsUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {upvotedCollections.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Beğenmemeler
              </CardTitle>
              <ThumbsDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {downvotedCollections.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Upvotes and Downvotes */}
        <Tabs defaultValue="upvotes" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upvotes" className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              Beğeniler ({upvotedCollections.length})
            </TabsTrigger>
            <TabsTrigger value="downvotes" className="gap-2">
              <ThumbsDown className="h-4 w-4" />
              Beğenmemeler ({downvotedCollections.length})
            </TabsTrigger>
          </TabsList>

          {/* Upvoted Collections */}
          <TabsContent value="upvotes" className="mt-6">
            {upvotedCollections.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ThumbsUp className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
                  <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                    Henüz beğeni yok
                  </h3>
                  <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
                    Beğendiğin koleksiyonlar burada görünecek
                  </p>
                  <Link href="/collections">
                    <button className="mt-6 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700">
                      Koleksiyonları Keşfet
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upvotedCollections.map(({ collection, voted_at }) => (
                  <div key={collection.id} className="relative">
                    <CollectionCard
                      collection={collection}
                      showActions={false}
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <span>
                        Beğenildi:{' '}
                        {new Date(voted_at).toLocaleDateString('tr-TR')}
                      </span>
                      <button
                        onClick={() => handleRemoveVote(collection.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Downvoted Collections */}
          <TabsContent value="downvotes" className="mt-6">
            {downvotedCollections.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ThumbsDown className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
                  <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                    Henüz beğenmeme yok
                  </h3>
                  <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
                    Beğenmediğin koleksiyonlar burada görünecek
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {downvotedCollections.map(({ collection, voted_at }) => (
                  <div key={collection.id} className="relative">
                    <CollectionCard
                      collection={collection}
                      showActions={false}
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <span>
                        Beğenilmedi:{' '}
                        {new Date(voted_at).toLocaleDateString('tr-TR')}
                      </span>
                      <button
                        onClick={() => handleRemoveVote(collection.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
    </div>
  );
}
