import { z } from 'zod';

/**
 * Collection Form Validation Schema
 * Used for creating and editing collections
 */
export const collectionFormSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(3, 'Koleksiyon adı en az 3 karakter olmalı')
    .max(100, 'Koleksiyon adı en fazla 100 karakter olabilir'),

  locationId: z
    .string()
    .uuid('Geçerli bir şehir seçin'),

  categoryId: z
    .string()
    .uuid('Geçerli bir kategori seçin'),

  // Optional fields
  description: z
    .string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional()
    .or(z.literal('')),

  subcategoryId: z
    .string()
    .uuid()
    .optional()
    .nullable(),

  tags: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type CollectionFormValues = z.infer<typeof collectionFormSchema>;

/**
 * Parse tags from comma-separated string
 */
export function parseTags(tagsString: string): string[] {
  if (!tagsString) return [];
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Format tags array to comma-separated string
 */
export function formatTags(tags: string[]): string {
  return tags.join(', ');
}
