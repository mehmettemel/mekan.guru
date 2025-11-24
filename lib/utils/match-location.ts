import { createClient } from '@/lib/supabase/client';

/**
 * Location matching utilities for Google Places integration
 * Matches Google's city/district information with our database locations
 */

interface ExtractedLocation {
  city?: string;
  district?: string;
}

interface LocationMatch {
  id: string;
  type: 'city' | 'district';
  name: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Turkish character normalization map
 */
const turkishCharMap: { [key: string]: string } = {
  'ç': 'c', 'Ç': 'c',
  'ğ': 'g', 'Ğ': 'g',
  'ı': 'i', 'İ': 'i',
  'ö': 'o', 'Ö': 'o',
  'ş': 's', 'Ş': 's',
  'ü': 'u', 'Ü': 'u',
};

/**
 * Normalize Turkish text for comparison
 */
function normalizeTurkish(text: string): string {
  return text
    .split('')
    .map(char => turkishCharMap[char] || char)
    .join('')
    .toLowerCase()
    .trim();
}

/**
 * Calculate similarity between two strings (simple Levenshtein-like approach)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeTurkish(str1);
  const norm2 = normalizeTurkish(str2);

  if (norm1 === norm2) return 1.0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8;

  // Simple character overlap
  const set1 = new Set(norm1.split(''));
  const set2 = new Set(norm2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Match Google's location data with database locations
 *
 * Strategy:
 * 1. Try exact match first (normalized)
 * 2. Try fuzzy match with high similarity (>0.8)
 * 3. Return best match or null
 *
 * @param extractedLocation Location data from Google Places
 * @returns Matched location ID or null
 */
export async function matchLocationFromGoogle(
  extractedLocation: ExtractedLocation
): Promise<LocationMatch | null> {
  const supabase = createClient();

  try {
    // Fetch all cities and districts from database
    const { data: locations, error } = await supabase
      .from('locations')
      .select('id, type, slug, names')
      .in('type', ['city', 'district']) as any;

    if (error) {
      console.error('Error fetching locations:', error);
      return null;
    }

    if (!locations || locations.length === 0) {
      console.warn('No locations found in database');
      return null;
    }

    let bestMatch: LocationMatch | null = null;
    let highestScore = 0;

    // First, try to match district if available (more specific)
    if (extractedLocation.district) {
      for (const location of locations) {
        if (location.type !== 'district') continue;

        const nameTr = location.names?.tr || '';
        const nameEn = location.names?.en || '';

        // Try exact match
        const normalizedDistrict = normalizeTurkish(extractedLocation.district);
        const normalizedTr = normalizeTurkish(nameTr);
        const normalizedEn = normalizeTurkish(nameEn);

        if (normalizedDistrict === normalizedTr || normalizedDistrict === normalizedEn) {
          return {
            id: location.id,
            type: 'district',
            name: nameTr,
            confidence: 'high',
          };
        }

        // Try fuzzy match
        const scoreTr = calculateSimilarity(extractedLocation.district, nameTr);
        const scoreEn = calculateSimilarity(extractedLocation.district, nameEn);
        const score = Math.max(scoreTr, scoreEn);

        if (score > highestScore) {
          highestScore = score;
          bestMatch = {
            id: location.id,
            type: 'district',
            name: nameTr,
            confidence: score > 0.8 ? 'high' : score > 0.6 ? 'medium' : 'low',
          };
        }
      }

      // If we found a high confidence district match, return it
      if (bestMatch && bestMatch.confidence === 'high') {
        return bestMatch;
      }
    }

    // Try to match city
    if (extractedLocation.city) {
      highestScore = 0;
      let cityMatch: LocationMatch | null = null;

      for (const location of locations) {
        if (location.type !== 'city') continue;

        const nameTr = location.names?.tr || '';
        const nameEn = location.names?.en || '';

        // Try exact match
        const normalizedCity = normalizeTurkish(extractedLocation.city);
        const normalizedTr = normalizeTurkish(nameTr);
        const normalizedEn = normalizeTurkish(nameEn);

        if (normalizedCity === normalizedTr || normalizedCity === normalizedEn) {
          return {
            id: location.id,
            type: 'city',
            name: nameTr,
            confidence: 'high',
          };
        }

        // Try fuzzy match
        const scoreTr = calculateSimilarity(extractedLocation.city, nameTr);
        const scoreEn = calculateSimilarity(extractedLocation.city, nameEn);
        const score = Math.max(scoreTr, scoreEn);

        if (score > highestScore) {
          highestScore = score;
          cityMatch = {
            id: location.id,
            type: 'city',
            name: nameTr,
            confidence: score > 0.8 ? 'high' : score > 0.6 ? 'medium' : 'low',
          };
        }
      }

      // Return city match if better than district match
      if (cityMatch && (!bestMatch || highestScore > 0.6)) {
        return cityMatch;
      }
    }

    // Return best match found (if any)
    return bestMatch && bestMatch.confidence !== 'low' ? bestMatch : null;

  } catch (error) {
    console.error('Error in matchLocationFromGoogle:', error);
    return null;
  }
}

/**
 * Simpler version: just find a city by name
 * Useful when you already know the city name
 */
export async function findCityByName(cityName: string): Promise<string | null> {
  const supabase = createClient();

  try {
    const normalized = normalizeTurkish(cityName);

    const { data, error } = await supabase
      .from('locations')
      .select('id, names')
      .eq('type', 'city') as any;

    if (error || !data) return null;

    for (const location of data) {
      const nameTr = normalizeTurkish(location.names?.tr || '');
      const nameEn = normalizeTurkish(location.names?.en || '');

      if (nameTr === normalized || nameEn === normalized) {
        return location.id;
      }
    }

    return null;
  } catch (error) {
    console.error('Error in findCityByName:', error);
    return null;
  }
}
