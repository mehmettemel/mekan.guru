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
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Found' : 'Missing');
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Insert Categories
    console.log('📦 Inserting categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .insert([
        {
          slug: 'restaurants',
          names: { en: 'Restaurants', tr: 'Restoranlar', es: 'Restaurantes' },
          icon: 'utensils',
          display_order: 1,
        },
        {
          slug: 'cafes',
          names: { en: 'Cafes', tr: 'Kafeler', es: 'Cafeterías' },
          icon: 'coffee',
          display_order: 2,
        },
        {
          slug: 'bars',
          names: { en: 'Bars & Pubs', tr: 'Barlar', es: 'Bares' },
          icon: 'beer',
          display_order: 3,
        },
      ])
      .select();

    if (categoriesError) throw categoriesError;
    console.log('✅ Categories inserted:', categories?.length);

    // 2. Insert Turkey
    console.log('🇹🇷 Inserting Turkey...');
    const { data: turkey, error: turkeyError } = await supabase
      .from('locations')
      .insert({
        type: 'country',
        slug: 'turkey',
        names: { en: 'Turkey', tr: 'Türkiye', es: 'Turquía' },
        path: '/turkey',
        has_districts: false,
        latitude: 38.9637,
        longitude: 35.2433,
      })
      .select()
      .single();

    if (turkeyError) throw turkeyError;
    console.log('✅ Turkey inserted');

    // 3. Insert Cities
    console.log('🏙️ Inserting cities...');
    const cities = [
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'istanbul',
        names: { en: 'Istanbul', tr: 'İstanbul', es: 'Estambul' },
        path: '/turkey/istanbul',
        has_districts: true,
        latitude: 41.0082,
        longitude: 28.9784,
      },
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'ankara',
        names: { en: 'Ankara', tr: 'Ankara', es: 'Ankara' },
        path: '/turkey/ankara',
        has_districts: false,
        latitude: 39.9334,
        longitude: 32.8597,
      },
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'izmir',
        names: { en: 'Izmir', tr: 'İzmir', es: 'Esmirna' },
        path: '/turkey/izmir',
        has_districts: false,
        latitude: 38.4237,
        longitude: 27.1428,
      },
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'antalya',
        names: { en: 'Antalya', tr: 'Antalya', es: 'Antalya' },
        path: '/turkey/antalya',
        has_districts: false,
        latitude: 36.8969,
        longitude: 30.7133,
      },
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'bursa',
        names: { en: 'Bursa', tr: 'Bursa', es: 'Bursa' },
        path: '/turkey/bursa',
        has_districts: false,
        latitude: 40.1826,
        longitude: 29.0665,
      },
      {
        parent_id: turkey.id,
        type: 'city' as const,
        slug: 'gaziantep',
        names: { en: 'Gaziantep', tr: 'Gaziantep', es: 'Gaziantep' },
        path: '/turkey/gaziantep',
        has_districts: false,
        latitude: 37.0662,
        longitude: 37.3833,
      },
    ];

    const { data: insertedCities, error: citiesError } = await supabase
      .from('locations')
      .insert(cities)
      .select();

    if (citiesError) throw citiesError;
    console.log('✅ Cities inserted:', insertedCities?.length);

    // 4. Insert Istanbul Districts
    const istanbul = insertedCities?.find((c) => c.slug === 'istanbul');
    if (istanbul) {
      console.log('📍 Inserting Istanbul districts...');
      const districts = [
        {
          parent_id: istanbul.id,
          type: 'district' as const,
          slug: 'kadikoy',
          names: { en: 'Kadikoy', tr: 'Kadıköy', es: 'Kadikoy' },
          path: '/turkey/istanbul/kadikoy',
          has_districts: false,
          latitude: 40.9904,
          longitude: 29.0254,
        },
        {
          parent_id: istanbul.id,
          type: 'district' as const,
          slug: 'besiktas',
          names: { en: 'Besiktas', tr: 'Beşiktaş', es: 'Besiktas' },
          path: '/turkey/istanbul/besiktas',
          has_districts: false,
          latitude: 41.0422,
          longitude: 29.0092,
        },
        {
          parent_id: istanbul.id,
          type: 'district' as const,
          slug: 'beyoglu',
          names: { en: 'Beyoglu', tr: 'Beyoğlu', es: 'Beyoglu' },
          path: '/turkey/istanbul/beyoglu',
          has_districts: false,
          latitude: 41.0351,
          longitude: 28.977,
        },
      ];

      const { data: insertedDistricts, error: districtsError } = await supabase
        .from('locations')
        .insert(districts)
        .select();

      if (districtsError) throw districtsError;
      console.log('✅ Districts inserted:', insertedDistricts?.length);

      // 5. Insert Sample Places
      const restaurantCategory = categories?.find((c) => c.slug === 'restaurants');
      const cafeCategory = categories?.find((c) => c.slug === 'cafes');
      const kadikoy = insertedDistricts?.find((d) => d.slug === 'kadikoy');
      const beyoglu = insertedDistricts?.find((d) => d.slug === 'beyoglu');

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
              es: 'Karaköy Lokantası',
            },
            descriptions: {
              en: 'Traditional Turkish restaurant with amazing mezes and main dishes',
              tr: 'Muhteşem mezeleri ve ana yemekleri olan geleneksel Türk restoranı',
              es: 'Restaurante turco tradicional con increíbles mezes y platos principales',
            },
            address: 'Kemankeş Karamustafa Paşa, Karaköy',
            status: 'approved',
            images: ['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop'],
          },
          {
            location_id: kadikoy.id,
            category_id: cafeCategory.id,
            slug: 'kronotrop',
            names: { en: 'Kronotrop', tr: 'Kronotrop', es: 'Kronotrop' },
            descriptions: {
              en: 'Specialty coffee roastery with excellent brews',
              tr: 'Mükemmel kahveleri olan özel kahve kavurma',
              es: 'Tostador de café especializado',
            },
            address: 'Caferağa Mahallesi, Kadıköy',
            status: 'approved',
            images: ['https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop'],
          },
          {
            location_id: kadikoy.id,
            category_id: restaurantCategory.id,
            slug: 'ciya-sofrasi',
            names: { en: 'Çiya Sofrası', tr: 'Çiya Sofrası', es: 'Çiya Sofrası' },
            descriptions: {
              en: 'Authentic Anatolian cuisine with daily changing menu',
              tr: 'Günlük değişen menüsü olan otantik Anadolu mutfağı',
              es: 'Auténtica cocina anatolia',
            },
            address: 'Caferağa Mahallesi, Kadıköy',
            status: 'approved',
            images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop'],
          },
        ];

        const { data: insertedPlaces, error: placesError } = await supabase
          .from('places')
          .insert(places)
          .select();

        if (placesError) throw placesError;
        console.log('✅ Places inserted:', insertedPlaces?.length);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

seedDatabase();
