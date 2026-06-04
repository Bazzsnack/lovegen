-- Initial Schema for LoveGen

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  pages_count   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Users can only read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  phrases         JSONB NOT NULL DEFAULT '[]',
  
  theme           TEXT NOT NULL DEFAULT 'rose-petal'
                  CHECK (theme IN ('rose-petal', 'starlight', 'ocean-breeze', 'golden-hour', 'midnight-bloom', 'aurora')),
  
  particle_speed  TEXT NOT NULL DEFAULT 'medium' CHECK (particle_speed IN ('slow', 'medium', 'fast')),
  particle_density TEXT NOT NULL DEFAULT 'normal' CHECK (particle_density IN ('sparse', 'normal', 'dense')),
  font_pairing    TEXT NOT NULL DEFAULT 'playfair-inter',
  
  image_urls      JSONB NOT NULL DEFAULT '[]',
  
  audio_url       TEXT,
  audio_filename  TEXT,
  
  qr_config       JSONB NOT NULL DEFAULT '{}',
  
  is_published    BOOLEAN NOT NULL DEFAULT false,
  published_at    TIMESTAMPTZ,
  view_count      INTEGER NOT NULL DEFAULT 0,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pages_user_id ON pages(user_id);
CREATE INDEX idx_pages_published ON pages(is_published) WHERE is_published = true;

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own pages"
  ON pages FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public reads published pages"
  ON pages FOR SELECT USING (is_published = true);

CREATE TABLE slugs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug      TEXT NOT NULL UNIQUE,
  page_id   UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_slugs_active ON slugs(slug) WHERE is_active = true;
CREATE INDEX idx_slugs_page_id ON slugs(page_id);

ALTER TABLE slugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own slugs"
  ON slugs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public reads active slugs"
  ON slugs FOR SELECT USING (is_active = true);

CREATE TABLE analytics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id     UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL CHECK (event_type IN ('view', 'qr_scan', 'audio_play', 'share')),
  visitor_ip  TEXT,
  user_agent  TEXT,
  referrer    TEXT,
  country     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_page_id ON analytics(page_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own page analytics"
  ON analytics FOR SELECT
  USING (
    page_id IN (SELECT id FROM pages WHERE user_id = auth.uid())
  );

CREATE POLICY "Service inserts analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);

-- Auto-Update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Increment View Count Function
CREATE OR REPLACE FUNCTION increment_view_count(target_page_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pages SET view_count = view_count + 1 WHERE id = target_page_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
