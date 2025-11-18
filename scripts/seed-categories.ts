import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error(
    'Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCategories() {
  console.log('🌱 Starting category seeding...\n');

  try {
    // Main categories
    const mainCategories = [
      {
        slug: 'yemek',
        names: { en: 'Food', tr: 'Yemek' },
        icon: '🍽️',
        display_order: 1,
      },
      {
        slug: 'kafe',
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
      {
        slug: 'genel',
        names: { en: 'General', tr: 'Genel' },
        icon: '📍',
        display_order: 4,
      },
    ];

    // Create main categories
    const categoryIdMap: { [key: string]: string } = {};

    for (const category of mainCategories) {
      console.log(`Creating main category: ${category.slug}...`);

      // Check if category exists
      let { data: existingCategory } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', category.slug)
        .single();

      if (!existingCategory) {
        const { data, error } = await supabase
          .from('categories')
          .insert({
            slug: category.slug,
            names: category.names,
            icon: category.icon,
            display_order: category.display_order,
            parent_id: null,
          })
          .select()
          .single();

        if (error) throw error;
        categoryIdMap[category.slug] = data.id;
        console.log(`  ✅ ${category.slug} created`);
      } else {
        categoryIdMap[category.slug] = existingCategory.id;
        console.log(`  ✅ ${category.slug} already exists`);
      }
    }

    // Subcategories under "Yemek" (Food)
    const yemekSubcategories = [
      {
        slug: 'doner',
        names: { en: 'Döner', tr: 'Döner' },
        icon: '🥙',
        display_order: 1,
      },
      {
        slug: 'hamburger',
        names: { en: 'Burger', tr: 'Hamburger' },
        icon: '🍔',
        display_order: 2,
      },
      {
        slug: 'tatli',
        names: { en: 'Dessert', tr: 'Tatlı' },
        icon: '🍰',
        display_order: 3,
      },
      {
        slug: 'kebap',
        names: { en: 'Kebab', tr: 'Kebap' },
        icon: '🍖',
        display_order: 4,
      },
      {
        slug: 'pizza',
        names: { en: 'Pizza', tr: 'Pizza' },
        icon: '🍕',
        display_order: 5,
      },
      {
        slug: 'durum',
        names: { en: 'Wrap', tr: 'Dürüm' },
        icon: '🌯',
        display_order: 6,
      },
      {
        slug: 'balik',
        names: { en: 'Fish & Seafood', tr: 'Balık & Deniz Ürünleri' },
        icon: '🐟',
        display_order: 7,
      },
      {
        slug: 'pide',
        names: { en: 'Pide', tr: 'Pide' },
        icon: '🥖',
        display_order: 8,
      },
      {
        slug: 'corba',
        names: { en: 'Soup', tr: 'Çorba' },
        icon: '🍜',
        display_order: 9,
      },
      {
        slug: 'ev-yemekleri',
        names: { en: 'Home Cooking', tr: 'Ev Yemekleri' },
        icon: '🥘',
        display_order: 10,
      },
      {
        slug: 'makarna',
        names: { en: 'Pasta', tr: 'Makarna' },
        icon: '🍝',
        display_order: 11,
      },
      {
        slug: 'kahvalti',
        names: { en: 'Breakfast', tr: 'Kahvaltı' },
        icon: '🍳',
        display_order: 12,
      },
    ];

    console.log('\nCreating subcategories under Yemek...');
    const yemekId = categoryIdMap['yemek'];

    for (const subcategory of yemekSubcategories) {
      console.log(`Creating subcategory: ${subcategory.slug}...`);

      // Check if subcategory exists
      let { data: existingSubcategory } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', subcategory.slug)
        .single();

      if (!existingSubcategory) {
        const { error } = await supabase.from('categories').insert({
          slug: subcategory.slug,
          names: subcategory.names,
          icon: subcategory.icon,
          display_order: subcategory.display_order,
          parent_id: yemekId,
        });

        if (error) throw error;
        console.log(`  ✅ ${subcategory.slug} created`);
      } else {
        // Update parent_id if it's not set correctly
        if (existingSubcategory.parent_id !== yemekId) {
          const { error } = await supabase
            .from('categories')
            .update({ parent_id: yemekId })
            .eq('id', existingSubcategory.id);

          if (error) throw error;
          console.log(`  ✅ ${subcategory.slug} updated with parent`);
        } else {
          console.log(`  ✅ ${subcategory.slug} already exists`);
        }
      }
    }

    console.log('\n🎉 Category seeding completed successfully!\n');

    // Count total categories
    const { data: allCategories } = await supabase
      .from('categories')
      .select('*');

    const { data: mainCats } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null);

    const { data: subCats } = await supabase
      .from('categories')
      .select('*')
      .not('parent_id', 'is', null);

    console.log('📊 Summary:');
    console.log(`   - ${allCategories?.length} total categories`);
    console.log(`   - ${mainCats?.length} main categories`);
    console.log(`   - ${subCats?.length} subcategories`);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

// Run the seeding
seedCategories()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
