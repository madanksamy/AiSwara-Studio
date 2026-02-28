import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // The "id" is a URL-encoded song page URL from tamil2lyrics.com
    const songUrl = decodeURIComponent(params.id);

    if (!songUrl.startsWith('https://www.tamil2lyrics.com/')) {
      return NextResponse.json({ error: 'Invalid lyrics URL' }, { status: 400 });
    }

    const response = await fetch(songUrl, {
      headers: {
        'User-Agent': 'AiSwara-Studio/1.0 (Music Prompt Composer)',
        'Accept': 'text/html',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata from meta description
    // Format: "Song Title, Movie Name : X, Artists : Y, Music Director : Z"
    const metaDesc = $('meta[name="description"]').attr('content') || '';

    const movieMatch = metaDesc.match(/Movie\s*(?:Name)?\s*:\s*([^,]+?)(?:\s*,\s*(?:Artists?|Music|Lyrics|Singer)|\s*$)/i);
    const artistMatch = metaDesc.match(/Artists?\s*:\s*(.+?)(?:\s*,\s*(?:Music|Lyrics)|\s*$)/i);
    const musicMatch = metaDesc.match(/Music\s*(?:Director)?\s*:\s*(.+?)(?:\s*,\s*(?:Lyrics|Artists?)|\s*$)/i);

    // Extract song title from page
    const pageTitle = $('h1').first().text().trim() || $('title').text().trim();
    const songTitle = pageTitle
      .replace(/\s+Song\s+Lyrics$/i, '')
      .replace(/\s+Lyrics$/i, '')
      .replace(/\s*[-–|].*$/, '')
      .trim();

    // Extract lyrics from .mainlyricscontent
    const $content = $('.mainlyricscontent').first();

    // Remove scripts, ads, non-lyrics elements
    $content.find('script, style, .adsbygoogle, ins, noscript, .code-block').remove();

    // Get singer and music info from the content header
    const contentText = $content.text();
    const singerMatch = contentText.match(/Singer\s*:\s*(.+?)(?:\n|Music|Lyrics|$)/i);
    const musicByMatch = contentText.match(/Music\s*(?:by)?\s*:\s*(.+?)(?:\n|Singer|Lyrics|$)/i);
    const lyricistMatch = contentText.match(/(?:Lyrics?\s*(?:by)?|Lyricist)\s*:\s*(.+?)(?:\n|Singer|Music|$)/i);

    // Extract actual lyrics lines — skip metadata lines at the top
    const allText = $content.text().trim();
    const lines = allText.split('\n').map((l) => l.trim());

    // Skip header lines (English/Tamil toggle, Singer:, Music by:, etc.)
    const lyricsStartIndex = lines.findIndex((line, idx) => {
      if (idx < 2) return false; // Skip first couple lines (language toggles)
      return (
        line.length > 0 &&
        !line.match(/^(English|தமிழ்|Singer|Music|Lyrics?|Lyricist|Album|Movie|Film|Year|Artist)\s*:?/i) &&
        !line.match(/^(Singer|Music by|Lyrics by)\s*:/i) &&
        line.length > 3
      );
    });

    const lyricsLines = lines
      .slice(Math.max(0, lyricsStartIndex))
      .filter((line) => line.length > 0);

    const cleanLyrics = lyricsLines.join('\n');

    return NextResponse.json({
      id: songUrl,
      song_title: songTitle,
      movie_name: movieMatch?.[1]?.trim() || '',
      singer: singerMatch?.[1]?.trim() || artistMatch?.[1]?.trim() || '',
      music_director: musicByMatch?.[1]?.trim() || musicMatch?.[1]?.trim() || '',
      lyricist: lyricistMatch?.[1]?.trim() || '',
      year: 0,
      lyrics: cleanLyrics,
      url: songUrl,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch lyrics' }, { status: 500 });
  }
}
