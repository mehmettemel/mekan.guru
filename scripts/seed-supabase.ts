// Polyfill for Node.js < 18
if (typeof globalThis.Headers === 'undefined') {
  globalThis.Headers = class Headers {
    private headers: Map<string, string> = new Map();
    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }
    get(name: string) {
      return this.headers.get(name.toLowerCase()) || null;
    }
    set(name: string, value: string) {
      this.headers.set(name.toLowerCase(), value);
    }
    has(name: string) {
      return this.headers.has(name.toLowerCase());
    }
    delete(name: string) {
      this.headers.delete(name.toLowerCase());
    }
    forEach(callback: (value: string, key: string) => void) {
      this.headers.forEach(callback);
    }
  } as any;
}

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error(
    'SUPABASE_SERVICE_ROLE_KEY:',
    supabaseServiceKey ? 'Found' : 'Missing'
  );
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Insert Categories (skip if exists)
    console.log('📦 Inserting categories...');
    const categoryDefs = [
      {
        slug: 'restaurant',
        names: { en: 'Restaurant', tr: 'Restoran' },
        icon: '🍽️',
        display_order: 1,
      },
      {
        slug: 'cafe',
        names: { en: 'Cafe', tr: 'Kafe' },
        icon: '☕',
        display_order: 2,
      },
      {
        slug: 'bar',
        names: { en: 'Bar & Pub', tr: 'Bar & Pub' },
        icon: '🍺',
        display_order: 3,
      },
    ];

    const categories: any[] = [];
    for (const cat of categoryDefs) {
      const { data: existing } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', cat.slug)
        .single();

      if (existing) {
        categories.push(existing);
        console.log(`  ✅ ${cat.slug} already exists`);
      } else {
        const { data: newCat, error } = await supabase
          .from('categories')
          .insert(cat as any)
          .select()
          .single();
        if (error) throw error;
        categories.push(newCat);
        console.log(`  ✅ ${cat.slug} created`);
      }
    }

    // 2. Insert Turkey (skip if exists)
    console.log('🇹🇷 Inserting Turkey...');
    let { data: turkey } = (await supabase
      .from('locations')
      .select('*')
      .eq('slug', 'turkey')
      .eq('type', 'country')
      .single()) as { data: { id: string } | null };

    if (!turkey) {
      const { data: newTurkey, error: turkeyError } = await supabase
        .from('locations')
        .insert({
          type: 'country',
          slug: 'turkey',
          names: { en: 'Turkey', tr: 'Türkiye' },
          path: '/turkey',
          has_districts: false,
          latitude: 38.9637,
          longitude: 35.2433,
        } as any)
        .select()
        .single();

      if (turkeyError) throw turkeyError;
      turkey = newTurkey;
      console.log('✅ Turkey inserted');
    } else {
      console.log('✅ Turkey already exists');
    }

    if (!turkey) {
      throw new Error('Turkey location not found after insert/check');
    }

    // 3. Insert Cities
    console.log('🏙️ Inserting cities...');
    const cities = [
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'istanbul',
        names: { en: 'Istanbul', tr: 'İstanbul' },
        path: '/turkey/istanbul',
        has_districts: true,
        latitude: 41.0082,
        longitude: 28.9784,
      },
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'ankara',
        names: { en: 'Ankara', tr: 'Ankara' },
        path: '/turkey/ankara',
        has_districts: false,
        latitude: 39.9334,
        longitude: 32.8597,
      },
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'izmir',
        names: { en: 'Izmir', tr: 'İzmir' },
        path: '/turkey/izmir',
        has_districts: false,
        latitude: 38.4237,
        longitude: 27.1428,
      },
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'antalya',
        names: { en: 'Antalya', tr: 'Antalya' },
        path: '/turkey/antalya',
        has_districts: false,
        latitude: 36.8969,
        longitude: 30.7133,
      },
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'bursa',
        names: { en: 'Bursa', tr: 'Bursa' },
        path: '/turkey/bursa',
        has_districts: false,
        latitude: 40.1826,
        longitude: 29.0665,
      },
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'gaziantep',
        names: { en: 'Gaziantep', tr: 'Gaziantep' },
        path: '/turkey/gaziantep',
        has_districts: false,
        latitude: 37.0662,
        longitude: 37.3833,
      },
    ];

    // Check existing cities and insert only new ones
    const existingCities = await supabase
      .from('locations')
      .select('*')
      .eq('type', 'city')
      .in(
        'slug',
        cities.map((c) => c.slug)
      );

    type LocationRow = Database['public']['Tables']['locations']['Row'];

    const existingSlugs = new Set(
      (existingCities.data as LocationRow[] || []).map((c) => c.slug)
    );
    const citiesToInsert = cities.filter((c) => !existingSlugs.has(c.slug));

    let insertedCities: LocationRow[] = (existingCities.data as LocationRow[]) || [];

    if (citiesToInsert.length > 0) {
      const { data: newCities, error: citiesError } = await supabase
        .from('locations')
        .insert(citiesToInsert as any)
        .select();

      if (citiesError) throw citiesError;
      insertedCities = [...insertedCities, ...((newCities as LocationRow[]) || [])];
      console.log(
        `✅ Cities inserted: ${citiesToInsert.length} new, ${existingSlugs.size} already existed`
      );
    } else {
      console.log(`✅ All cities already exist: ${cities.length}`);
      // Fetch all cities to get their IDs
      const { data: allCities } = await supabase
        .from('locations')
        .select('*')
        .eq('type', 'city')
        .in(
          'slug',
          cities.map((c) => c.slug)
        );
      insertedCities = (allCities as LocationRow[]) || [];
    }

    // 4. Insert Istanbul Districts
    const istanbul = insertedCities?.find((c) => c.slug === 'istanbul');
    if (istanbul) {
      console.log('📍 Inserting Istanbul districts...');
      const districts = [
        {
          parent_id: istanbul.id,
          type: 'district' as const,
          slug: 'kadikoy',
          names: { en: 'Kadıköy', tr: 'Kadıköy' },
          path: '/turkey/istanbul/kadikoy',
          has_districts: false,
          latitude: 40.9904,
          longitude: 29.0254,
        },
        {
          parent_id: istanbul.id,
          type: 'district' as const,
          slug: 'besiktas',
          names: { en: 'Beşiktaş', tr: 'Beşiktaş' },
          path: '/turkey/istanbul/besiktas',
          has_districts: false,
          latitude: 41.0422,
          longitude: 29.0092,
        },
        {
          parent_id: istanbul.id,
          type: 'district' as const,
          slug: 'beyoglu',
          names: { en: 'Beyoğlu', tr: 'Beyoğlu' },
          path: '/turkey/istanbul/beyoglu',
          has_districts: false,
          latitude: 41.0351,
          longitude: 28.977,
        },
      ];

      // Check existing districts
      const existingDistricts = await supabase
        .from('locations')
        .select('*')
        .eq('type', 'district')
        .in(
          'slug',
          districts.map((d) => d.slug)
        );

      const existingDistrictSlugs = new Set(
        ((existingDistricts.data as LocationRow[]) || []).map((d) => d.slug)
      );
      const districtsToInsert = districts.filter(
        (d) => !existingDistrictSlugs.has(d.slug)
      );

      let insertedDistricts: LocationRow[] = (existingDistricts.data as LocationRow[]) || [];

      if (districtsToInsert.length > 0) {
        const { data: newDistricts, error: districtsError } = await supabase
          .from('locations')
          .insert(districtsToInsert as any)
          .select();

        if (districtsError) throw districtsError;
        insertedDistricts = [...insertedDistricts, ...((newDistricts as LocationRow[]) || [])];
        console.log(
          `✅ Districts inserted: ${districtsToInsert.length} new, ${existingDistrictSlugs.size} already existed`
        );
      } else {
        console.log(`✅ All districts already exist: ${districts.length}`);
      }

      // 5. Insert Sample Places
      const restaurantCategory = categories?.find(
        (c) => c.slug === 'restaurant'
      );
      const cafeCategory = categories?.find((c) => c.slug === 'cafe');
      const kadikoy = insertedDistricts?.find(
        (d) => d.slug === 'kadikoy'
      );
      const beyoglu = insertedDistricts?.find(
        (d) => d.slug === 'beyoglu'
      );

      if (restaurantCategory && cafeCategory && kadikoy && beyoglu) {
        console.log('🍽️ Inserting sample places...');
        const places = [
          {
            location_id: beyoglu.id,
            category_id: restaurantCategory.id,
            slug: 'karakoy-lokantasi',
            names: {
              en: 'Karaköy Lokantası',
              tr: 'Karaköy Lokantası',
            },
            descriptions: {
              en: 'Traditional Turkish restaurant with amazing mezes and main dishes',
              tr: 'Muhteşem mezeleri ve ana yemekleri olan geleneksel Türk restoranı',
            },
            address: 'Kemankeş Karamustafa Paşa, Karaköy',
            status: 'approved',
          },
          {
            location_id: kadikoy.id,
            category_id: cafeCategory.id,
            slug: 'kronotrop',
            names: {
              en: 'Kronotrop',
              tr: 'Kronotrop',
            },
            descriptions: {
              en: 'Specialty coffee roastery with excellent brews',
              tr: 'Mükemmel kahveleri olan özel kahve kavurma',
            },
            address: 'Caferağa Mahallesi, Kadıköy',
            status: 'approved',
          },
          {
            location_id: kadikoy.id,
            category_id: restaurantCategory.id,
            slug: 'ciya-sofrasi',
            names: {
              en: 'Çiya Sofrası',
              tr: 'Çiya Sofrası',
            },
            descriptions: {
              en: 'Authentic Anatolian cuisine with daily changing menu',
              tr: 'Günlük değişen menüsü olan otantik Anadolu mutfağı',
            },
            address: 'Caferağa Mahallesi, Kadıköy',
            status: 'approved',
          },
        ];

        // Check existing places
        const existingPlaces = await supabase
          .from('places')
          .select('slug')
          .in(
            'slug',
            places.map((p) => p.slug)
          );

        const existingPlaceSlugs = new Set(
          (existingPlaces.data || []).map((p: { slug: string }) => p.slug)
        );
        const placesToInsert = places.filter(
          (p) => !existingPlaceSlugs.has(p.slug)
        );

        if (placesToInsert.length > 0) {
          const { data: insertedPlaces, error: placesError } = await supabase
            .from('places')
            .insert(placesToInsert as any)
            .select();

          if (placesError) throw placesError;
          console.log(
            `✅ Places inserted: ${placesToInsert.length} new, ${existingPlaceSlugs.size} already existed`
          );
        } else {
          console.log(`✅ All places already exist: ${places.length}`);
        }
      }
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seedDatabase();
