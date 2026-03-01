#!/usr/bin/env node

// seed-lyrics.mjs — Scrape tamil2lyrics.com and seed Supabase tamil_lyrics table

const SUPABASE_URL = 'https://mbtqrzpnombaqpwuspmm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = 'https://www.tamil2lyrics.com';

const SEARCH_TERMS = [
  'love', 'kaadhal', 'ennai', 'nenjil', 'vaa', 'poo', 'thendral', 'mazhai',
  'ilaiyaraaja', 'ar rahman', 'harris jayaraj', 'anirudh', 'yuvan', 'dhanush',
  'rajini', 'vijay', 'ajith', 'nee', 'en', 'kadhal', 'kannamma', 'raaja',
  'ponnu', 'megam', 'azhagu', 'kuthu', 'pattu', 'idhayam', 'vennilave',
  'munbe', 'oru', 'un', 'thamizh', 'verithanam', 'suriya', 'kamal',
  'sid sriram', 'shreya', 'chitra', 'janaki',
  'shankar mahadevan', 'hariharan', 'unnikrishnan', 'karthik', 'thulluvadho',
  'roja', 'bombay', 'gentleman', 'vaali', 'vairamuthu',
  'ilayaraja', 'imman', 'gv prakash', 'hip hop tamizha',
  'santhosh narayanan', 'sean roldan', 'naan', 'kadavul', 'ponnin',
  'theri', 'mersal', 'master', 'beast', 'bigil', 'leo', 'jailer',
  'viduthalai', 'maamannan', 'ponniyin', 'thunivu', 'vikram',
  'aranmanai', 'maari', 'enthiran'
];

const MAX_PAGES_PER_SEARCH = 3;
const delay = (ms) => new Promise(r => setTimeout(r, ms));

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
  
  // Format: <div class="col-lg-6 col-sm-6 col-xs-6"><a href="URL">Title</a></div>
  const linkRegex = /<div[^>]*class="col-lg-6[^"]*"[^>]*>\s*<a[^>]*href="([^"]+\/lyrics\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1].trim();
    const songTitle = decodeHtmlEntities(match[2]).trim();
    if (url && songTitle) {
      results.push({ song_title: songTitle, url });
    }
  }
  
  return results;
}

function hasNextPage(html) {
  return html.includes('<link rel="next"') || html.includes('OLDER POST');
}

function parseSongPage(html, song) {
  // Extract lyrics from mainlyricscontent
  let lyrics = '';
  const lyricsMatch = html.match(/class="mainlyricscontent">([\s\S]*?)(?:<div[^>]*class="[^"]*same-album|<div[^>]*id="ad-footer|<div[^>]*class="[^"]*sidebar|$)/);
  if (lyricsMatch) {
    let raw = lyricsMatch[1];
    // Remove buttons, scripts, ads, iframes
    raw = raw.replace(/<button[^>]*>[\s\S]*?<\/button>/g, '');
    raw = raw.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '');
    raw = raw.replace(/<ins[^>]*>[\s\S]*?<\/ins>/g, '');
    raw = raw.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/g, '');
    raw = raw.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
    // Replace br and p with newlines
    raw = raw.replace(/<br\s*\/?>/gi, '\n');
    raw = raw.replace(/<\/p>/gi, '\n');
    raw = raw.replace(/<p[^>]*>/gi, '');
    // Strip remaining tags
    raw = raw.replace(/<[^>]*>/g, '');
    lyrics = decodeHtmlEntities(raw)
      .replace(/\(adsbygoogle[\s\S]*?\)\.push\(\{\}\);?/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  
  // Extract title from <title> tag: "Song Title - Movie Tamil Film - Year"
  let movieName = null;
  let year = null;
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
  if (titleMatch) {
    const titleText = decodeHtmlEntities(titleMatch[1]);
    const titleParts = titleText.match(/^.+?\s*[-–]\s*(.+?)\s+(?:Tamil\s+)?Film\s*[-–]\s*(\d{4})/i);
    if (titleParts) {
      movieName = titleParts[1].trim();
      const y = parseInt(titleParts[2]);
      if (y >= 1950 && y <= 2026) year = y;
    }
  }
  
  // Also try movie from the "in <a>" link in header
  if (!movieName) {
    const movieLinkMatch = html.match(/in <a[^>]*href="[^"]*\/movies\/[^"]*"[^>]*>([^<]+)<\/a>/);
    if (movieLinkMatch) {
      movieName = decodeHtmlEntities(movieLinkMatch[1]).trim();
    }
  }
  
  // Extract metadata from lyrics text
  let singer = null;
  const singerMatch = lyrics.match(/Singer\s*(?:\(s\))?\s*:\s*([^\n]+)/i);
  if (singerMatch) {
    singer = singerMatch[1].trim();
    if (singer.length > 150) singer = singer.substring(0, 150);
  }
  if (!singer) {
    const altSinger = html.match(/sung by\s+([^.<\n]+)/i);
    if (altSinger) singer = decodeHtmlEntities(stripTags(altSinger[1])).trim();
  }
  
  let musicDirector = null;
  const mdMatch = lyrics.match(/Music\s+Director\s*:\s*([^\n]+)/i);
  if (mdMatch) {
    musicDirector = mdMatch[1].trim();
    if (musicDirector.length > 150) musicDirector = musicDirector.substring(0, 150);
  }
  if (!musicDirector) {
    const altMd = html.match(/music was composed by\s+([^.<\n]+)/i);
    if (altMd) musicDirector = decodeHtmlEntities(stripTags(altMd[1])).trim();
  }
  
  let lyricist = null;
  const lyricistMatch = lyrics.match(/Lyricist\s*:\s*([^\n]+)/i);
  if (lyricistMatch) {
    lyricist = lyricistMatch[1].trim();
    if (lyricist.length > 150) lyricist = lyricist.substring(0, 150);
  }
  if (!lyricist) {
    const altLyr = html.match(/penned by\s+([^.<\n]+)/i);
    if (altLyr) lyricist = decodeHtmlEntities(stripTags(altLyr[1])).trim();
  }
  // Also try lyricist from the header h3 link (shown above song title)
  if (!lyricist) {
    const headerLyricist = html.match(/<h3><a[^>]*href="[^"]*\/Lyricist\/[^"]*"[^>]*>([^<]+)<\/a>/);
    if (headerLyricist) lyricist = decodeHtmlEntities(headerLyricist[1]).trim();
  }
  
  // Try year from meta if not found
  if (!year) {
    const yearMatch = html.match(/Tamil\s+Film\s*[-–]\s*(\d{4})/i);
    if (yearMatch) {
      const y = parseInt(yearMatch[1]);
      if (y >= 1950 && y <= 2026) year = y;
    }
  }
  
  // Clean lyrics: remove intro paragraph and metadata
  let cleanLyrics = lyrics;
  // Remove everything before the actual lyrics start
  // The metadata section ends after "Lyricist : Name" line
  const lyricistLineEnd = cleanLyrics.search(/Lyricist\s*:\s*[^\n]+\n/i);
  if (lyricistLineEnd > -1) {
    const afterLyricist = cleanLyrics.indexOf('\n', lyricistLineEnd + 10);
    if (afterLyricist > -1) {
      cleanLyrics = cleanLyrics.substring(afterLyricist).trim();
    }
  } else {
    // Try removing intro paragraph
    const introEnd = cleanLyrics.search(/(?:Music Director\s*:[^\n]*\n)/i);
    if (introEnd > -1) {
      const afterIntro = cleanLyrics.indexOf('\n', introEnd + 10);
      if (afterIntro > -1) {
        cleanLyrics = cleanLyrics.substring(afterIntro).trim();
      }
    }
  }
  
  // Remove tab labels like "English" / "தமிழ்" at the start
  cleanLyrics = cleanLyrics.replace(/^(?:English|தமிழ்|Tamil)\s*\n*/gi, '').trim();
  
  // If cleaned is too short, fall back
  if (cleanLyrics.length < 30 && lyrics.length > cleanLyrics.length) {
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
    
    console.log(`\n[SEARCH] "${term}" page ${page}`);
    
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
      
      process.stdout.write(`  ${song.song_title}...`);
      const songHtml = await fetchPage(song.url);
      if (!songHtml) {
        console.log(' FAILED');
        continue;
      }
      
      const songData = parseSongPage(songHtml, song);
      
      if (!songData.full_lyrics || songData.full_lyrics.length < 30) {
        console.log(` skip (${songData.full_lyrics?.length || 0} chars)`);
        totalSkipped++;
        continue;
      }
      
      const ok = await upsertSong(songData);
      if (ok) {
        totalInserted++;
        totalForTerm++;
        console.log(` OK #${totalInserted} [${songData.movie_name || '?'}] [${songData.full_lyrics.length}c]`);
      } else {
        totalErrors++;
        console.log(' DB_ERR');
      }
    }
    
    if (!hasNextPage(html)) break;
    await delay(500);
  }
  
  return totalForTerm;
}

async function main() {
  console.log('=== AiSwara Tamil Lyrics Seeder ===');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log(`Search terms: ${SEARCH_TERMS.length}`);
  console.log(`Max pages/search: ${MAX_PAGES_PER_SEARCH}`);
  console.log(`Started: ${new Date().toISOString()}\n`);
  
  // Verify Supabase connectivity
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
      console.error(`[FATAL] Supabase: ${testRes.status} ${err}`);
      process.exit(1);
    }
    console.log('[OK] Supabase connected\n');
  } catch (err) {
    console.error(`[FATAL] Cannot reach Supabase: ${err.message}`);
    process.exit(1);
  }
  
  for (let i = 0; i < SEARCH_TERMS.length; i++) {
    await processSearchTerm(SEARCH_TERMS[i]);
    await delay(700);
    
    if ((i + 1) % 10 === 0) {
      console.log(`\n>>> PROGRESS: ${i + 1}/${SEARCH_TERMS.length} terms | ${totalInserted} inserted | ${totalErrors} err | ${totalSkipped} skip | ${seenUrls.size} URLs <<<\n`);
    }
  }
  
  console.log(`\n=== DONE ===`);
  console.log(`Total inserted/updated: ${totalInserted}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Total skipped: ${totalSkipped}`);
  console.log(`Unique URLs: ${seenUrls.size}`);
  console.log(`Finished: ${new Date().toISOString()}`);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
