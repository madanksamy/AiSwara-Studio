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

  // Tamil2lyrics.com uses Bootstrap grid rows with class "list-line"
  // Structure: .list-line > .col-lg-6 (song link) + .col-lg-3 (movie) + .col-lg-3 (lyricist)
  $('.list-line').each((index, element) => {
    if (index >= limit) return false;

    const $row = $(element);
    const columns = $row.find('[class*="col-"]');

    if (columns.length < 2) return;

    // First column: song title + link
    const $songCol = $(columns[0]);
    const $songLink = $songCol.find('a[href*="/lyrics/"]');
    const songTitle = $songLink.text().trim();
    const songUrl = $songLink.attr('href') || '';

    if (!songTitle || !songUrl) return;

    // Second column: movie/album link
    const $movieCol = $(columns[1]);
    const $movieLink = $movieCol.find('a[href*="/movies/"], a[href*="/album/"]');
    const movieName = $movieLink.text().trim();

    // Third column: lyricist link (if present)
    const $lyricistCol = columns.length >= 3 ? $(columns[2]) : null;
    const lyricistName = $lyricistCol
      ? $lyricistCol.find('a[href*="/Lyricist/"], a[href*="/lyricist/"]').text().trim()
      : '';

    // Clean song title: remove "Song Lyrics" suffix
    const cleanTitle = songTitle
      .replace(/\s+Song\s+Lyrics$/i, '')
      .replace(/\s+Lyrics$/i, '')
      .trim();

    results.push({
      id: songUrl,
      song_title: cleanTitle,
      movie_name: movieName,
      singer: '',
      lyricist: lyricistName,
      music_director: '',
      year: 0,
      lyrics_preview: '',
      url: songUrl,
    });
  });

  return results;
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
}
