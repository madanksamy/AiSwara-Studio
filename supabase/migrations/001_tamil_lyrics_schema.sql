-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Tamil Lyrics table
CREATE TABLE IF NOT EXISTS tamil_lyrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_title TEXT NOT NULL,
  movie_name TEXT,
  singer TEXT,
  lyricist TEXT,
  music_director TEXT,
  year INTEGER,
  lyrics_preview TEXT, -- First 500 chars
  full_lyrics TEXT,
  url TEXT,
  source TEXT DEFAULT 'tamillyrics.com',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for text search
CREATE INDEX IF NOT EXISTS idx_tamil_lyrics_song_title ON tamil_lyrics USING gin (song_title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tamil_lyrics_movie_name ON tamil_lyrics USING gin (movie_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tamil_lyrics_singer ON tamil_lyrics USING gin (singer gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tamil_lyrics_lyricist ON tamil_lyrics USING gin (lyricist gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tamil_lyrics_music_director ON tamil_lyrics USING gin (music_director gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tamil_lyrics_preview ON tamil_lyrics USING gin (lyrics_preview gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tamil_lyrics_year ON tamil_lyrics (year DESC);

-- Fuzzy search function using pg_trgm
CREATE OR REPLACE FUNCTION search_lyrics_fuzzy(
  search_query TEXT,
  match_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  song_title TEXT,
  movie_name TEXT,
  singer TEXT,
  lyricist TEXT,
  music_director TEXT,
  year INTEGER,
  lyrics_preview TEXT,
  url TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tl.id,
    tl.song_title,
    tl.movie_name,
    tl.singer,
    tl.lyricist,
    tl.music_director,
    tl.year,
    tl.lyrics_preview,
    tl.url,
    GREATEST(
      similarity(tl.song_title, search_query),
      similarity(COALESCE(tl.movie_name, ''), search_query),
      similarity(COALESCE(tl.singer, ''), search_query),
      similarity(COALESCE(tl.lyricist, ''), search_query),
      similarity(COALESCE(tl.music_director, ''), search_query),
      similarity(COALESCE(tl.lyrics_preview, ''), search_query) * 0.5
    )::FLOAT AS similarity
  FROM tamil_lyrics tl
  WHERE
    tl.song_title % search_query
    OR tl.movie_name % search_query
    OR tl.singer % search_query
    OR tl.lyricist % search_query
    OR tl.music_director % search_query
    OR tl.lyrics_preview % search_query
  ORDER BY similarity DESC
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql;

-- Full text search function (alternative)
CREATE OR REPLACE FUNCTION search_lyrics_fulltext(
  search_query TEXT,
  match_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  song_title TEXT,
  movie_name TEXT,
  singer TEXT,
  lyricist TEXT,
  music_director TEXT,
  year INTEGER,
  lyrics_preview TEXT,
  url TEXT,
  rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tl.id,
    tl.song_title,
    tl.movie_name,
    tl.singer,
    tl.lyricist,
    tl.music_director,
    tl.year,
    tl.lyrics_preview,
    tl.url,
    ts_rank(
      to_tsvector('simple',
        COALESCE(tl.song_title, '') || ' ' ||
        COALESCE(tl.movie_name, '') || ' ' ||
        COALESCE(tl.singer, '') || ' ' ||
        COALESCE(tl.lyricist, '') || ' ' ||
        COALESCE(tl.music_director, '') || ' ' ||
        COALESCE(tl.lyrics_preview, '')
      ),
      plainto_tsquery('simple', search_query)
    )::FLOAT AS rank
  FROM tamil_lyrics tl
  WHERE
    to_tsvector('simple',
      COALESCE(tl.song_title, '') || ' ' ||
      COALESCE(tl.movie_name, '') || ' ' ||
      COALESCE(tl.singer, '') || ' ' ||
      COALESCE(tl.lyricist, '') || ' ' ||
      COALESCE(tl.music_director, '') || ' ' ||
      COALESCE(tl.lyrics_preview, '')
    ) @@ plainto_tsquery('simple', search_query)
  ORDER BY rank DESC
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tamil_lyrics_updated_at
  BEFORE UPDATE ON tamil_lyrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE tamil_lyrics ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON tamil_lyrics
  FOR SELECT
  TO public
  USING (true);

-- Insert some sample data for testing
INSERT INTO tamil_lyrics (song_title, movie_name, singer, lyricist, music_director, year, lyrics_preview, url)
VALUES
  ('Kaatril Enthan Geetham', 'Kadalora Kavithaigal', 'S.P. Balasubrahmanyam, S. Janaki', 'Vaali', 'Ilaiyaraaja', 1986, 'Kaatril enthan geetham ketpayo... Enakkum unakkum itheye naeram...', 'https://www.tamil2lyrics.com/lyrics/kaatril-enthan-geetham-song-lyrics/'),
  ('Enna Solla Pogirai', 'Kandukondain Kandukondain', 'A.R. Rahman, Hariharan, K.S. Chithra', 'Vairamuthu', 'A.R. Rahman', 2000, 'Enna solla pogirai... En idhayam thaalaattum raagam nee...', 'https://www.tamil2lyrics.com/lyrics/enna-solla-pogirai-song-lyrics/'),
  ('Munbe Vaa', 'Sillunu Oru Kaadhal', 'Naresh Iyer, Shreya Ghoshal', 'Na. Muthukumar', 'A.R. Rahman', 2006, 'Munbe vaa en anbe vaa... Nenjil nee illaamal vaazha maaten...', 'https://www.tamil2lyrics.com/lyrics/munbe-vaa-song-lyrics/'),
  ('Kannazhaga', 'Moonu', 'Dhanush, Shruti Haasan', 'Dhanush', 'Anirudh Ravichander', 2012, 'Kannazhaga kadhalarasi kadhal enbadhu evvalavu azhagu...', 'https://www.tamil2lyrics.com/lyrics/kannazhaga-song-lyrics/'),
  ('Vaseegara', 'Minnale', 'Bombay Jayashri, Srinivas', 'Pa. Vijay', 'Harris Jayaraj', 2001, 'Vaseegara enn nenjinaiku neram neriya oll kaatchi...', 'https://www.tamil2lyrics.com/lyrics/vaseegara-song-lyrics/')
ON CONFLICT DO NOTHING;
