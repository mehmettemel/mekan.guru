'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, User, Calendar, ThumbsUp, ThumbsDown, ArrowLeft, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/transitions/scroll-reveal';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Place {
  id: string;
  slug: string;
  names: { tr: string };
  address?: string;
  category?: {
    id: string;
    names: { tr: string };
  };
}

interface CollectionPlace {
  id: string;
  display_order: number;
  curator_note?: string;
  famous_items?: string[];
  place: Place;
}

interface Collection {
  id: string;
  slug: string;
  names: { tr: string };
  descriptions?: { tr: string };
  created_at: string;
  vote_count: number;
  vote_score: number;
  location?: {
    id: string;
    names: { tr: string };
    slug: string;
  };
  category?: {
    id: string;
    names: { tr: string };
    slug: string;
  };
  creator?: {
    id: string;
    username: string;
  };
  places: CollectionPlace[];
}

interface CollectionDetailViewProps {
  collection: Collection;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getRankBadgeColor = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-yellow-200';
  if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-gray-200';
  if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-orange-200';
  return 'bg-white text-neutral-700 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700';
};

export function CollectionDetailView({ collection }: CollectionDetailViewProps) {
  const [userVote, setUserVote] = useState<number | null>(null);
  const [voteCount, setVoteCount] = useState(collection.vote_count || 0);
  const supabase = createClient();
  const { user, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchUserVote() {
      if (!user) return;

      const { data, error } = await supabase
        .from('collection_votes')
        .select('value')
        .eq('user_id', user.id)
        .eq('collection_id', collection.id)
        .maybeSingle();

      if (!error && data) {
        setUserVote((data as any).value);
      }
    }

    fetchUserVote();
  }, [user, collection.id, supabase]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('Oy vermek için giriş yapmalısınız', {
        action: {
          label: 'Giriş Yap',
          onClick: () => window.dispatchEvent(new CustomEvent('open-login-dialog')),
        },
      });
      return;
    }

    if (!session) {
      toast.error('Oturum bulunamadı, lütfen tekrar giriş yapın');
      return;
    }

    try {
      const voteValue = voteType === 'up' ? 1 : -1;
      let newVoteCount = voteCount;

      if (userVote === voteValue) {
        // Remove vote - vote_count decreases by 1
        const { error } = await supabase
          .from('collection_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('collection_id', collection.id);

        if (error) throw error;
        
        setUserVote(null);
        newVoteCount -= 1;  // Always decrement by 1 when removing a vote
        toast.success('Oyunuz kaldırıldı');
      } else {
        // Update or Insert vote
        if (userVote !== null) {
           // Changing vote (e.g. from upvote to downvote)
           // vote_count stays the SAME - only the value changes, not the count
           
           const { error } = await (supabase
            .from('collection_votes') as any)
            .update({ value: voteValue })
            .eq('user_id', user.id)
            .eq('collection_id', collection.id);

           if (error) throw error;
        } else {
           // New vote - vote_count increases by 1
           newVoteCount += 1;  // Always increment by 1 for new vote

           const { error } = await (supabase
            .from('collection_votes') as any)
            .insert([{ user_id: user.id, collection_id: collection.id, value: voteValue }]);

           if (error) throw error;
        }

        setUserVote(voteValue);
        toast.success(voteType === 'up' ? 'Beğendiniz!' : 'Beğenmediniz');
      }
      
      setVoteCount(newVoteCount);
      router.refresh();

    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(`Oy kullanılırken bir hata oluştu: ${error.message || error}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <ScrollReveal direction="down">
        <div className="border-b border-neutral-200 bg-white pb-8 pt-6 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="container mx-auto px-4">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-orange-600 dark:text-neutral-400 dark:hover:text-orange-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfaya Dön
            </Link>

            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400">
                    {collection.category?.names?.tr || 'Kategori'}
                  </Badge>
                  {collection.location && (
                    <Badge variant="outline" className="border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                      <MapPin className="mr-1 h-3 w-3" />
                      {collection.location.names.tr}
                    </Badge>
                  )}
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-neutral-50">
                    {collection.names?.tr}
                  </h1>
                  {collection.descriptions?.tr && (
                    <p className="mt-3 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                      {collection.descriptions.tr}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">
                      {collection.creator?.username || 'Anonim'}
                    </span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(collection.created_at)}</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  
                  {/* Voting Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${
                        userVote === 1 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                          : 'hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400'
                      }`}
                      onClick={() => handleVote('up')}
                    >
                      <ThumbsUp className={`h-4 w-4 ${userVote === 1 ? 'fill-current' : ''}`} />
                    </Button>
                    <span className="min-w-[2ch] text-center font-medium">
                      {voteCount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 ${
                        userVote === -1 
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                          : 'hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                      }`}
                      onClick={() => handleVote('down')}
                    >
                      <ThumbsDown className={`h-4 w-4 ${userVote === -1 ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-orange-50 px-6 py-4 dark:bg-orange-900/10">
                <span className="text-4xl font-bold text-orange-600 dark:text-orange-500">
                  {collection.places?.length || 0}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Mekan</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Listelendi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Places List */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl space-y-6">
            {collection.places?.map((item: CollectionPlace, index: number) => {
              const place = item.place;
              if (!place) return null;

              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                place.address || place.names?.tr || ''
              )}`;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  {/* Rank Badge - Absolute Positioned */}
                  <div className={`absolute -left-3 -top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold shadow-lg ring-4 ring-white dark:ring-neutral-950 ${getRankBadgeColor(index + 1)}`}>
                    {index + 1}
                  </div>

                  <Card className="overflow-hidden border-neutral-200 transition-all hover:border-orange-200 hover:shadow-xl dark:border-neutral-800 dark:hover:border-orange-900/50 dark:hover:shadow-orange-900/10">
                    <div className="flex flex-col">
                      {/* Content Section */}
                      <CardContent className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link href={`/mekanlar/${place.slug}?from=/koleksiyonlar/${collection.slug}`} className="group/title">
                                <h3 className="text-xl font-bold text-neutral-900 transition-colors group-hover/title:text-orange-600 dark:text-neutral-50 dark:group-hover/title:text-orange-400">
                                  {place.names?.tr}
                                </h3>
                              </Link>
                              <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                  {place.category?.names?.tr}
                                </span>
                                <span>•</span>
                                <span className="truncate">{place.address}</span>
                              </div>
                            </div>
                          </div>

                          {/* Famous Items */}
                          {item.famous_items && item.famous_items.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                Öne Çıkan Lezzetler
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {item.famous_items.map((food, i) => (
                                  <Badge 
                                    key={i} 
                                    variant="secondary" 
                                    className="bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                  >
                                    {food}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Curator Note */}
                          {item.curator_note && (
                            <div className="rounded-xl bg-orange-50/50 p-3 text-sm text-neutral-600 dark:bg-orange-900/10 dark:text-neutral-400">
                              <span className="mr-1 font-semibold text-orange-700 dark:text-orange-400">Küratör Notu:</span>
                              {item.curator_note}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                          <Button 
                            asChild 
                            variant="default" 
                            className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                          >
                            <Link href={`/mekanlar/${place.slug}?from=/koleksiyonlar/${collection.slug}`}>
                              Mekanı İncele
                              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                            </Link>
                          </Button>
                          
                          <Button 
                            asChild 
                            variant="outline" 
                            className="flex-1 border-neutral-200 hover:bg-neutral-50 hover:text-orange-600 dark:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-orange-400"
                          >
                            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                              <Navigation className="mr-2 h-4 w-4" />
                              Haritada Gör
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
        </div>

        {/* Empty State */}
        {(!collection.places || collection.places.length === 0) && (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-200 bg-white py-24 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <MapPin className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Henüz Mekan Eklenmemiş</h3>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              Bu koleksiyonda henüz mekan bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
