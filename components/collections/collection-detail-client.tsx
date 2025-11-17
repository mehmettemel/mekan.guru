'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, MapPin, User, Star, Loader2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortablePlaceItem } from '@/components/collections/sortable-place-item';
import { AddPlaceDialog } from '@/components/collections/add-place-dialog';

interface CollectionDetailClientProps {
  collection: any;
  initialPlaces: any[];
}

export function CollectionDetailClient({ collection, initialPlaces }: CollectionDetailClientProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const locale = 'tr'; // Turkish as primary language

  const [places, setPlaces] = useState(initialPlaces);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOwner = user?.id === collection.creator_id;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = places.findIndex((p) => p.id === active.id);
    const newIndex = places.findIndex((p) => p.id === over.id);

    const newPlaces = arrayMove(places, oldIndex, newIndex);
    setPlaces(newPlaces);

    // Update display order in database
    if (isOwner) {
      setSaving(true);
      try {
        const updates = newPlaces.map((place, index) => ({
          place_id: place.place_id,
          display_order: index,
        }));

        // Update each place's order
        await Promise.all(
          updates.map(({ place_id, display_order }) =>
            supabase
              .from('collection_places')
              .update({ display_order })
              .eq('collection_id', collection.id)
              .eq('place_id', place_id)
          )
        );
      } catch (error) {
        console.error('Error updating order:', error);
        // Revert on error
        setPlaces(initialPlaces);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRemovePlace = async (placeId: string) => {
    if (!isOwner) return;
    if (!confirm('Remove this place from the collection?')) return;

    try {
      const { error } = await supabase
        .from('collection_places')
        .delete()
        .eq('collection_id', collection.id)
        .eq('place_id', placeId);

      if (error) throw error;

      setPlaces(places.filter((p) => p.place_id !== placeId));
    } catch (error) {
      console.error('Error removing place:', error);
      alert('Failed to remove place');
    }
  };

  const handlePlaceAdded = (newPlace: any) => {
    setPlaces([...places, newPlace]);
  };

  return (
    <div className="container max-w-6xl space-y-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
          {collection.names[locale as 'en' | 'tr']}
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {collection.descriptions[locale as 'en' | 'tr']}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>by {collection.creator?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{collection.location?.names[locale as 'en' | 'tr']}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>{collection.vote_count} votes</span>
          </div>
        </div>

        {collection.tags && collection.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {collection.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {isOwner && (
        <div className="flex items-center gap-3">
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Mekan Ekle
          </Button>
          {saving && (
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sıralama kaydediliyor...
            </div>
          )}
        </div>
      )}

      {/* Places List */}
      {places.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              Henüz mekan yok
            </h3>
            <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {isOwner
                ? 'Bu koleksiyona ilk mekanını ekle'
                : 'Bu koleksiyon boş'}
            </p>
            {isOwner && (
              <Button onClick={() => setAddDialogOpen(true)} className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Mekan Ekle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={places.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {places.map((collectionPlace, index) => (
                <SortablePlaceItem
                  key={collectionPlace.id}
                  id={collectionPlace.id}
                  place={collectionPlace.place}
                  curatorNote={collectionPlace.curator_note}
                  index={index}
                  isOwner={isOwner}
                  onRemove={() => handleRemovePlace(collectionPlace.place_id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Place Dialog */}
      {isOwner && (
        <AddPlaceDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          collectionId={collection.id}
          existingPlaceIds={places.map((p) => p.place_id)}
          onPlaceAdded={handlePlaceAdded}
        />
      )}
    </div>
  );
}
