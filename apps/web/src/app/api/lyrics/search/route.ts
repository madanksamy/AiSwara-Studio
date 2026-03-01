import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// tamizhlyrics.com Supabase instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbtqrzpnombaqpwuspmm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { query, mode = 'text', limit = 20 } = await request.json();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    let results;

    if (mode === 'semantic') {
      // Fuzzy search using pg_trgm similarity via Supabase RPC
      const { data, error } = await supabase.rpc('search_lyrics_fuzzy', {
        search_query: query,
        match_limit: limit,
      });

      if (error) {
        console.error('Fuzzy search error:', error);
        // Fallback to text search
        results = await performTextSearch(query, limit);
      } else {
        results = data;
      }
    } else {
      // Try fuzzy first (better results), fall back to ILIKE text search
      const { data, error } = await supabase.rpc('search_lyrics_fuzzy', {
        search_query: query,
        match_limit: limit,
      });

      if (error || !data || data.length === 0) {
        results = await performTextSearch(query, limit);
      } else {
        results = data;
      }
    }

    return NextResponse.json({ results: results || [] });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

async function performTextSearch(query: string, limit: number) {
  const searchPattern = `%${query}%`;

  const { data, error } = await supabase
    .from('tamil_lyrics')
    .select('id, song_title, movie_name, singer, lyricist, music_director, year, lyrics_preview, url')
    .or(
      `song_title.ilike.${searchPattern},movie_name.ilike.${searchPattern},singer.ilike.${searchPattern},lyricist.ilike.${searchPattern},music_director.ilike.${searchPattern}`
    )
    .order('year', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('Text search error:', error);
    return [];
  }

  return data || [];
}
