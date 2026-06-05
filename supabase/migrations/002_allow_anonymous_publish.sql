-- Allow anonymous publishing (no login required)
-- 1. Drop the NOT NULL + foreign key on pages.user_id
ALTER TABLE pages ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE pages DROP CONSTRAINT IF EXISTS pages_user_id_fkey;

-- 2. Drop the NOT NULL + foreign key on slugs.user_id
ALTER TABLE slugs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE slugs DROP CONSTRAINT IF EXISTS slugs_user_id_fkey;

-- 3. Update RLS policies to allow anonymous inserts via service role
-- (The service role key already bypasses RLS, so these are just for safety)

-- Allow public insert on pages (service role already bypasses)
DROP POLICY IF EXISTS "Allow anonymous insert pages" ON pages;
CREATE POLICY "Allow anonymous insert pages"
  ON pages FOR INSERT
  WITH CHECK (true);

-- Allow public insert on slugs (service role already bypasses)
DROP POLICY IF EXISTS "Allow anonymous insert slugs" ON slugs;
CREATE POLICY "Allow anonymous insert slugs"
  ON slugs FOR INSERT
  WITH CHECK (true);
