-- Presets table for AI music prompt configurations
CREATE TABLE IF NOT EXISTS presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'user',
  tags TEXT[] DEFAULT '{}',
  config JSONB NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_presets_category ON presets (category);
CREATE INDEX IF NOT EXISTS idx_presets_is_system ON presets (is_system);
CREATE INDEX IF NOT EXISTS idx_presets_created_at ON presets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_presets_tags ON presets USING gin (tags);

-- Auto-update updated_at (reuse trigger function from 001 migration)
CREATE TRIGGER presets_updated_at
  BEFORE UPDATE ON presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;

-- Anyone can read all presets
CREATE POLICY "Allow public read access" ON presets
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create non-system presets
CREATE POLICY "Authenticated users can insert non-system presets" ON presets
  FOR INSERT
  TO authenticated
  WITH CHECK (is_system = false);

-- Authenticated users can update non-system presets
CREATE POLICY "Authenticated users can update non-system presets" ON presets
  FOR UPDATE
  TO authenticated
  USING (is_system = false)
  WITH CHECK (is_system = false);

-- Authenticated users can delete non-system presets
CREATE POLICY "Authenticated users can delete non-system presets" ON presets
  FOR DELETE
  TO authenticated
  USING (is_system = false);

-- Seed system presets
-- Note: config is stored as JSONB. The full config objects are resolved at
-- runtime by the API route from DEFAULT_CONFIG spreads, so we store minimal
-- distinguishing config here. The API route in [id]/route.ts has the full
-- SYSTEM_PRESETS configs and serves them directly — these DB rows exist for
-- listing/search purposes via the GET /api/presets endpoint.
INSERT INTO presets (id, name, description, category, tags, config, is_system)
VALUES
  (
    'a1b2c3d4-0001-4000-8000-000000000001',
    'Tamil 80s Ballad',
    'Warm analog production, melodic Tamil vocals with classical nuances',
    'tamil_film',
    ARRAY['ilaiyaraaja', 'melody', 'romantic'],
    '{"global":{"genre":"tamil_film","tempo":72,"moodAxes":{"energy":30,"tension":20,"brightness":60,"warmth":80},"useCase":"romantic"},"vocals":{"language":"tamil","role":"lead","gender":"male","styles":["ilaiyaraaja_style","melody_90s"],"performance":"expressive"},"ornamentation":{"carnatic":{"enabled":true,"ragaFlavor":"kharaharapriya","techniques":["gamakam","sangati"],"complexity":40}},"mix":{"adjectives":["warm","analog","vintage"],"spatialSize":"medium_hall"}}'::jsonb,
    true
  ),
  (
    'a1b2c3d4-0002-4000-8000-000000000002',
    'Tamil Mass Song',
    'High-energy electronic production with folk percussion layers',
    'tamil_film',
    ARRAY['kuthu', 'high-energy', 'edm'],
    '{"global":{"genre":"tamil_film","tempo":135,"moodAxes":{"energy":90,"tension":60,"brightness":80,"warmth":50},"useCase":"party"},"vocals":{"language":"tamil","role":"lead","gender":"male","styles":["kuthu","playback_energetic"],"performance":"intense"},"ornamentation":{"folk":{"enabled":true,"elements":["gaana","parai"],"intensity":70}},"mix":{"adjectives":["punchy","aggressive","thick"],"frequencyFocus":"bass_heavy"}}'::jsonb,
    true
  ),
  (
    'a1b2c3d4-0003-4000-8000-000000000003',
    'Carnatic Kriti',
    'Traditional Carnatic composition with mridangam and veena',
    'carnatic',
    ARRAY['classical', 'traditional', 'raga'],
    '{"global":{"genre":"carnatic_classical","tempo":80,"moodAxes":{"energy":40,"tension":30,"brightness":70,"warmth":60},"useCase":"standalone_song"},"vocals":{"language":"tamil","role":"lead","styles":["carnatic_classical"],"performance":"expressive"},"ornamentation":{"carnatic":{"enabled":true,"ragaFlavor":"shankarabharanam","techniques":["alapana","gamakam","sangati","kalpanaswaram"],"complexity":80}},"structure":{"form":"pallavi_anupallavi_charanam","tala":"adi"}}'::jsonb,
    true
  ),
  (
    'a1b2c3d4-0004-4000-8000-000000000004',
    'Carnatic Ambient Fusion',
    'Ethereal pads with classical ragas and electronic textures',
    'fusion',
    ARRAY['ambient', 'electronic', 'raga'],
    '{"global":{"genre":"fusion","tempo":90,"moodAxes":{"energy":30,"tension":20,"brightness":50,"warmth":70},"useCase":"ambient"},"vocals":{"language":"tamil","styles":["carnatic_classical"],"performance":"meditative"},"ornamentation":{"carnatic":{"enabled":true,"ragaFlavor":"kalyani","techniques":["alapana","gamakam"],"complexity":50}},"mix":{"adjectives":["ethereal","spacious","ambient"],"spatialSize":"large_hall"}}'::jsonb,
    true
  ),
  (
    'a1b2c3d4-0005-4000-8000-000000000005',
    'Tamil Parai Dance',
    'Energetic parai drums with village folk vocals',
    'folk',
    ARRAY['parai', 'high-energy', 'village'],
    '{"global":{"genre":"tamil_folk","tempo":140,"moodAxes":{"energy":95,"tension":50,"brightness":70,"warmth":60},"useCase":"dance"},"vocals":{"language":"tamil","role":"lead","styles":["folk_village"],"performance":"intense"},"ornamentation":{"folk":{"enabled":true,"elements":["parai","thavil","gaana"],"intensity":90}},"mix":{"adjectives":["raw","energetic","percussive"]}}'::jsonb,
    true
  ),
  (
    'a1b2c3d4-0006-4000-8000-000000000006',
    'Tamil Devotional',
    'Soft devotional with nadaswaram and gentle percussion',
    'devotional',
    ARRAY['bhakti', 'soft', 'temple'],
    '{"global":{"genre":"devotional","tempo":65,"moodAxes":{"energy":20,"tension":10,"brightness":60,"warmth":90},"useCase":"devotional"},"vocals":{"language":"tamil","role":"lead","styles":["devotional_bhakti"],"performance":"serene"},"ornamentation":{"carnatic":{"enabled":true,"ragaFlavor":"hamsadhwani","techniques":["gamakam"],"complexity":30}},"mix":{"adjectives":["soft","warm","reverberant"],"spatialSize":"temple"}}'::jsonb,
    true
  ),
  (
    'a1b2c3d4-0007-4000-8000-000000000007',
    'Indian Fusion Rock',
    'Electric guitar riffs with Indian melodic elements',
    'fusion',
    ARRAY['rock', 'electric-guitar', 'raga'],
    '{"global":{"genre":"fusion_rock","tempo":120,"moodAxes":{"energy":80,"tension":70,"brightness":75,"warmth":40},"useCase":"standalone_song"},"vocals":{"language":"tamil","role":"lead","styles":["rock","playback_energetic"],"performance":"intense"},"ornamentation":{"carnatic":{"enabled":true,"ragaFlavor":"charukesi","techniques":["gamakam"],"complexity":40}},"mix":{"adjectives":["distorted","powerful","wide"],"frequencyFocus":"mid_heavy"}}'::jsonb,
    true
  ),
  (
    'a1b2c3d4-0008-4000-8000-000000000008',
    '90s Tamil Pop Duet',
    'Sweet melodic duet with synthesizers and acoustic layers',
    'tamil_film',
    ARRAY['duet', 'melody', 'ar-rahman'],
    '{"global":{"genre":"tamil_film","tempo":100,"moodAxes":{"energy":50,"tension":25,"brightness":75,"warmth":70},"useCase":"romantic"},"vocals":{"language":"tamil","role":"duet","gender":"mixed","styles":["ar_rahman_style","melody_90s"],"performance":"expressive"},"ornamentation":{"carnatic":{"enabled":true,"ragaFlavor":"mohanam","techniques":["gamakam","sangati"],"complexity":35}},"mix":{"adjectives":["clean","bright","layered"],"spatialSize":"medium_hall"}}'::jsonb,
    true
  )
ON CONFLICT DO NOTHING;
