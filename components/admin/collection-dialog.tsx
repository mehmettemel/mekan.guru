'use client';

import { useState, useEffect } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';

type Collection = Database['public']['Tables']['collections']['Row'];

interface CollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: Collection & {
    creator?: { id: string; username: string };
  };
}

export function CollectionDialog({
  isOpen,
  onClose,
  collection,
}: CollectionDialogProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const isEditMode = !!collection;

  const [formData, setFormData] = useState({
    slug: '',
    nameEn: '',
    nameTr: '',
    descriptionEn: '',
    descriptionTr: '',
    locationId: '',
    categoryId: '',
    subcategoryId: '',
    creatorId: '',
    status: 'active' as 'active' | 'archived' | 'flagged',
    tags: '',
    isFeatured: false,
  });

  // Fetch locations
  const { data: locations } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('type', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch main categories
  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .is('parent_id', null)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch subcategories based on selected category
  const { data: subcategories } = useQuery({
    queryKey: ['admin-subcategories', formData.categoryId],
    queryFn: async () => {
      if (!formData.categoryId) return [];
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', formData.categoryId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!formData.categoryId,
  });

  // Get selected category slug
  const selectedCategory = categories?.find((cat) => cat.id === formData.categoryId);
  const selectedCategorySlug = selectedCategory?.slug || '';

  // Fetch users for creator selection
  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .order('username', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (collection) {
      const names = collection.names as { en: string; tr: string };
      const descriptions = collection.descriptions as
        | { en: string; tr: string }
        | null;

      setFormData({
        slug: collection.slug || '',
        nameEn: names?.en || '',
        nameTr: names?.tr || '',
        descriptionEn: descriptions?.en || '',
        descriptionTr: descriptions?.tr || '',
        locationId: collection.location_id || '',
        categoryId: collection.category_id || '',
        subcategoryId: collection.subcategory_id || '',
        creatorId: collection.creator_id || '',
        status: collection.status || 'active',
        tags: collection.tags?.join(', ') || '',
        isFeatured: collection.is_featured || false,
      });
    } else {
      setFormData({
        slug: '',
        nameEn: '',
        nameTr: '',
        descriptionEn: '',
        descriptionTr: '',
        locationId: '',
        categoryId: '',
        subcategoryId: '',
        creatorId: '',
        status: 'active',
        tags: '',
        isFeatured: false,
      });
    }
  }, [collection]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const collectionData = {
        slug: formData.slug,
        names: {
          en: formData.nameEn,
          tr: formData.nameTr,
        },
        descriptions: {
          en: formData.descriptionEn,
          tr: formData.descriptionTr,
        },
        location_id: formData.locationId,
        category_id: formData.categoryId,
        subcategory_id: formData.subcategoryId || null,
        creator_id: formData.creatorId,
        status: formData.status,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim())
          : null,
        is_featured: formData.isFeatured,
      };

      if (isEditMode && collection) {
        const { error } = await supabase
          .from('collections')
          .update(collectionData)
          .eq('id', collection.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collections')
          .insert([collectionData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      onClose();
    },
    onError: (error) => {
      console.error('Error saving collection:', error);
      alert('Failed to save collection. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate subcategory is selected for "Yemek" category
    if (selectedCategorySlug === 'yemek' && !formData.subcategoryId) {
      alert('Please select a food type subcategory for Yemek category');
      return;
    }

    saveMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Collection' : 'Create Collection'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              placeholder="adana-best-kebab-places"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nameEn">Name (English)</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                placeholder="Best Kebab Places in Adana"
                required
              />
            </div>

            <div>
              <Label htmlFor="nameTr">Name (Turkish)</Label>
              <Input
                id="nameTr"
                value={formData.nameTr}
                onChange={(e) =>
                  setFormData({ ...formData, nameTr: e.target.value })
                }
                placeholder="Adana'daki En İyi Kebapçılar"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="descriptionEn">Description (English)</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                placeholder="My favorite kebab places in Adana..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="descriptionTr">Description (Turkish)</Label>
              <Textarea
                id="descriptionTr"
                value={formData.descriptionTr}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionTr: e.target.value })
                }
                placeholder="Adana'daki en sevdiğim kebapçılar..."
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="locationId">Location</Label>
              <Select
                value={formData.locationId}
                onValueChange={(value) =>
                  setFormData({ ...formData, locationId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map((location) => {
                    const names = location.names as { en: string; tr: string };
                    return (
                      <SelectItem key={location.id} value={location.id}>
                        {names.en} ({location.type})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => {
                    const names = category.names as { en: string; tr: string };
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        {names.en}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subcategory - Show only if "Yemek" is selected and has subcategories */}
          {selectedCategorySlug === 'yemek' && subcategories && subcategories.length > 0 && (
            <div>
              <Label htmlFor="subcategoryId">
                Subcategory (Food Type) <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.subcategoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, subcategoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select food type" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories?.map((subcategory) => {
                    const names = subcategory.names as { en: string; tr: string };
                    return (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.icon} {names.en}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="creatorId">Creator</Label>
            <Select
              value={formData.creatorId}
              onValueChange={(value) =>
                setFormData({ ...formData, creatorId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select creator" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'archived' | 'flagged') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Featured Collection</span>
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">
              Tags (comma-separated)
              <span className="text-xs text-muted-foreground ml-2">
                e.g., budget-friendly, romantic, late-night
              </span>
            </Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="budget-friendly, romantic, late-night"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending
                ? 'Saving...'
                : isEditMode
                  ? 'Update'
                  : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
