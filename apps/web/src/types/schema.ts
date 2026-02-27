/**
 * AiSwara Music Studio - Simplified UI Schema Types
 * These types are used by the UI components and will be mapped
 * to the canonical schema when calling the API
 */

// ============================================================================
// GLOBAL CONFIG
// ============================================================================

export type TargetPlatform = 'suno' | 'heartmula' | 'generic';

export type Genre =
  | 'carnatic_classical'
  | 'carnatic_fusion'
  | 'tamil_film'
  | 'tamil_folk'
  | 'tamil_indie'
  | 'devotional'
  | 'ghazal'
  | 'qawwali'
  | 'bollywood'
  | 'indian_pop'
  | 'indian_rock'
  | 'indian_electronic'
  | 'lofi_indian'
  | 'ambient_indian'
  | 'world_fusion';

export type UseCase =
  | 'background_score'
  | 'standalone_song'
  | 'instrumental'
  | 'meditation'
  | 'workout'
  | 'study'
  | 'party'
  | 'romantic'
  | 'cinematic';

export interface MoodAxes {
  energy: number; // 0-100
  tension: number; // 0-100
  brightness: number; // 0-100
  warmth: number; // 0-100
}

export interface GlobalConfig {
  targetPlatform: TargetPlatform;
  genre: Genre;
  tempo: number; // BPM 40-200
  moodAxes: MoodAxes;
  useCase: UseCase;
}

// ============================================================================
// INSTRUMENTATION
// ============================================================================

export type InstrumentRole = 'lead' | 'supporting' | 'texture';

export interface InstrumentConfig {
  id: string;
  name: string;
  role: InstrumentRole;
  level: number; // 0-1
  style: string;
  adjectives: string[];
}

export interface PercussionConfig {
  kit: string;
  density: number; // 0-100
  fills: number; // 0-100
  complexity?: number; // 0-100
  groove?: string;
  humanFeel?: number; // 0-100
}

export interface Instrumentation {
  instruments: InstrumentConfig[];
  maxInstruments: number;
  percussion: PercussionConfig;
}

// ============================================================================
// VOCALS
// ============================================================================

export type VocalLanguage =
  | 'tamil'
  | 'hindi'
  | 'telugu'
  | 'kannada'
  | 'malayalam'
  | 'sanskrit'
  | 'english'
  | 'instrumental_only';

export type VocalRole = 'lead' | 'duet' | 'chorus' | 'backing' | 'spoken' | 'none';
export type VocalGender = 'male' | 'female' | 'mixed' | 'neutral';
export type VocalTimbre = 'light' | 'medium' | 'heavy' | 'nasal' | 'breathy' | 'resonant' | 'husky';

export type VocalStyle =
  // Classical
  | 'carnatic_classical'
  | 'hindustani_classical'
  | 'semi_classical'
  // Film
  | 'playback_melodic'
  | 'playback_energetic'
  | 'kuthu'
  | 'melody_90s'
  | 'melody_2000s'
  | 'ar_rahman_style'
  | 'ilaiyaraaja_style'
  // Folk
  | 'folk_gaana'
  | 'folk_parai'
  | 'folk_village'
  | 'devotional_soft'
  | 'devotional_bhajan'
  // Contemporary
  | 'pop_contemporary'
  | 'indie_acoustic'
  | 'indie_alternative'
  | 'lofi_chill'
  | 'rnb_smooth'
  | 'soul'
  | 'jazz_vocal'
  | 'rock_vocal'
  | 'electronic_processed'
  | 'rap_flow';

export type PerformanceIntensity = 'subtle' | 'moderate' | 'expressive' | 'intense' | 'dramatic';

export interface VocalConfig {
  language: VocalLanguage;
  role: VocalRole;
  gender: VocalGender;
  timbre: VocalTimbre;
  styles: VocalStyle[];
  performance: PerformanceIntensity;
  level: number; // 0-1
  harmonies: boolean;
}

// ============================================================================
// ORNAMENTATION
// ============================================================================

export type RagaFlavor =
  | 'none'
  | 'mayamalavagowla'
  | 'shankarabharanam'
  | 'kalyani'
  | 'kharaharapriya'
  | 'harikambhoji'
  | 'mohanam'
  | 'hamsadhwani'
  | 'abhogi'
  | 'charukesi'
  | 'hindolam'
  | 'revathi'
  | 'kapi'
  | 'sahana'
  | 'generic_indian';

export type CarnaticTechnique =
  | 'alapana'
  | 'gamakam'
  | 'sangati'
  | 'brigas'
  | 'kalpanaswaram'
  | 'neraval'
  | 'korvai'
  | 'thani_avartanam';

export type FolkElement =
  | 'gaana'
  | 'parai'
  | 'oyilattam'
  | 'kummi'
  | 'kolattam'
  | 'kavadi'
  | 'therukoothu'
  | 'oppari'
  | 'naiyandi'
  | 'urumi'
  | 'villuppattu';

export interface CarnaticOrnamentation {
  enabled: boolean;
  ragaFlavor: RagaFlavor;
  techniques: CarnaticTechnique[];
  complexity: number; // 0-100
}

export interface FolkOrnamentation {
  enabled: boolean;
  elements: FolkElement[];
  intensity: number; // 0-100
}

export interface Ornamentation {
  carnatic: CarnaticOrnamentation;
  folk: FolkOrnamentation;
}

// ============================================================================
// STRUCTURE
// ============================================================================

export type SongForm =
  | 'verse_chorus'
  | 'verse_chorus_bridge'
  | 'aaba'
  | 'through_composed'
  | 'rondo'
  | 'pallavi_anupallavi_charanam'
  | 'kriti'
  | 'varnam'
  | 'film_intro_verse_chorus'
  | 'kuthu_buildup'
  | 'free_form';

export type Tala =
  | 'adi'
  | 'rupaka'
  | 'khanda_chapu'
  | 'misra_chapu'
  | 'tisra_eka'
  | 'western_4_4'
  | 'western_3_4'
  | 'western_6_8'
  | 'mixed'
  | 'free_rhythm';

export interface EnergyPoint {
  position: number; // 0-100
  energy: number; // 0-100
  label: string;
}

export interface Structure {
  form: SongForm;
  tala: Tala;
  energyCurve: EnergyPoint[];
  sections: number;
  modulations: boolean;
  breakdowns: boolean;
}

// ============================================================================
// MIX
// ============================================================================

export type MixAdjective =
  // Clarity
  | 'crisp'
  | 'clear'
  | 'polished'
  | 'clean'
  // Warmth
  | 'warm'
  | 'analog'
  | 'vintage'
  | 'saturated'
  // Space
  | 'spacious'
  | 'wide'
  | 'airy'
  | 'ambient'
  // Texture
  | 'lush'
  | 'thick'
  | 'dense'
  | 'layered'
  // Character
  | 'punchy'
  | 'aggressive'
  | 'smooth'
  | 'dreamy'
  | 'ethereal'
  | 'gritty'
  | 'raw'
  | 'lo-fi';

export type SpatialSize = 'intimate' | 'small_room' | 'medium_hall' | 'large_venue' | 'cathedral' | 'outdoor';

export type FrequencyFocus = 'bass_heavy' | 'low_mid_focus' | 'balanced' | 'mid_forward' | 'bright' | 'treble_sparkle';

export interface MixConfig {
  adjectives: MixAdjective[];
  spatialSize: SpatialSize;
  frequencyFocus: FrequencyFocus;
  stereoWidth: number; // 0-100
  dynamicRange: number; // 0-100
  reverbAmount: number; // 0-100
  compression: boolean;
  saturation: boolean;
}

// ============================================================================
// MACRO CONTROLS
// ============================================================================

export interface MacroControls {
  overallDensity: number; // 0-100
  clarityVsComplexity: number; // 0-100
  vocalVsInstrumental: number; // 0-100
}

// ============================================================================
// COMPLETE SCHEMA
// ============================================================================

export interface CanonicalSchema {
  global: GlobalConfig;
  instrumentation: Instrumentation;
  vocals: VocalConfig;
  ornamentation: Ornamentation;
  structure: Structure;
  mix: MixConfig;
  macroControls: MacroControls;
  promptLengthTarget: number; // 120-600 chars
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_CONFIG: CanonicalSchema = {
  global: {
    targetPlatform: 'suno',
    genre: 'tamil_film',
    tempo: 100,
    moodAxes: {
      energy: 50,
      tension: 30,
      brightness: 60,
      warmth: 70,
    },
    useCase: 'standalone_song',
  },
  instrumentation: {
    instruments: [],
    maxInstruments: 8,
    percussion: {
      kit: 'film_standard',
      density: 50,
      fills: 40,
      complexity: 50,
      groove: 'straight',
      humanFeel: 50,
    },
  },
  vocals: {
    language: 'tamil',
    role: 'lead',
    gender: 'female',
    timbre: 'medium',
    styles: ['playback_melodic'],
    performance: 'expressive',
    level: 0.8,
    harmonies: true,
  },
  ornamentation: {
    carnatic: {
      enabled: false,
      ragaFlavor: 'none',
      techniques: [],
      complexity: 50,
    },
    folk: {
      enabled: false,
      elements: [],
      intensity: 50,
    },
  },
  structure: {
    form: 'verse_chorus_bridge',
    tala: 'western_4_4',
    energyCurve: [
      { position: 0, energy: 30, label: 'Intro' },
      { position: 20, energy: 50, label: 'Verse' },
      { position: 40, energy: 80, label: 'Chorus' },
      { position: 60, energy: 40, label: 'Verse 2' },
      { position: 80, energy: 90, label: 'Final Chorus' },
      { position: 100, energy: 40, label: 'Outro' },
    ],
    sections: 5,
    modulations: false,
    breakdowns: true,
  },
  mix: {
    adjectives: ['warm', 'polished'],
    spatialSize: 'medium_hall',
    frequencyFocus: 'balanced',
    stereoWidth: 70,
    dynamicRange: 60,
    reverbAmount: 40,
    compression: true,
    saturation: false,
  },
  macroControls: {
    overallDensity: 50,
    clarityVsComplexity: 40,
    vocalVsInstrumental: 60,
  },
  promptLengthTarget: 400,
};
