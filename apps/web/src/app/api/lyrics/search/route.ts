import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const TAMIL2LYRICS_BASE = 'https://www.tamil2lyrics.com';

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 20 } = await request.json();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results = await searchTamil2Lyrics(query, limit);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

async function searchTamil2Lyrics(query: string, limit: number) {
  const searchUrl = `${TAMIL2LYRICS_BASE}/?s=${encodeURIComponent(query)}&post_type=lyrics`;

  const response = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'AiSwara-Studio/1.0 (Music Prompt Composer)',
      'Accept': 'text/html',
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    console.error(`tamil2lyrics.com returned ${response.status}`);
    return [];
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const results: SearchResult[] = [];

  $('.post-list .item').each((index, element) => {
    if (index >= limit) return false;

    const $item = $(element);
    const $titleLink = $item.find('a.post_title, a.title');
    const $thumb = $item.find('.post_thumb img');

    const songTitle = $titleLink.text().trim();
    const songUrl = $titleLink.attr('href') || '';
    const thumbnail = $thumb.attr('src') || '';

    if (!songTitle || !songUrl) return;

    // Extract metadata from title patterns like "Song Name Song Lyrics"
    const cleanTitle = songTitle
      .replace(/\s+Song\s+Lyrics$/i, '')
      .replace(/\s+Lyrics$/i, '')
      .trim();

    results.push({
      id: songUrl, // Use URL as unique identifier
      song_title: cleanTitle,
      movie_name: '',  // Populated on detail fetch
      singer: '',
      lyricist: '',
      music_director: '',
      year: 0,
      lyrics_preview: '',
      url: songUrl,
      thumbnail,
    });
  });

  // Enrich first 5 results with metadata from meta descriptions
  const enriched = await Promise.allSettled(
    results.slice(0, 5).map(async (result) => {
      try {
        const meta = await fetchSongMeta(result.url);
        return { ...result, ...meta };
      } catch {
        return result;
      }
    })
  );

  const enrichedResults = enriched.map((r) =>
    r.status === 'fulfilled' ? r.value : results[0]
  );

  // Merge enriched results with remaining un-enriched ones
  return [...enrichedResults, ...results.slice(5)];
}

async function fetchSongMeta(url: string): Promise<Partial<SearchResult>> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AiSwara-Studio/1.0 (Music Prompt Composer)',
      'Accept': 'text/html',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) return {};

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract from meta description
  const metaDesc = $('meta[name="description"]').attr('content') || '';

  const movieMatch = metaDesc.match(/Movie\s*(?:Name)?\s*:\s*([^,]+?)(?:\s*,\s*(?:Artists?|Music|Lyrics|Singer)|\s*$)/i);
  const artistMatch = metaDesc.match(/Artists?\s*:\s*(.+?)(?:\s*,\s*(?:Music|Lyrics)|\s*$)/i);
  const musicMatch = metaDesc.match(/Music\s*(?:Director)?\s*:\s*(.+?)(?:\s*,\s*(?:Lyrics|Artists?)|\s*$)/i);
  const lyricistMatch = metaDesc.match(/Lyrics?\s*(?:by)?\s*:\s*(.+?)(?:\s*,\s*(?:Music|Artists?)|\s*$)/i);

  // Extract lyrics preview from page content
  const lyricsContent = $('div.entry-content, div.post-content, article .entry-content')
    .first()
    .text()
    .trim();

  const lyricsPreview = lyricsContent
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .slice(0, 4)
    .join(' ')
    .substring(0, 200);

  return {
    movie_name: movieMatch?.[1]?.trim() || '',
    singer: artistMatch?.[1]?.trim() || '',
    music_director: musicMatch?.[1]?.trim() || '',
    lyricist: lyricistMatch?.[1]?.trim() || '',
    lyrics_preview: lyricsPreview,
  };
}

interface SearchResult {
  id: string;
  song_title: string;
  movie_name: string;
  singer: string;
  lyricist: string;
  music_director: string;
  year: number;
  lyrics_preview: string;
  url: string;
  thumbnail?: string;
}
