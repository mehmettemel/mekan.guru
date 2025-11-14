'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AddPlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  existingPlaceIds: string[];
  onPlaceAdded: (place: any) => void;
}

export function AddPlaceDialog({
  open,
  onOpenChange,
  collectionId,
  existingPlaceIds,
  onPlaceAdded,
}: AddPlaceDialogProps) {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [curatorNote, setCuratorNote] = useState('');

  useEffect(() => {
    if (open) {
      searchPlaces();
    }
  }, [open]);

  const searchPlaces = async (query?: string) => {
    setSearching(true);
    try {
      let queryBuilder = supabase
        .from('places')
        .select('id, slug, names, descriptions, address, images')
        .eq('status', 'approved')
        .order('vote_count', { ascending: false })
        .limit(20);

      // Exclude already added places
      if (existingPlaceIds.length > 0) {
        queryBuilder = queryBuilder.not('id', 'in', `(${existingPlaceIds.join(',')})`);
      }

      // Search by name if query provided
      if (query) {
        queryBuilder = queryBuilder.or(
          `names->>en.ilike.%${query}%,names->>tr.ilike.%${query}%`
        );
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      setPlaces(data || []);
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = () => {
    searchPlaces(searchQuery);
  };

  const handleAdd = async () => {
    if (!selectedPlace) return;

    setLoading(true);
    try {
      // Get max display order
      const { data: maxOrderData } = await supabase
        .from('collection_places')
        .select('display_order')
        .eq('collection_id', collectionId)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrderData?.display_order || -1) + 1;

      // Add place to collection
      const { data, error } = await supabase
        .from('collection_places')
        .insert({
          collection_id: collectionId,
          place_id: selectedPlace.id,
          display_order: nextOrder,
          curator_note: curatorNote || null,
        })
        .select(`
          *,
          place:places(id, slug, names, descriptions, address, images, vote_count)
        `)
        .single();

      if (error) throw error;

      onPlaceAdded(data);
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error adding place:', error);
      alert(error.message || 'Failed to add place');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSelectedPlace(null);
    setCuratorNote('');
    searchPlaces();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Koleksiyona Mekan Ekle</DialogTitle>
          <DialogDescription>
            Koleksiyonuna eklemek istediğin mekanı ara ve seç
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Mekan ara..."
              />
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Places List */}
          <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
            {searching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
              </div>
            ) : places.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
                Mekan bulunamadı
              </div>
            ) : (
              places.map((place) => (
                <button
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedPlace?.id === place.id
                      ? 'border-primary bg-primary/5'
                      : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex gap-3">
                    {place.images && place.images.length > 0 && (
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={place.images[0]}
                          alt={place.names.en}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-50">
                        {place.names.en}
                      </h4>
                      {place.descriptions?.en && (
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                          {place.descriptions.en}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Curator Note */}
          {selectedPlace && (
            <div className="space-y-2">
              <Label htmlFor="curator-note">Notun (Opsiyonel)</Label>
              <Textarea
                id="curator-note"
                value={curatorNote}
                onChange={(e) => setCuratorNote(e.target.value)}
                placeholder="Bu mekanı neden tavsiye ettiğin hakkında kişisel notunu ekle..."
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            İptal
          </Button>
          <Button onClick={handleAdd} disabled={!selectedPlace || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mekan Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
