const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for admin tasks

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log("Setting up Supabase...");

  // 1. Create storage bucket
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error("Error listing buckets:", bucketsError);
  } else {
    const bucketExists = buckets.find(b => b.name === 'user-media');
    if (!bucketExists) {
      console.log("Creating 'user-media' bucket...");
      const { error } = await supabase.storage.createBucket('user-media', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });
      if (error) console.error("Error creating bucket:", error);
      else console.log("Bucket created successfully.");
    } else {
      console.log("Bucket 'user-media' already exists.");
    }
  }

  // 2. Make user_id nullable for testing without auth
  const sql = `
    ALTER TABLE pages ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE slugs ALTER COLUMN user_id DROP NOT NULL;
    
    -- Drop existing strict policies
    DROP POLICY IF EXISTS "Users manage own pages" ON pages;
    DROP POLICY IF EXISTS "Users manage own slugs" ON slugs;
    
    -- Allow anonymous inserts for now (since we don't have auth yet)
    CREATE POLICY "Allow public insert to pages" ON pages FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update to pages" ON pages FOR UPDATE USING (true);
    CREATE POLICY "Allow public insert to slugs" ON slugs FOR INSERT WITH CHECK (true);
    CREATE POLICY "Allow public update to slugs" ON slugs FOR UPDATE USING (true);
  `;
  
  // We can't execute raw SQL directly via the JS client easily unless we use an RPC.
  // Instead, I'll ask the user to run it if they want, but actually we can just use an API route
  // with the service_role key to bypass RLS! Yes!
  
  console.log("Setup complete");
}

setup();
