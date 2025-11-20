// @ts-nocheck
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Loader2, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useMainCategories, useSubcategories } from '@/lib/hooks/use-categories';
import { useCities } from '@/lib/hooks/use-locations';
import {
  collectionFormSchema,
  type CollectionFormValues,
  parseTags,
  formatTags,
} from '@/lib/validations/collection';

interface CollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
  collection?: any;
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

  // TanStack Query hooks
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: mainCategories = [], isLoading: categoriesLoading } =
    useMainCategories();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      locationId: '',
      categoryId: '',
      subcategoryId: '',
      tags: '',
    },
  });

  // Watch category to fetch subcategories
  const selectedCategoryId = watch('categoryId');
  const { data: subcategories = [] } = useSubcategories(selectedCategoryId);

  // Load existing collection data for editing
  useEffect(() => {
    if (collection && open) {
      reset({
        name: collection.names?.tr || '',
        description: collection.descriptions?.tr || '',
        locationId: collection.location_id || '',
        categoryId: collection.category_id || '',
        subcategoryId: collection.subcategory_id || '',
        tags: formatTags(collection.tags || []),
      });
    } else if (!open) {
      reset();
    }
  }, [collection, open, reset]);

  // Clear subcategory when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      setValue('subcategoryId', '');
    }
  }, [selectedCategoryId, setValue]);

  // Generate slug helper
  const generateSlug = (name: string) => {
    const turkishMap: Record<string, string> = {
      ç: 'c',
      ğ: 'g',
      ı: 'i',
      İ: 'i',
      ö: 'o',
      ş: 's',
      ü: 'u',
      Ç: 'c',
      Ğ: 'g',
      Ö: 'o',
      Ş: 's',
      Ü: 'u',
    };

    return name
      .split('')
      .map((char) => turkishMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Form submit handler
  const onSubmit = async (data: CollectionFormValues) => {
    try {
      const slug = isEdit
        ? collection.slug
        : generateSlug(data.name) +
          '-' +
          Math.random().toString(36).substring(2, 6);

      const collectionData = {
        slug,
        names: { tr: data.name, en: data.name },
        descriptions: { tr: data.description || '', en: data.description || '' },
        creator_id: userId,
        location_id: data.locationId,
        category_id: data.categoryId,
        subcategory_id: data.subcategoryId || null,
        tags: parseTags(data.tags || ''),
        status: 'active',
      };

      if (isEdit) {
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
      reset();
    } catch (error: any) {
      console.error('Error saving collection:', error);
      alert(error.message || 'Koleksiyon kaydedilemedi');
    }
  };

  const hasSubcategories = subcategories.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] w-full overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? 'Koleksiyonu Düzenle' : 'Yeni Koleksiyon Oluştur'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isEdit
              ? 'Koleksiyon bilgilerini güncelleyin'
              : 'Favori mekanlarınızdan yeni bir koleksiyon oluşturun'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Grid layout for responsive form */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Collection Name */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name" className="text-base font-semibold">
                Koleksiyon Adı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Örn: İstanbul'daki En İyi Kahve Dükkanları"
                className="h-11 text-base"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                URL otomatik oluşturulacak
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description" className="text-base font-semibold">
                Açıklama
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Koleksiyonunuz hakkında kısa bir açıklama yazın..."
                className="min-h-[100px] resize-none text-base"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* City Selection */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base font-semibold">
                Şehir <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('locationId')}
                onValueChange={(value) => setValue('locationId', value)}
                disabled={isSubmitting || citiesLoading}
              >
                <SelectTrigger className="h-11 text-base">
                  <SelectValue placeholder="Şehir seçin" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.names.tr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.locationId && (
                <p className="text-sm text-red-500">
                  {errors.locationId.message}
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-base font-semibold">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('categoryId')}
                onValueChange={(value) => setValue('categoryId', value)}
                disabled={isSubmitting || categoriesLoading}
              >
                <SelectTrigger className="h-11 text-base">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.names.tr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Subcategory Selection - Only show if category has subcategories */}
            {hasSubcategories && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="subcategory" className="text-base font-semibold">
                  Alt Kategori <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('subcategoryId') || ''}
                  onValueChange={(value) => setValue('subcategoryId', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Alt kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.names.tr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subcategoryId && (
                  <p className="text-sm text-red-500">
                    {errors.subcategoryId.message}
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                  Bu koleksiyondaki mekanların türünü belirtin
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tags" className="text-base font-semibold">
                Etiketler
              </Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="kahve, kahvaltı, samimi (virgülle ayırın)"
                className="h-11 text-base"
                disabled={isSubmitting}
              />
              {errors.tags && (
                <p className="text-sm text-red-500">{errors.tags.message}</p>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5" />
                Birden fazla etiket için virgül kullanın
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-11 text-base"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 text-base"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
