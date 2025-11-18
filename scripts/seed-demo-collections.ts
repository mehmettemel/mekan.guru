import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Demo koleksiyon & oy seed script'i
// ÇALIŞTIRMADAN ÖNCE:
// - 001_initial_schema.sql, 003_collections_schema.sql, 004_auth_setup.sql migration'larının çalıştığından emin ol
// - Önce locations / places seed'lerini çalıştır: npm run seed && npm run seed:categories

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing environment variables!');
  console.error(
    'Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function createTestUser(email: string, password: string) {
  console.log(`👤 Creating test user: ${email}`);

  // Önce mevcut kullanıcıyı kontrol et
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find((u) => u.email === email);

  let authUser;

  if (existingUser) {
    console.log(`   ✅ User already exists, using existing: ${email}`);
    authUser = existingUser;

    // Profile'ı kontrol et
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile) {
      console.log(`   ✅ Profile found with username: ${profile.username}`);
      return profile;
    }
  } else {
    // Yeni kullanıcı oluştur - email_confirm: true ile direkt doğrulanmış olarak
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Email'i direkt doğrula
      user_metadata: {
        username: email.split('@')[0],
      },
    });

    if (error) {
      console.error(
        `   ⚠️  Could not create auth user (${email}):`,
        error.message
      );
      throw error;
    }

    authUser = data.user;
    if (!authUser) {
      throw new Error(`Auth user not returned for ${email}`);
    }

    console.log(`   ✅ Auth user created with ID: ${authUser.id}`);
  }

  // 004_auth_setup.sql tetikleyicisi ile public.users tablosuna profil açılıyor.
  // Trigger'ın çalışması için biraz daha uzun polling yapalım
  for (let i = 0; i < 15; i++) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profile && !profileError) {
      console.log(
        `   ✅ Profile created in public.users with username: ${profile.username}`
      );
      return profile;
    }

    // Her denemede biraz daha uzun bekle (exponential backoff)
    const waitTime = Math.min(500 + i * 200, 2000);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  // Son bir deneme daha yap
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (profile && !profileError) {
    console.log(
      `   ✅ Profile found in public.users with username: ${profile.username}`
    );
    return profile;
  }

  // Trigger çalışmadıysa, manuel olarak public.users'a insert yap
  console.log(`   ⚠️  Trigger did not create profile, creating manually...`);
  const username = email.split('@')[0];

  const { data: manualProfile, error: manualError } = await supabase
    .from('users')
    .insert({
      id: authUser.id,
      username: username,
      trust_score: 100,
      role: 'user',
      email_verified: true, // email_confirm: true ile oluşturduk
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (manualError || !manualProfile) {
    // Eğer unique constraint hatası varsa (username çakışması), tekrar dene
    if (manualError?.code === '23505') {
      const uniqueUsername = `${username}_${Math.floor(Math.random() * 10000)}`;
      const { data: retryProfile, error: retryError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          username: uniqueUsername,
          trust_score: 100,
          role: 'user',
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (retryError || !retryProfile) {
        throw new Error(
          `Failed to create manual profile for ${email}: ${retryError?.message || 'Unknown error'}`
        );
      }

      console.log(
        `   ✅ Manual profile created with username: ${uniqueUsername}`
      );
      return retryProfile;
    }

    throw new Error(
      `Failed to create manual profile for ${email}: ${manualError?.message || 'Unknown error'}`
    );
  }

  console.log(`   ✅ Manual profile created with username: ${username}`);
  return manualProfile;
}

async function seedDemoCollections() {
  console.log('🌱 Seeding demo users + collections + votes...\n');

  try {
    // 1) Test kullanıcılarını oluştur
    const user1 = await createTestUser(
      'demo1@localflavors.test',
      'password123'
    );
    const user2 = await createTestUser(
      'demo2@localflavors.test',
      'password123'
    );

    // 2) Şehir ve kategori kayıtlarını bul
    const { data: istanbul, error: istError } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', 'istanbul')
      .eq('type', 'city')
      .single();

    if (istError || !istanbul) {
      throw new Error('Istanbul city not found. Run npm run seed first.');
    }

    const { data: izmir, error: izError } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', 'izmir')
      .eq('type', 'city')
      .single();

    if (izError || !izmir) {
      throw new Error('Izmir city not found. Run seed-supabase.ts first.');
    }

    const { data: restaurantCat, error: restError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', 'restaurant')
      .single();

    if (restError || !restaurantCat) {
      throw new Error(
        'Restaurant category not found. Run npm run seed:categories first.'
      );
    }

    // 3) İstanbul için var olan dönerci mekanları
    const istanbulPlaceSlugs = [
      'karadeniz-doner-besiktas',
      'bayramoğlu-doner-uskudar',
      'zubeyir-ocakbasi-etiler',
    ];

    const { data: istanbulPlaces, error: placesError } = await supabase
      .from('places')
      .select('*')
      .in('slug', istanbulPlaceSlugs);

    if (placesError || !istanbulPlaces || istanbulPlaces.length === 0) {
      throw new Error(
        'Istanbul döner places not found. Make sure places exist in Istanbul location.'
      );
    }

    // 4) İzmir için birkaç test mekanı (eğer yoksa oluştur)
    const izmirPlaceDefs = [
      {
        slug: 'izmir-deniz-kebap',
        names: { en: 'Izmir Deniz Kebap', tr: 'İzmir Deniz Kebap' },
        descriptions: {
          en: 'Local favorite kebab place close to the seaside.',
          tr: 'Sahil kenarına yakın, yerel halkın sevdiği kebapçı.',
        },
        address: 'Konak, İzmir',
      },
      {
        slug: 'alsancak-doner',
        names: { en: 'Alsancak Döner', tr: 'Alsancak Döner' },
        descriptions: {
          en: 'Popular döner spot in Alsancak with casual vibe.',
          tr: 'Alsancak’ta, samimi ortamı ile popüler bir dönerci.',
        },
        address: 'Alsancak, İzmir',
      },
    ];

    const { data: existingIzmirPlaces } = await supabase
      .from('places')
      .select('slug')
      .eq('location_id', izmir.id);

    const existingSlugs = new Set(
      (existingIzmirPlaces || []).map((p: { slug: string }) => p.slug)
    );
    const izmirPlacesToInsert = izmirPlaceDefs.filter(
      (p) => !existingSlugs.has(p.slug)
    );

    if (izmirPlacesToInsert.length > 0) {
      console.log(
        `🏙️ Inserting ${izmirPlacesToInsert.length} places for Izmir...`
      );
      const { error: insertIzmirError } = await supabase.from('places').insert(
        izmirPlacesToInsert.map((p) => ({
          location_id: izmir.id,
          category_id: restaurantCat.id,
          slug: p.slug,
          names: p.names,
          descriptions: p.descriptions,
          address: p.address,
          status: 'approved',
        }))
      );
      if (insertIzmirError) throw insertIzmirError;
    }

    const { data: izmirPlaces, error: izmirPlacesError } = await supabase
      .from('places')
      .select('*')
      .eq('location_id', izmir.id);

    if (izmirPlacesError || !izmirPlaces || izmirPlaces.length === 0) {
      throw new Error('Izmir places not available after insert.');
    }

    // 5) Koleksiyonları oluştur
    console.log('\n📚 Creating demo collections...');

    // Kullanıcı 1 – İstanbul En İyi Dönerciler
    // Önce mevcut koleksiyonu kontrol et
    let istCollection;
    const { data: existingIstCollection } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', 'istanbul-en-iyi-donerciler')
      .single();

    if (existingIstCollection) {
      console.log('   ✅ Istanbul collection already exists, using existing');
      istCollection = existingIstCollection;
    } else {
      const { data: newIstCollection, error: istColError } = await supabase
        .from('collections')
        .insert({
          slug: 'istanbul-en-iyi-donerciler',
          names: {
            en: 'Best Doner in Istanbul',
            tr: "İstanbul'un En İyi Dönercileri",
          },
          descriptions: {
            en: 'Community curated list of the best doner spots in Istanbul.',
            tr: "İstanbul'daki en iyi dönercilerin topluluk tarafından oluşturulmuş listesi.",
          },
          creator_id: user1.id,
          location_id: istanbul.id,
          category_id: restaurantCat.id,
          status: 'active',
        })
        .select()
        .single();

      if (istColError || !newIstCollection) {
        console.error('   ❌ Error creating Istanbul collection:', istColError);
        throw new Error(
          `Failed to create Istanbul collection: ${istColError?.message || 'Unknown error'}`
        );
      }
      istCollection = newIstCollection;
      console.log('   ✅ Istanbul collection created');
    }

    // Kullanıcı 2 – İzmir En İyi Dönerciler
    // Önce mevcut koleksiyonu kontrol et
    let izmirCollection;
    const { data: existingIzmirCollection } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', 'izmir-en-iyi-donerciler')
      .single();

    if (existingIzmirCollection) {
      console.log('   ✅ Izmir collection already exists, using existing');
      izmirCollection = existingIzmirCollection;
    } else {
      const { data: newIzmirCollection, error: izColError } = await supabase
        .from('collections')
        .insert({
          slug: 'izmir-en-iyi-donerciler',
          names: {
            en: 'Best Doner in Izmir',
            tr: "İzmir'in En İyi Dönercileri",
          },
          descriptions: {
            en: 'Best local doner spots in Izmir, curated by the community.',
            tr: "Topluluk tarafından seçilmiş İzmir'in en iyi dönercileri.",
          },
          creator_id: user2.id,
          location_id: izmir.id,
          category_id: restaurantCat.id,
          status: 'active',
        })
        .select()
        .single();

      if (izColError || !newIzmirCollection) {
        console.error('   ❌ Error creating Izmir collection:', izColError);
        throw new Error(
          `Failed to create Izmir collection: ${izColError?.message || 'Unknown error'}`
        );
      }
      izmirCollection = newIzmirCollection;
      console.log('   ✅ Izmir collection created');
    }

    // 6) collection_places doldur
    console.log('📍 Attaching places to collections...');

    // Mevcut collection_places kayıtlarını kontrol et
    const { data: existingCollectionPlaces } = await supabase
      .from('collection_places')
      .select('collection_id, place_id')
      .in('collection_id', [istCollection.id, izmirCollection.id]);

    const existingPairs = new Set(
      (existingCollectionPlaces || []).map(
        (cp: { collection_id: string; place_id: string }) =>
          `${cp.collection_id}:${cp.place_id}`
      )
    );

    const istPlacesToAttach = istanbulPlaces.slice(0, 3);
    const izmirPlacesToAttach = izmirPlaces.slice(0, 3);

    const collectionPlacesPayload: Array<{
      collection_id: string;
      place_id: string;
      display_order: number;
    }> = [];

    istPlacesToAttach.forEach((p, index) => {
      const pairKey = `${istCollection.id}:${p.id}`;
      if (!existingPairs.has(pairKey)) {
        collectionPlacesPayload.push({
          collection_id: istCollection.id,
          place_id: p.id,
          display_order: index + 1,
        });
      }
    });

    izmirPlacesToAttach.forEach((p, index) => {
      const pairKey = `${izmirCollection.id}:${p.id}`;
      if (!existingPairs.has(pairKey)) {
        collectionPlacesPayload.push({
          collection_id: izmirCollection.id,
          place_id: p.id,
          display_order: index + 1,
        });
      }
    });

    if (collectionPlacesPayload.length > 0) {
      const { error: cpError } = await supabase
        .from('collection_places')
        .insert(collectionPlacesPayload);

      if (cpError) {
        throw cpError;
      }
      console.log(
        `✅ Attached ${collectionPlacesPayload.length} new places to collections`
      );
    } else {
      console.log('✅ All places already attached to collections');
    }

    // 7) Koleksiyonlara oy ver (collection_votes)
    console.log('⭐ Seeding collection votes (will propagate to places)...');

    // Mevcut oyları kontrol et
    const { data: existingVotes } = await supabase
      .from('collection_votes')
      .select('user_id, collection_id')
      .in('collection_id', [istCollection.id, izmirCollection.id])
      .in('user_id', [user1.id, user2.id]);

    const existingVotePairs = new Set(
      (existingVotes || []).map(
        (v: { user_id: string; collection_id: string }) =>
          `${v.user_id}:${v.collection_id}`
      )
    );

    const votesToInsert = [
      // Istanbul koleksiyonu – iki kullanıcı da upvote
      {
        user_id: user1.id,
        collection_id: istCollection.id,
        value: 1,
      },
      {
        user_id: user2.id,
        collection_id: istCollection.id,
        value: 1,
      },
      // Izmir koleksiyonu – sadece user2 upvote
      {
        user_id: user2.id,
        collection_id: izmirCollection.id,
        value: 1,
      },
    ].filter((v) => !existingVotePairs.has(`${v.user_id}:${v.collection_id}`));

    if (votesToInsert.length > 0) {
      const { error: votesError } = await supabase
        .from('collection_votes')
        .insert(votesToInsert);

      if (votesError) {
        throw votesError;
      }
      console.log(`✅ Inserted ${votesToInsert.length} new votes`);
    } else {
      console.log('✅ All votes already exist');
    }

    console.log('\n✅ Demo collections & votes seeded successfully!');
    console.log(
      '   - Users: demo1@localflavors.test / demo2@localflavors.test (password: password123)'
    );
    console.log('   - Collections:');
    console.log('       • /collections/istanbul-en-iyi-donerciler');
    console.log('       • /collections/izmir-en-iyi-donerciler');
    console.log('   - City pages:');
    console.log('       • /turkey/istanbul  → Dönerciler oy skoruna göre önde');
    console.log(
      '       • /turkey/izmir     → İzmir dönercileri oy skoruna göre sıralı'
    );
  } catch (error) {
    console.error('❌ Error seeding demo collections:', error);
    throw error;
  }
}

seedDemoCollections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
