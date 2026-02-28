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
    const metaDesc = $('meta[name="description"]').attr('content') || '';

    const movieMatch = metaDesc.match(/Movie\s*(?:Name)?\s*:\s*([^,]+?)(?:\s*,\s*(?:Artists?|Music|Lyrics|Singer)|\s*$)/i);
    const artistMatch = metaDesc.match(/Artists?\s*:\s*(.+?)(?:\s*,\s*(?:Music|Lyrics)|\s*$)/i);
    const musicMatch = metaDesc.match(/Music\s*(?:Director)?\s*:\s*(.+?)(?:\s*,\s*(?:Lyrics|Artists?)|\s*$)/i);
    const lyricistMatch = metaDesc.match(/Lyrics?\s*(?:by)?\s*:\s*(.+?)(?:\s*,\s*(?:Music|Artists?)|\s*$)/i);

    // Extract song title from h1 or page title
    const pageTitle = $('h1').first().text().trim()
      || $('title').text().trim();
    const songTitle = pageTitle
      .replace(/\s+Song\s+Lyrics$/i, '')
      .replace(/\s+Lyrics$/i, '')
      .replace(/\s*[-–|].*$/, '')
      .trim();

    // Extract lyrics from entry content
    const $content = $('div.entry-content, div.post-content, article .entry-content').first();

    // Remove ads, scripts, share buttons, related posts
    $content.find('script, style, .sharedaddy, .jp-relatedposts, .adsbygoogle, ins, .code-block, noscript').remove();

    // Get text content and clean up
    const rawLyrics = $content.text().trim();

    // Clean lyrics: remove metadata lines at the top, keep actual lyrics
    const lyricsLines = rawLyrics.split('\n').map((l) => l.trim());
    const lyricsStartIndex = lyricsLines.findIndex((line) =>
      line.length > 0 &&
      !line.match(/^(Song|Movie|Film|Music|Lyrics|Singer|Artist|Director|Starring|Year|Album)\s*:/i) &&
      !line.match(/^\d{4}$/) // Year
    );

    const cleanLyrics = lyricsLines
      .slice(Math.max(0, lyricsStartIndex))
      .filter((line) => line.length > 0)
      .join('\n');

    return NextResponse.json({
      id: songUrl,
      song_title: songTitle,
      movie_name: movieMatch?.[1]?.trim() || '',
      singer: artistMatch?.[1]?.trim() || '',
      music_director: musicMatch?.[1]?.trim() || '',
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
