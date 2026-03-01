import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// tamizhlyrics.com Supabase instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbtqrzpnombaqpwuspmm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const songId = decodeURIComponent(params.id);

    // Try fetching by ID first
    let query = supabase
      .from('tamil_lyrics')
      .select('id, song_title, movie_name, singer, lyricist, music_director, year, lyrics_preview, full_lyrics, url')
      .limit(1);

    // Check if it's a UUID or a URL
    if (songId.startsWith('http')) {
      query = query.eq('url', songId);
    } else {
      query = query.eq('id', songId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      // Fallback: try searching by song title
      const { data: searchData, error: searchError } = await supabase
        .from('tamil_lyrics')
        .select('id, song_title, movie_name, singer, lyricist, music_director, year, lyrics_preview, full_lyrics, url')
        .ilike('song_title', `%${songId}%`)
        .limit(1)
        .single();

      if (searchError || !searchData) {
        return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: searchData.id,
        song_title: searchData.song_title,
        movie_name: searchData.movie_name || '',
        singer: searchData.singer || '',
        music_director: searchData.music_director || '',
        lyricist: searchData.lyricist || '',
        year: searchData.year || 0,
        lyrics: searchData.full_lyrics || searchData.lyrics_preview || '',
        url: searchData.url || '',
      });
    }

    return NextResponse.json({
      id: data.id,
      song_title: data.song_title,
      movie_name: data.movie_name || '',
      singer: data.singer || '',
      music_director: data.music_director || '',
      lyricist: data.lyricist || '',
      year: data.year || 0,
      lyrics: data.full_lyrics || data.lyrics_preview || '',
      url: data.url || '',
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch lyrics' }, { status: 500 });
  }
}
