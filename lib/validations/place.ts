import { z } from 'zod';

/**
 * Place Form Validation Schema
 * Used for creating and editing places
 */
export const placeFormSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(2, 'Mekan adı en az 2 karakter olmalı')
    .max(100, 'Mekan adı en fazla 100 karakter olabilir'),

  address: z
    .string()
    .min(5, 'Adres en az 5 karakter olmalı')
    .max(200, 'Adres en fazla 200 karakter olabilir'),

  locationId: z
    .string()
    .uuid('Geçerli bir şehir seçin'),

  categoryId: z
    .string()
    .uuid('Geçerli bir kategori seçin'),

  // Optional fields
  subcategoryId: z
    .string()
    .uuid()
    .optional()
    .nullable(),

  description: z
    .string()
    .max(500, 'Açıklama en fazla 500 karakter olabilir')
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .regex(/^[0-9+\s()-]*$/, 'Geçerli bir telefon numarası girin')
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url('Geçerli bir URL girin')
    .optional()
    .or(z.literal('')),

  googleMapsUrl: z
    .string()
    .url('Geçerli bir Google Maps URL girin')
    .optional()
    .or(z.literal('')),

  instagramHandle: z
    .string()
    .regex(/^@?[a-zA-Z0-9._]+$/, 'Geçerli bir Instagram kullanıcı adı girin')
    .optional()
    .or(z.literal('')),
});

export type PlaceFormValues = z.infer<typeof placeFormSchema>;

/**
 * Place Search Schema
 * Used for searching existing places
 */
export const placeSearchSchema = z.object({
  query: z.string().min(1, 'Arama terimi girin'),
  locationId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});

export type PlaceSearchValues = z.infer<typeof placeSearchSchema>;
