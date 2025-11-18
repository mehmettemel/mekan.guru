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
import { Loader2, Search, Plus, X } from 'lucide-react';
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
  const [recommendedItems, setRecommendedItems] = useState<string[]>([]);
  const [newItemInput, setNewItemInput] = useState('');

  // New place creation mode
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [similarPlaces, setSimilarPlaces] = useState<any[]>([]);

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

  // Check for similar places when user wants to create new
  const checkSimilarPlaces = async (name: string) => {
    if (!name || name.length < 3) {
      setSimilarPlaces([]);
      return;
    }

    try {
      // Search for similar names using case-insensitive match
      const { data, error } = await supabase
        .from('places')
        .select('id, slug, names, address')
        .or(`names->>tr.ilike.%${name}%,names->>en.ilike.%${name}%`)
        .eq('status', 'approved')
        .limit(5);

      if (error) throw error;
      setSimilarPlaces(data || []);
    } catch (error) {
      console.error('Error checking similar places:', error);
      setSimilarPlaces([]);
    }
  };

  const handleCreateNewPlace = async () => {
    if (!newPlaceName.trim()) {
      alert('Lütfen mekan adını girin');
      return;
    }

    setLoading(true);
    try {
      // Generate slug for the new place
      const turkishMap: { [key: string]: string } = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
      };

      const slug = newPlaceName
        .split('')
        .map(char => turkishMap[char] || char)
        .join('')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Math.random().toString(36).substring(2, 6);

      // Create the place (status will be 'approved' for MVP simplicity)
      const { data: newPlace, error: placeError } = await supabase
        .from('places')
        .insert({
          slug,
          names: { tr: newPlaceName.trim(), en: newPlaceName.trim() },
          descriptions: { tr: '', en: '' },
          address: newPlaceAddress.trim() || null,
          status: 'approved', // Auto-approve for MVP
          vote_count: 0,
          vote_score: 0,
        })
        .select('id, slug, names, descriptions, address, images')
        .single();

      if (placeError) throw placeError;

      // Now add this place to the collection
      const { data: maxOrderData } = await supabase
        .from('collection_places')
        .select('display_order')
        .eq('collection_id', collectionId)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      const nextOrder = (maxOrderData?.display_order || -1) + 1;

      const { data: collectionPlace, error: cpError } = await supabase
        .from('collection_places')
        .insert({
          collection_id: collectionId,
          place_id: newPlace.id,
          display_order: nextOrder,
          curator_note: curatorNote || null,
          recommended_items: recommendedItems.length > 0 ? recommendedItems : null,
        })
        .select(`
          *,
          place:places(id, slug, names, descriptions, address, images, vote_count)
        `)
        .single();

      if (cpError) throw cpError;

      onPlaceAdded(collectionPlace);
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating place:', error);
      alert(error.message || 'Mekan oluşturulamadı');
    } finally {
      setLoading(false);
    }
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
          recommended_items: recommendedItems.length > 0 ? recommendedItems : null,
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
    setRecommendedItems([]);
    setNewItemInput('');
    setShowCreateForm(false);
    setNewPlaceName('');
    setNewPlaceAddress('');
    setSimilarPlaces([]);
    searchPlaces();
  };

  const handleAddItem = () => {
    if (newItemInput.trim() && !recommendedItems.includes(newItemInput.trim())) {
      setRecommendedItems([...recommendedItems, newItemInput.trim()]);
      setNewItemInput('');
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setRecommendedItems(recommendedItems.filter((item) => item !== itemToRemove));
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
          {/* Toggle between Search and Create */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={!showCreateForm ? 'default' : 'outline'}
              onClick={() => setShowCreateForm(false)}
              className="flex-1"
            >
              Mevcut Mekanlar
            </Button>
            <Button
              type="button"
              variant={showCreateForm ? 'default' : 'outline'}
              onClick={() => setShowCreateForm(true)}
              className="flex-1"
            >
              Yeni Mekan Oluştur
            </Button>
          </div>

          {!showCreateForm ? (
            <>
              {/* Search Existing */}
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
            </>
          ) : (
            <>
              {/* Create New Place Form */}
              <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="space-y-2">
                  <Label htmlFor="new-place-name">
                    Mekan Adı <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="new-place-name"
                    value={newPlaceName}
                    onChange={(e) => {
                      setNewPlaceName(e.target.value);
                      checkSimilarPlaces(e.target.value);
                    }}
                    placeholder="Örn: Halil Usta Kebap"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-place-address">Adres (Opsiyonel)</Label>
                  <Input
                    id="new-place-address"
                    value={newPlaceAddress}
                    onChange={(e) => setNewPlaceAddress(e.target.value)}
                    placeholder="Örn: Kadıköy, İstanbul"
                  />
                </div>

                {/* Similar Places Warning */}
                {similarPlaces.length > 0 && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-900/50 dark:bg-orange-900/20">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                      ⚠️ Benzer mekanlar bulundu. Aynı mekandan emin misiniz?
                    </p>
                    <div className="mt-2 space-y-1">
                      {similarPlaces.map((place) => (
                        <div
                          key={place.id}
                          className="text-sm text-orange-800 dark:text-orange-300"
                        >
                          • {place.names.tr} {place.address && `(${place.address})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Places List - Only show when searching */}
          {!showCreateForm && (
            <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
              {searching ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
              ) : places.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
                  Mekan bulunamadı. Yeni mekan oluşturmak için yukarıdaki butona tıklayın.
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
                            alt={place.names.tr}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-50">
                          {place.names.tr}
                        </h4>
                        {place.address && (
                          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            {place.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Curator Note and Recommended Items */}
          {(selectedPlace || showCreateForm) && (
            <>
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

              {/* Recommended Items */}
              <div className="space-y-2">
                <Label htmlFor="recommended-items">
                  Önerilen Ürünler / Yemekler (Opsiyonel)
                </Label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Bu mekanda popüler olan yemekleri veya ürünleri ekle
                </p>

                {/* Add Item Input */}
                <div className="flex gap-2">
                  <Input
                    id="recommended-items"
                    value={newItemInput}
                    onChange={(e) => setNewItemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    placeholder="Örn: Adana Kebap, Ayran..."
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddItem}
                    disabled={!newItemInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Items List */}
                {recommendedItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
                    {recommendedItems.map((item, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm dark:bg-orange-900/30"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item)}
                          className="hover:text-red-600 dark:hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            İptal
          </Button>
          {showCreateForm ? (
            <Button onClick={handleCreateNewPlace} disabled={!newPlaceName.trim() || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oluştur ve Ekle
            </Button>
          ) : (
            <Button onClick={handleAdd} disabled={!selectedPlace || loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mekan Ekle
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
