import { NextRequest, NextResponse } from 'next/server';

const GEMINI_MODEL = 'gemini-2.5-pro-preview-05-06';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const PERPLEXITY_MODEL = 'sonar-pro';

const LENGTH_MAP: Record<string, string> = {
  short: '4-line song (single verse or hook)',
  medium: '8-12 line song (2 verses + chorus)',
  long: '16-24 line song (full verse-chorus-verse-bridge-chorus)',
  full_song: '32+ line full song with all sections including intro, verses, choruses, bridge, and outro',
};

const SYSTEM_PROMPT = `You are an expert Tamil/Indian lyricist and music director AI. You write original song lyrics and suggest complementary musical arrangements.

CRITICAL RULES:
1. Write ORIGINAL lyrics only. Never reproduce existing copyrighted songs.
2. Use the Suno.com custom lyric format with section tags on their own lines:
   [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro], [Instrumental], [Hook], [Ad-lib]
3. For Tamil/Indian structures: Pallavi → [Chorus], Anupallavi → [Verse], Charanam → [Bridge]
4. Each section tag must be on its own line, followed by the lyrics for that section.
5. Maintain consistent meter and rhyme scheme appropriate to the chosen genre.
6. For Tamil lyrics: use romanized Tamil (transliteration) that is easy to read and sing. Include Tamil script in parentheses for key phrases if appropriate.
7. For mixed language: indicate language switches naturally.

OUTPUT FORMAT - You MUST respond with valid JSON only, no markdown, no code blocks:
{
  "lyrics": "Complete lyrics with [Section] tags, each section separated by blank lines",
  "stylePrompt": "A 200-400 character style prompt for Suno.ai describing the musical style, mood, tempo, and production that complements these lyrics",
  "instruments": ["instrument_id_1", "instrument_id_2", "instrument_id_3"],
  "title": "Suggested song title",
  "notes": "Brief notes about creative choices (1-2 sentences)"
}

VALID INSTRUMENT IDS (pick 3-6 most appropriate):
veena, nadaswaram, violin_carnatic, flute_bansuri, flute_venu, harmonium, sitar, santoor, shehnai, sarangi, tanpura,
mridangam, tabla, ghatam, kanjira, thavil, dholak, parai, drum_kit, electronic_drums, congas_bongos,
acoustic_guitar_steel, acoustic_guitar_nylon, electric_guitar_clean, electric_guitar_crunch, bass_guitar, synth_bass,
piano, keyboard_synth, strings_ensemble, brass_section, synth_pad, synth_lead, temple_bells,
saxophone, trumpet, clarinet, cello, mandolin, accordion`;

function buildUserPrompt(config: LyricWriterConfig): string {
  const lengthDesc = LENGTH_MAP[config.length] || LENGTH_MAP.medium;

  let prompt = `Write a ${lengthDesc} original song with these specifications:

LANGUAGE: ${config.language}
MOOD/EMOTION: ${config.mood}
GENRE/STYLE: ${config.genre}
THEMES: ${config.themes.join(', ')}
DECADE INFLUENCE: ${config.decadeInfluence} era sound and sensibility
SONG STRUCTURE: ${config.songType === 'pallavi_anupallavi_charanam' ? 'Pallavi-Anupallavi-Charanam (traditional Tamil structure)' : config.songType === 'freestyle' ? 'Freestyle / free-form' : 'Verse-Chorus structure'}
LENGTH: ${lengthDesc}`;

  if (config.lyricistStyle && config.lyricistStyle !== 'custom') {
    const lyricistNames: Record<string, string> = {
      kannadasan: 'Kannadasan',
      vairamuthu: 'Vairamuthu',
      vaali: 'Vaali',
      thamarai: 'Thamarai',
      na_muthukumar: 'Na. Muthukumar',
      vivek: 'Vivek',
      yugabharathi: 'Yugabharathi',
      snehan: 'Snehan',
      arunraja_kamaraj: 'Arunraja Kamaraj',
      kabilan: 'Kabilan',
      pa_vijay: 'Pa. Vijay',
      piraisoodan: 'Piraisoodan',
    };
    const name = lyricistNames[config.lyricistStyle] || config.lyricistStyle;
    prompt += `\nLYRICIST STYLE: Write in the style of ${name} — capture their signature poetic devices, vocabulary patterns, and thematic approach`;
  }

  if (config.inspiration) {
    prompt += `\n\nINSPIRATION REFERENCE (use as creative direction, do NOT copy):\n"${config.inspiration.substring(0, 300)}"`;
  }

  if (config.customPrompt) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS: ${config.customPrompt}`;
  }

  prompt += `\n\nRemember: Output valid JSON only. No markdown code blocks. Use the exact format specified.`;

  return prompt;
}

interface LyricWriterConfig {
  language: string;
  mood: string;
  genre: string;
  themes: string[];
  decadeInfluence: string;
  lyricistStyle: string;
  songType: string;
  length: string;
  customPrompt: string;
  inspiration?: string;
}

interface LLMResult {
  provider: string;
  model: string;
  lyrics: string;
  stylePrompt: string;
  instruments: string[];
  title: string;
  notes: string;
  status: 'success' | 'error';
  error?: string;
  latencyMs: number;
}

function parseLLMResponse(raw: string): { lyrics: string; stylePrompt: string; instruments: string[]; title: string; notes: string } {
  // Strip markdown code blocks if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  // Try JSON parse
  const parsed = JSON.parse(cleaned);
  return {
    lyrics: parsed.lyrics || '',
    stylePrompt: parsed.stylePrompt || parsed.style_prompt || '',
    instruments: Array.isArray(parsed.instruments) ? parsed.instruments : [],
    title: parsed.title || '',
    notes: parsed.notes || '',
  };
}

async function callGemini(systemPrompt: string, userPrompt: string): Promise<LLMResult> {
  const start = Date.now();
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) throw new Error('GOOGLE_AI_API_KEY not set');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API ${response.status}: ${err.substring(0, 200)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = parseLLMResponse(text);

    return {
      provider: 'gemini',
      model: GEMINI_MODEL,
      status: 'success',
      latencyMs: Date.now() - start,
      ...parsed,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { provider: 'gemini', model: GEMINI_MODEL, status: 'error', error: msg, latencyMs: Date.now() - start, lyrics: '', stylePrompt: '', instruments: [], title: '', notes: '' };
  }
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<LLMResult> {
  const start = Date.now();
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        temperature: 0.8,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API ${response.status}: ${err.substring(0, 200)}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const parsed = parseLLMResponse(text);

    return {
      provider: 'claude',
      model: CLAUDE_MODEL,
      status: 'success',
      latencyMs: Date.now() - start,
      ...parsed,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { provider: 'claude', model: CLAUDE_MODEL, status: 'error', error: msg, latencyMs: Date.now() - start, lyrics: '', stylePrompt: '', instruments: [], title: '', notes: '' };
  }
}

async function callPerplexity(systemPrompt: string, userPrompt: string): Promise<LLMResult> {
  const start = Date.now();
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) throw new Error('PERPLEXITY_API_KEY not set');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: PERPLEXITY_MODEL,
        temperature: 0.85,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Perplexity API ${response.status}: ${err.substring(0, 200)}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const parsed = parseLLMResponse(text);

    return {
      provider: 'perplexity',
      model: PERPLEXITY_MODEL,
      status: 'success',
      latencyMs: Date.now() - start,
      ...parsed,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return { provider: 'perplexity', model: PERPLEXITY_MODEL, status: 'error', error: msg, latencyMs: Date.now() - start, lyrics: '', stylePrompt: '', instruments: [], title: '', notes: '' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json() as { config: LyricWriterConfig };

    if (!config || !config.language || !config.mood || !config.genre) {
      return NextResponse.json({ error: 'Invalid config' }, { status: 400 });
    }

    const userPrompt = buildUserPrompt(config);

    // Call all 3 LLMs in parallel
    const results = await Promise.all([
      callGemini(SYSTEM_PROMPT, userPrompt),
      callClaude(SYSTEM_PROMPT, userPrompt),
      callPerplexity(SYSTEM_PROMPT, userPrompt),
    ]);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Lyric generation error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
