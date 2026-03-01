/**
 * AiSwara Music Studio - Lyric Writer Types & Constants
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type LyricLanguage = 'tamil' | 'hindi' | 'english' | 'telugu' | 'kannada' | 'malayalam' | 'sanskrit' | 'mixed';
export type LyricMood = 'happy' | 'sad' | 'romantic' | 'devotional' | 'angry' | 'melancholy' | 'hopeful' | 'nostalgic' | 'playful' | 'intense' | 'peaceful' | 'longing';
export type LyricGenre = 'carnatic' | 'gaana' | 'rap' | 'ballad' | 'kuthu' | 'classic_poetic' | 'folk' | 'film' | 'devotional' | 'lullaby';
export type SongType = 'verse_chorus' | 'pallavi_anupallavi_charanam' | 'freestyle';
export type LyricLength = 'short' | 'medium' | 'long' | 'full_song';

// ============================================================================
// CONSTANT ARRAYS FOR UI DROPDOWNS
// ============================================================================

export const LANGUAGE_OPTIONS: { value: LyricLanguage; label: string }[] = [
  { value: 'tamil', label: 'Tamil' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'english', label: 'English' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'sanskrit', label: 'Sanskrit' },
  { value: 'mixed', label: 'Mixed / Bilingual' },
];

export const MOOD_OPTIONS: { value: LyricMood; label: string; icon: string }[] = [
  { value: 'happy', label: 'Happy', icon: '😊' },
  { value: 'sad', label: 'Sad', icon: '😢' },
  { value: 'romantic', label: 'Romantic', icon: '❤️' },
  { value: 'devotional', label: 'Devotional', icon: '🙏' },
  { value: 'angry', label: 'Angry', icon: '😠' },
  { value: 'melancholy', label: 'Melancholy', icon: '🌧️' },
  { value: 'hopeful', label: 'Hopeful', icon: '🌅' },
  { value: 'nostalgic', label: 'Nostalgic', icon: '📷' },
  { value: 'playful', label: 'Playful', icon: '🎭' },
  { value: 'intense', label: 'Intense', icon: '🔥' },
  { value: 'peaceful', label: 'Peaceful', icon: '☮️' },
  { value: 'longing', label: 'Longing', icon: '💭' },
];

export const GENRE_OPTIONS: { value: LyricGenre; label: string; description: string }[] = [
  { value: 'carnatic', label: 'Carnatic', description: 'Classical Carnatic composition style' },
  { value: 'gaana', label: 'Gaana', description: 'Chennai street-style folk rap' },
  { value: 'rap', label: 'Rap', description: 'Tamil hip-hop and rap flow' },
  { value: 'ballad', label: 'Ballad', description: 'Slow, emotional storytelling' },
  { value: 'kuthu', label: 'Kuthu', description: 'High-energy dance beats' },
  { value: 'classic_poetic', label: 'Classic Poetic', description: 'Rich literary Tamil poetry' },
  { value: 'folk', label: 'Folk', description: 'Traditional village folk songs' },
  { value: 'film', label: 'Film', description: 'Tamil cinema song style' },
  { value: 'devotional', label: 'Devotional', description: 'Spiritual and temple music' },
  { value: 'lullaby', label: 'Lullaby', description: 'Gentle, soothing melodies' },
];

export const THEME_OPTIONS: { value: string; label: string }[] = [
  { value: 'love', label: 'Love' },
  { value: 'heartbreak', label: 'Heartbreak' },
  { value: 'nature', label: 'Nature' },
  { value: 'god_devotion', label: 'God / Devotion' },
  { value: 'friendship', label: 'Friendship' },
  { value: 'freedom', label: 'Freedom' },
  { value: 'war', label: 'War' },
  { value: 'politics', label: 'Politics' },
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'homeland', label: 'Homeland' },
  { value: 'celebration', label: 'Celebration' },
  { value: 'philosophy', label: 'Philosophy' },
];

export const DECADE_OPTIONS: { value: string; label: string }[] = [
  { value: '60s', label: '1960s' },
  { value: '70s', label: '1970s' },
  { value: '80s', label: '1980s' },
  { value: '90s', label: '1990s' },
  { value: '2000s', label: '2000s' },
  { value: '2010s', label: '2010s' },
  { value: 'modern', label: 'Modern' },
];

export const LYRICIST_OPTIONS: { value: string; label: string }[] = [
  { value: 'kannadasan', label: 'Kannadasan' },
  { value: 'vairamuthu', label: 'Vairamuthu' },
  { value: 'vaali', label: 'Vaali' },
  { value: 'thamarai', label: 'Thamarai' },
  { value: 'na_muthukumar', label: 'Na. Muthukumar' },
  { value: 'vivek', label: 'Vivek' },
  { value: 'yugabharathi', label: 'Yugabharathi' },
  { value: 'snehan', label: 'Snehan' },
  { value: 'arunraja_kamaraj', label: 'Arunraja Kamaraj' },
  { value: 'kabilan', label: 'Kabilan' },
  { value: 'pa_vijay', label: 'Pa. Vijay' },
  { value: 'piraisoodan', label: 'Piraisoodan' },
  { value: 'custom', label: 'Custom Style' },
];

export const SONG_TYPE_OPTIONS: { value: SongType; label: string }[] = [
  { value: 'verse_chorus', label: 'Verse / Chorus' },
  { value: 'pallavi_anupallavi_charanam', label: 'Pallavi / Anupallavi / Charanam' },
  { value: 'freestyle', label: 'Freestyle' },
];

export const LENGTH_OPTIONS: { value: LyricLength; label: string; description: string }[] = [
  { value: 'short', label: 'Short', description: '4-8 lines, single verse' },
  { value: 'medium', label: 'Medium', description: '12-20 lines, verse + chorus' },
  { value: 'long', label: 'Long', description: '24-32 lines, full structure' },
  { value: 'full_song', label: 'Full Song', description: '40+ lines, complete song' },
];

// ============================================================================
// INTERFACES
// ============================================================================

export interface LyricWriterConfig {
  language: LyricLanguage;
  mood: LyricMood;
  genre: LyricGenre;
  themes: string[];
  decadeInfluence: string;
  lyricistStyle: string;
  songType: SongType;
  length: LyricLength;
  customPrompt: string;
}

export interface LLMResult {
  provider: string;
  model: string;
  lyrics: string;
  stylePrompt: string;
  instruments: string[];
  title: string;
  notes: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  latencyMs: number;
}

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_LYRIC_CONFIG: LyricWriterConfig = {
  language: 'tamil',
  mood: 'romantic',
  genre: 'film',
  themes: ['love'],
  decadeInfluence: '2000s',
  lyricistStyle: 'vairamuthu',
  songType: 'verse_chorus',
  length: 'medium',
  customPrompt: '',
};
