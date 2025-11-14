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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface CollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
  collection?: any; // For editing
}

export function CollectionDialog({
  open,
  onOpenChange,
  onSuccess,
  userId,
  collection,
}: CollectionDialogProps) {
  const supabase = createClient();
  const isEdit = !!collection;

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [locationId, setLocationId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');

  // Load form data when editing
  useEffect(() => {
    if (collection) {
      setName(collection.names?.tr || '');
      setDescription(collection.descriptions?.tr || '');
      setLocationId(collection.location_id || '');
      setCategoryId(collection.category_id || '');
      setTags(collection.tags?.join(', ') || '');
    }
  }, [collection]);

  // Fetch locations and categories
  useEffect(() => {
    if (open) {
      fetchLocations();
      fetchCategories();
    }
  }, [open]);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, slug, names')
      .eq('type', 'city')
      .order('names->en');

    setLocations(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, slug, names')
      .is('parent_id', null)
      .order('names->en');

    setCategories(data || []);
  };

  const generateSlug = (name: string) => {
    // Turkish character replacements
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !locationId || !categoryId) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      // Generate slug from Turkish name
      const slug = generateSlug(name) + '-' + Math.random().toString(36).substring(2, 6);

      const collectionData = {
        slug: isEdit ? collection.slug : slug,
        names: { tr: name, en: name }, // Same for both, searchable in both languages
        descriptions: { tr: description, en: description },
        creator_id: userId,
        location_id: locationId,
        category_id: categoryId,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        status: 'active',
      };

      if (isEdit) {
        // Don't update slug when editing
        const { slug: _, ...updateData } = collectionData;
        const { error } = await supabase
          .from('collections')
          .update(updateData)
          .eq('id', collection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collections')
          .insert([collectionData]);

        if (error) throw error;
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
    setTags('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Koleksiyonu Düzenle' : 'Yeni Koleksiyon'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Koleksiyon bilgilerini güncelle'
              : 'Favori mekanlarından yeni bir koleksiyon oluştur'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Koleksiyon Adı <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="İstanbul'daki En İyi Kahve Dükkanları"
              disabled={loading}
              required
            />
            <p className="text-xs text-neutral-500">
              URL otomatik oluşturulacak
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Şehirdeki favori kahve mekanlarım..."
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              Şehir <span className="text-red-500">*</span>
            </Label>
            <Select value={locationId} onValueChange={setLocationId} disabled={loading}>
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

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Kategori <span className="text-red-500">*</span>
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={loading}>
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

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Etiketler</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="kahve, kahvaltı, samimi (virgülle ayır)"
              disabled={loading}
            />
            <p className="text-xs text-neutral-500">
              Birden fazla etiket için virgül kullanın
            </p>
          </div>

          <DialogFooter>
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
