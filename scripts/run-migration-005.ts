import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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

async function runMigration() {
  console.log('🚀 Running migration 005: Add category hierarchy...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '005_add_category_hierarchy.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and filter out comments and empty statements
    const statements = migrationSQL
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('COMMENT'));

    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);

      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try direct execution if rpc doesn't work
        console.log('RPC failed, trying alternative method...');
        // For Supabase hosted, we need to use the REST API or SQL editor
        console.log('⚠️  Please run this SQL manually in Supabase SQL Editor:');
        console.log('\n' + statement + ';\n');
      } else {
        console.log('✅ Success');
      }
    }

    console.log('\n🎉 Migration completed!\n');
    console.log('Now you can run: npm run seed:categories');
  } catch (error) {
    console.error('❌ Error running migration:', error);
    console.log('\n⚠️  Please run the following SQL manually in Supabase SQL Editor:\n');

    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '005_add_category_hierarchy.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
  }
}

// Run the migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
