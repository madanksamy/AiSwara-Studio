#!/usr/bin/env node

// seed-lyrics.mjs — Scrape tamil2lyrics.com and seed Supabase tamil_lyrics table

const SUPABASE_URL = 'https://mbtqrzpnombaqpwuspmm.supabase.co';
const SUPABASE_KEY = '***REDACTED***';
const BASE_URL = 'https://www.tamil2lyrics.com';

const SEARCH_TERMS = [
  'love', 'kaadhal', 'ennai', 'nenjil', 'vaa', 'poo', 'thendral', 'mazhai',
  'ilaiyaraaja', 'ar rahman', 'harris jayaraj', 'anirudh', 'yuvan', 'dhanush',
  'rajini', 'vijay', 'ajith', 'nee', 'en', 'kadhal', 'kannamma', 'raaja',
  'ponnu', 'megam', 'azhagu', 'kuthu', 'pattu', 'idhayam', 'vennilave',
  'munbe vaa', 'oru', 'un', 'thamizh', 'verithanam', 'suriya', 'kamal',
  'sid sriram', 'shreya ghoshal', 'spb', 'chitra', 'janaki', 'yesudas',
  'shankar mahadevan', 'hariharan', 'unnikrishnan', 'karthik', 'thulluvadho',
  'roja', 'bombay', 'thiruda', 'gentleman', 'vaali', 'vairamuthu',
  'ilayaraja', 'rahman', 'imman', 'gv prakash', 'hip hop tamizha',
  'santhosh narayanan', 'sean roldan'
];

const MAX_PAGES_PER_SEARCH = 3; // Up to 3 pages per search (30 results)
const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Track all seen URLs to avoid duplicates
const seenUrls = new Set();
let totalInserted = 0;
let totalErrors = 0;
let totalSkipped = 0;

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.log(`  [WARN] HTTP ${res.status} for ${url}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.log(`  [ERR] Fetch failed for ${url}: ${err.message}`);
    return null;
  }
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-');
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

function parseSearchResults(html) {
  const results = [];
  
  // Match article blocks that are type-lyrics (not type-album)
  const articleRegex = /<article[^>]*type-lyrics[^>]*>([\s\S]*?)<\/article>/g;
  let match;
  
  while ((match = articleRegex.exec(html)) !== null) {
    const block = match[1];
    
    // Extract the h3 > a link (song title + URL)
    const h3LinkMatch = block.match(/<h3[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!h3LinkMatch) continue;
    
    const url = h3LinkMatch[1].trim();
    const songTitle = decodeHtmlEntities(stripTags(h3LinkMatch[2])).trim();
    
    if (!url || !songTitle) continue;
    // Skip non-lyrics URLs
    if (!url.includes('/lyrics/')) continue;
    
    results.push({ song_title: songTitle, url });
  }
  
  return results;
}

function hasNextPage(html) {
  return html.includes('OLDER POST') || html.includes('next page-numbers');
}

function parseSongPage(html, song) {
  // Extract lyrics from mainlyricscontent
  let lyrics = '';
  const lyricsMatch = html.match(/<div class="mainlyricscontent">([\s\S]*?)(?:<div class="margint20 same-album"|<div[^>]*class="[^"]*same-album|<div[^>]*id="ad-|<footer)/);
  if (lyricsMatch) {
    let raw = lyricsMatch[1];
    // Remove tablink buttons and script/ad blocks
    raw = raw.replace(/<button[^>]*>[\s\S]*?<\/button>/g, '');
    raw = raw.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
    raw = raw.replace(/<ins[^>]*>[\s\S]*?<\/ins>/g, '');
    raw = raw.replace(/<div[^>]*class="[^"]*ad[^"]*"[^>]*>[\s\S]*?<\/div>/g, '');
    // Replace br and p with newlines
    raw = raw.replace(/<br\s*\/?>/gi, '\n');
    raw = raw.replace(/<\/p>/gi, '\n');
    raw = raw.replace(/<p[^>]*>/gi, '');
    // Strip remaining tags
    raw = raw.replace(/<[^>]*>/g, '');
    lyrics = decodeHtmlEntities(raw)
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();
  }
  
  // Extract title from <title> tag: "Song Title - Movie Tamil Film - Year"
  let movieName = null;
  let year = null;
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
  if (titleMatch) {
    const titleText = decodeHtmlEntities(titleMatch[1]);
    // Pattern: "Song Title - Movie (Tamil Film) - Year"
    const titleParts = titleText.match(/^.+?\s*[-–]\s*(.+?)\s+(?:Tamil\s+)?Film\s*[-–]\s*(\d{4})/i);
    if (titleParts) {
      movieName = titleParts[1].trim();
      const y = parseInt(titleParts[2]);
      if (y >= 1950 && y <= 2026) year = y;
    }
  }
  
  // Also try movie from the "in <a href='...movies/...'>" link in header
  if (!movieName) {
    const movieLinkMatch = html.match(/in <a[^>]*href="[^"]*\/movies\/[^"]*"[^>]*>([^<]+)<\/a>/);
    if (movieLinkMatch) {
      movieName = decodeHtmlEntities(movieLinkMatch[1]).trim();
    }
  }
  
  // Extract singer from lyrics text: "Singer : Name" or "Singer(s) : Name"
  let singer = null;
  const singerMatch = lyrics.match(/Singer\s*(?:\(s\))?\s*:\s*([^\n]+)/i) || 
                       html.match(/Singer\s*(?:\(s\))?\s*:\s*<\/\w+>\s*([^<\n]+)/i) ||
                       html.match(/sung by\s+([^.<\n]+)/i);
  if (singerMatch) {
    singer = singerMatch[1].trim().replace(/^\s*<[^>]*>\s*/, '');
    if (singer.length > 150) singer = singer.substring(0, 150);
  }
  
  // Extract music director
  let musicDirector = null;
  const mdMatch = lyrics.match(/Music\s+Director\s*:\s*([^\n]+)/i) ||
                   html.match(/Music\s+Director\s*:\s*<\/\w+>\s*([^<\n]+)/i) ||
                   html.match(/music was composed by\s+([^.<\n]+)/i);
  if (mdMatch) {
    musicDirector = mdMatch[1].trim().replace(/^\s*<[^>]*>\s*/, '');
    if (musicDirector.length > 150) musicDirector = musicDirector.substring(0, 150);
  }
  
  // Extract lyricist
  let lyricist = null;
  const lyricistMatch = lyrics.match(/Lyricist\s*:\s*([^\n]+)/i) ||
                         html.match(/Lyricist\s*:\s*<\/\w+>\s*([^<\n]+)/i) ||
                         html.match(/penned by\s+([^.<\n]+)/i);
  if (lyricistMatch) {
    lyricist = lyricistMatch[1].trim().replace(/^\s*<[^>]*>\s*/, '');
    if (lyricist.length > 150) lyricist = lyricist.substring(0, 150);
  }
  
  // Try year from meta description if not found in title
  if (!year) {
    const metaMatch = html.match(/content="[^"]*(\d{4})[^"]*Tamil\s+Film/i) ||
                      html.match(/Tamil\s+Film\s*[-–]\s*(\d{4})/i);
    if (metaMatch) {
      const y = parseInt(metaMatch[1]);
      if (y >= 1950 && y <= 2026) year = y;
    }
  }
  
  // Clean up lyrics: remove the metadata lines (Singer, Music Director, Lyricist, etc.) from lyrics text
  // Keep only the actual song lyrics
  let cleanLyrics = lyrics;
  // Remove the intro paragraph (usually starts with song title and contains "is the track from")
  cleanLyrics = cleanLyrics.replace(/^[\s\S]*?(?:Lyrics works penned by[^\n]*\n|Lyricist\s*:[^\n]*\n)/i, '');
  // If that didn't work, try removing lines with metadata
  if (cleanLyrics === lyrics) {
    cleanLyrics = cleanLyrics
      .replace(/^.*is the track from[\s\S]*?(?=\n[A-Z][a-z]|\n\n)/i, '')
      .replace(/Singer\s*(?:\(s\))?\s*:[^\n]*/gi, '')
      .replace(/Music\s+Director\s*:[^\n]*/gi, '')
      .replace(/Lyricist\s*:[^\n]*/gi, '')
      .replace(/Starring[^\n]*/gi, '');
  }
  cleanLyrics = cleanLyrics.replace(/^\s*\n+/, '').trim();
  
  // If cleaned lyrics is too short, fall back to original
  if (cleanLyrics.length < 50 && lyrics.length > cleanLyrics.length) {
    cleanLyrics = lyrics;
  }
  
  return {
    song_title: song.song_title,
    movie_name: movieName || null,
    singer: singer || null,
    lyricist: lyricist || null,
    music_director: musicDirector || null,
    year: year || null,
    lyrics_preview: cleanLyrics ? cleanLyrics.substring(0, 500) : null,
    full_lyrics: cleanLyrics || null,
    url: song.url,
    source: 'tamil2lyrics.com',
  };
}

async function upsertSong(songData) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/tamil_lyrics`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(songData),
      signal: AbortSignal.timeout(10000),
    });
    
    if (!res.ok) {
      const errText = await res.text();
      console.log(`  [DB ERR] ${res.status}: ${errText.substring(0, 200)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.log(`  [DB ERR] ${err.message}`);
    return false;
  }
}

async function processSearchTerm(term) {
  let totalForTerm = 0;
  
  for (let page = 1; page <= MAX_PAGES_PER_SEARCH; page++) {
    const searchUrl = page === 1
      ? `${BASE_URL}/?s=${encodeURIComponent(term)}&post_type=lyrics`
      : `${BASE_URL}/page/${page}/?s=${encodeURIComponent(term)}&post_type=lyrics`;
    
    console.log(`\n[SEARCH] "${term}" page ${page} -> ${searchUrl}`);
    
    const html = await fetchPage(searchUrl);
    if (!html) break;
    
    let results = parseSearchResults(html);
    
    // Deduplicate against global set
    const newResults = results.filter(r => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    });
    
    console.log(`  Found ${results.length} songs (${newResults.length} new)`);
    
    if (newResults.length === 0) break;
    
    for (const song of newResults) {
      await delay(500);
      
      console.log(`  Fetching: ${song.song_title}`);
      const songHtml = await fetchPage(song.url);
      if (!songHtml) continue;
      
      const songData = parseSongPage(songHtml, song);
      
      // Skip songs with no/minimal lyrics content
      if (!songData.full_lyrics || songData.full_lyrics.length < 30) {
        console.log(`    -> Skipped (no/minimal lyrics: ${songData.full_lyrics?.length || 0} chars)`);
        totalSkipped++;
        continue;
      }
      
      const ok = await upsertSong(songData);
      if (ok) {
        totalInserted++;
        totalForTerm++;
        console.log(`    -> OK #${totalInserted} [${songData.movie_name || '?'}] [${songData.full_lyrics.length} chars]`);
      } else {
        totalErrors++;
      }
    }
    
    // Check if there's a next page
    if (!hasNextPage(html)) break;
    await delay(500);
  }
  
  return totalForTerm;
}

async function main() {
  console.log('=== AiSwara Tamil Lyrics Seeder ===');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`Search terms: ${SEARCH_TERMS.length}`);
  console.log(`Max pages per search: ${MAX_PAGES_PER_SEARCH}`);
  console.log(`Started: ${new Date().toISOString()}\n`);
  
  // First verify Supabase connectivity
  try {
    const testRes = await fetch(`${SUPABASE_URL}/rest/v1/tamil_lyrics?select=url&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!testRes.ok) {
      const err = await testRes.text();
      console.error(`[FATAL] Supabase connection failed: ${testRes.status} ${err}`);
      process.exit(1);
    }
    const existing = await testRes.json();
    console.log(`[OK] Supabase connected (${existing.length} existing rows in sample)\n`);
  } catch (err) {
    console.error(`[FATAL] Cannot reach Supabase: ${err.message}`);
    process.exit(1);
  }
  
  for (const term of SEARCH_TERMS) {
    await processSearchTerm(term);
    await delay(700);
    
    // Progress checkpoint every 10 terms
    if (SEARCH_TERMS.indexOf(term) % 10 === 9) {
      console.log(`\n>>> CHECKPOINT: ${totalInserted} inserted, ${totalErrors} errors, ${totalSkipped} skipped, ${seenUrls.size} URLs seen <<<\n`);
    }
  }
  
  console.log(`\n=== DONE ===`);
  console.log(`Total inserted/updated: ${totalInserted}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total skipped (no lyrics): ${totalSkipped}`);
  console.log(`Unique URLs processed: ${seenUrls.size}`);
  console.log(`Finished: ${new Date().toISOString()}`);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
