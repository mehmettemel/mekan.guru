'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, X, GripVertical, Utensils } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AddPlaceDialog } from './add-place-dialog';

interface EditCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
  collection?: any;
}

function SortablePlaceRow({ place, onRemove, onUpdateItems }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: place.id });

  const [items, setItems] = useState<string[]>(place.recommended_items || []);
  const [newItem, setNewItem] = useState('');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      const updatedItems = [...items, newItem.trim()];
      setItems(updatedItems);
      onUpdateItems(place.id, updatedItems);
      setNewItem('');
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    const updatedItems = items.filter(item => item !== itemToRemove);
    setItems(updatedItems);
    onUpdateItems(place.id, updatedItems);
  };

  const names = place.place?.names || place.names;

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex cursor-grab items-start pt-1 text-neutral-400 hover:text-neutral-600 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Place Name */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-50">
              {names?.tr || 'Unknown Place'}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Recommended Items Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Utensils className="h-4 w-4" />
              <span>Önerilen Yemekler / Ürünler:</span>
            </div>

            {/* Items Display */}
            {items.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                  <span
                    key={idx}
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
                  </span>
                ))}
              </div>
            )}

            {/* Add Item Input */}
            <div className="flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
                placeholder="Yemek/ürün ekle..."
                className="h-9 text-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddItem}
                disabled={!newItem.trim()}
                className="h-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditCollectionModal({
  open,
  onOpenChange,
  onSuccess,
  userId,
  collection,
}: EditCollectionModalProps) {
  const supabase = createClient();
  const isEdit = !!collection;

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [locationId, setLocationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('');

  // Places state
  const [places, setPlaces] = useState<any[]>([]);
  const [addPlaceDialogOpen, setAddPlaceDialogOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  // Load data
  useEffect(() => {
    if (open) {
      fetchLocations();
      fetchCategories();
      if (isEdit) {
        loadCollectionData();
      }
    }
  }, [open, collection]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      const selectedCategory = categories.find((cat) => cat.id === categoryId);
      if (selectedCategory) {
        setSelectedCategorySlug(selectedCategory.slug);
        if (selectedCategory.slug === 'yemek') {
          fetchSubcategories(categoryId);
        } else {
          setSubcategories([]);
          setSubcategoryId('');
        }
      }
    }
  }, [categoryId, categories]);

  const loadCollectionData = async () => {
    setName(collection.names?.tr || '');
    setDescription(collection.descriptions?.tr || '');
    setLocationId(collection.location_id || '');
    setCategoryId(collection.category_id || '');
    setSubcategoryId(collection.subcategory_id || '');

    // Fetch places
    const { data: placesData } = await supabase
      .from('collection_places')
      .select(`
        *,
        place:places(id, slug, names, images)
      `)
      .eq('collection_id', collection.id)
      .order('display_order', { ascending: true });

    setPlaces(placesData || []);
  };

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, slug, names')
      .eq('type', 'city')
      .order('names->tr');

    setLocations(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, slug, names')
      .is('parent_id', null)
      .order('display_order');

    setCategories(data || []);
  };

  const fetchSubcategories = async (parentId: string) => {
    const { data } = await supabase
      .from('categories')
      .select('id, slug, names')
      .eq('parent_id', parentId)
      .order('display_order');

    setSubcategories(data || []);
  };

  const generateSlug = (name: string) => {
    const turkishMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'c', 'Ğ': 'g', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };

    return name
      .split('')
      .map(char => turkishMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = places.findIndex((p) => p.id === active.id);
    const newIndex = places.findIndex((p) => p.id === over.id);

    setPlaces(arrayMove(places, oldIndex, newIndex));
  };

  const handleUpdateItems = (placeId: string, items: string[]) => {
    setPlaces(places.map(p =>
      p.id === placeId ? { ...p, recommended_items: items } : p
    ));
  };

  const handleRemovePlace = (placeId: string) => {
    setPlaces(places.filter(p => p.id !== placeId));
  };

  const handlePlaceAdded = (newPlace: any) => {
    setPlaces([...places, newPlace]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !locationId || !categoryId) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    if (selectedCategorySlug === 'yemek' && !subcategoryId) {
      alert('Yemek kategorisi için lütfen bir alt kategori seçin');
      return;
    }

    setLoading(true);

    try {
      const slug = isEdit ? collection.slug : generateSlug(name) + '-' + Math.random().toString(36).substring(2, 6);

      const collectionData = {
        slug: isEdit ? collection.slug : slug,
        names: { tr: name, en: name },
        descriptions: { tr: description, en: description },
        creator_id: userId,
        location_id: locationId,
        category_id: categoryId,
        subcategory_id: subcategoryId || null,
        status: 'active',
      };

      let collectionId = collection?.id;

      if (isEdit) {
        // Update collection
        const { slug: _, ...updateData } = collectionData;
        const { error } = await supabase
          .from('collections')
          .update(updateData)
          .eq('id', collection.id);

        if (error) throw error;

        // Update places
        // First delete all existing places
        await supabase
          .from('collection_places')
          .delete()
          .eq('collection_id', collection.id);

        // Then insert updated places
        if (places.length > 0) {
          const placesData = places.map((p, index) => ({
            collection_id: collection.id,
            place_id: p.place_id || p.place.id,
            display_order: index,
            recommended_items: p.recommended_items || null,
            curator_note: p.curator_note || null,
          }));

          const { error: placesError } = await supabase
            .from('collection_places')
            .insert(placesData);

          if (placesError) throw placesError;
        }
      } else {
        // Create collection
        const { data, error } = await supabase
          .from('collections')
          .insert([collectionData])
          .select()
          .single();

        if (error) throw error;
        collectionId = data.id;

        // Add places if any
        if (places.length > 0) {
          const placesData = places.map((p, index) => ({
            collection_id: collectionId,
            place_id: p.place_id || p.place.id,
            display_order: index,
            recommended_items: p.recommended_items || null,
            curator_note: p.curator_note || null,
          }));

          const { error: placesError } = await supabase
            .from('collection_places')
            .insert(placesData);

          if (placesError) throw placesError;
        }
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving collection:', error);
      alert(error.message || 'Koleksiyon kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setLocationId('');
    setCategoryId('');
    setSubcategoryId('');
    setPlaces([]);
    setSelectedCategorySlug('');
    setSubcategories([]);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[95vh] w-full max-w-7xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Koleksiyonu Düzenle' : 'Yeni Koleksiyon'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Koleksiyon Adı <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="İstanbul'daki En İyi Kahve Dükkanları"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Şehirdeki favori kahve mekanlarım..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Şehir <span className="text-red-500">*</span>
                  </Label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şehir seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.names.tr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Kategori <span className="text-red-500">*</span>
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.names.tr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedCategorySlug === 'yemek' && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">
                    Yemek Türü <span className="text-red-500">*</span>
                  </Label>
                  <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Yemek türü seç" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.names.tr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Places Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Mekanlar</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddPlaceDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Mekan Ekle
                </Button>
              </div>

              {places.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Henüz mekan eklenmedi. Yukarıdaki butona tıklayarak mekan ekle.
                  </p>
                </div>
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
                    <div className="space-y-3">
                      {places.map((place) => (
                        <SortablePlaceRow
                          key={place.id}
                          place={place}
                          onRemove={() => handleRemovePlace(place.id)}
                          onUpdateItems={handleUpdateItems}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Place Dialog */}
      <AddPlaceDialog
        open={addPlaceDialogOpen}
        onOpenChange={setAddPlaceDialogOpen}
        collectionId={collection?.id || 'temp'}
        existingPlaceIds={places.map(p => p.place_id || p.place?.id)}
        onPlaceAdded={handlePlaceAdded}
      />
    </>
  );
}
