import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url, type } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    let lyrics = '';
    let metadata = {};

    if (type === 'youtube') {
      // Extract video ID from YouTube URL
      const videoId = extractYouTubeVideoId(url);
      if (videoId) {
        // Try to get captions/lyrics from YouTube
        // In production, you'd use YouTube Data API or a lyrics service
        const result = await fetchYouTubeLyrics(videoId);
        lyrics = result.lyrics;
        metadata = result.metadata;
      }
    } else if (type === 'spotify') {
      // Extract track ID from Spotify URL
      const trackId = extractSpotifyTrackId(url);
      if (trackId) {
        // In production, you'd use Spotify API + lyrics service
        const result = await fetchSpotifyLyrics(trackId);
        lyrics = result.lyrics;
        metadata = result.metadata;
      }
    }

    return NextResponse.json({ lyrics, metadata });
  } catch (error) {
    console.error('Extract lyrics error:', error);
    return NextResponse.json({ error: 'Failed to extract lyrics' }, { status: 500 });
  }
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractSpotifyTrackId(url: string): string | null {
  const pattern = /spotify\.com\/track\/([a-zA-Z0-9]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

async function fetchYouTubeLyrics(videoId: string) {
  // Placeholder - in production, integrate with:
  // 1. YouTube Data API to get video title/description
  // 2. A lyrics service like Genius, Musixmatch, etc.
  // 3. Or scrape from tamillyrics.com based on song title

  return {
    lyrics: `Lyrics extraction for YouTube video ${videoId} - Feature in development`,
    metadata: {
      videoId,
      source: 'youtube',
    },
  };
}

async function fetchSpotifyLyrics(trackId: string) {
  // Placeholder - in production, integrate with:
  // 1. Spotify Web API to get track metadata
  // 2. A lyrics service like Genius, Musixmatch, etc.

  return {
    lyrics: `Lyrics extraction for Spotify track ${trackId} - Feature in development`,
    metadata: {
      trackId,
      source: 'spotify',
    },
  };
}
