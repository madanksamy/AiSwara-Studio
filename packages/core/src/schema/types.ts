/**
 * AiSwara Music Studio - Canonical Schema Types
 * Based on proposal specification for AI music prompt composer
 */

// ============================================================================
// GLOBAL CONFIG
// ============================================================================

export type TargetPlatform = 'suno' | 'heartmula' | 'generic';

export type Genre =
  | 'tamil_film'
  | 'carnatic_classical'
  | 'tamil_folk'
  | 'gaana'
  | 'indian_fusion'
  | 'bollywood_style'
  | 'western_pop'
  | 'rock'
  | 'edm'
  | 'ambient'
  | 'cinematic_score'
  | 'lofi'
  | 'devotional';

export type TempoFeel = 'slow' | 'medium' | 'fast' | 'variable';

export type UseCase =
  | 'full_song'
  | 'background_score'
  | 'intro_theme'
  | 'short_form_video_bgm'
  | 'ad_jingle'
  | 'podcast_intro';

export interface MoodAxes {
  calm_to_energetic: number; // 0-100
  dark_to_bright: number; // 0-100
  intimate_to_epic: number; // 0-100
  devotional_to_romantic: number; // 0-100
}

export interface GlobalConfig {
  targetPlatform: TargetPlatform;
  genres: Genre[];
  tempo: {
    feel: TempoFeel;
    bpmRange?: { min: number; max: number };
  };
  moodAxes: MoodAxes;
  useCase: UseCase;
}

// ============================================================================
// INSTRUMENTATION
// ============================================================================

export type InstrumentCategory = 'melodic' | 'percussion' | 'guitar' | 'texture' | 'bass';

export type InstrumentStyle = string; // Dynamic based on instrument

export type StereoPosition = 'center' | 'wide' | 'left' | 'right';
export type Register = 'low' | 'mid' | 'high';

export interface InstrumentEffects {
  reverb?: number; // 0-100
  delay?: number; // 0-100
  chorus?: number; // 0-100
  overdrive?: number; // 0-100
  distortion?: number; // 0-100
  tremolo?: number; // 0-100
  wah?: number; // 0-100
}

export interface InstrumentConfig {
  id: string;
  category: InstrumentCategory;
  enabled: boolean;
  intensity: number; // 0-100
  style?: string;
  register?: Register;
  stereo?: StereoPosition;
  effects?: InstrumentEffects;
  // Instrument-specific fields
  tala?: Tala; // For percussion
  role?: string; // For guitars
  tone?: string; // For guitars
  articulationDetail?: number; // 0-100
  gain?: number; // 0-100 for electric guitars
}

export type Tala = 'adi' | 'rupaka' | 'misra_chapu' | 'kanda_chapu' | 'other';

export type PercussionKitPreset =
  | 'mridangam_focus'
  | 'parai_ensemble'
  | 'tabla_drumkit_fusion'
  | 'edm_plus_indian';

export type GrooveFeel = 'straight' | 'swing' | 'syncopated' | 'complex_tala';
export type Layering = 'minimal' | 'moderate' | 'dense';

export interface PercussionGlobal {
  kitPreset: PercussionKitPreset;
  grooveFeel: GrooveFeel;
  densityMain: number; // 0-100
  fillsFrequency: number; // 0-100
  layering: Layering;
}

export type GuitarRole = 'rhythmic' | 'lead' | 'texture' | 'balanced';

export interface GuitarsGlobal {
  dominantRole: GuitarRole;
  toneAdjectives: string[];
  effectToggles: {
    delay: boolean;
    reverb: boolean;
    chorus: boolean;
    overdrive: boolean;
    distortion: boolean;
    tremolo: boolean;
    wah: boolean;
  };
}

export interface Instrumentation {
  instruments: InstrumentConfig[];
  percussionGlobal: PercussionGlobal;
  guitarsGlobal: GuitarsGlobal;
  maxActiveInstruments: number;
  melodicEmphasis: number; // 0-100
}

// ============================================================================
// VOCALS
// ============================================================================

export type VocalLanguage = 'tamil' | 'english' | 'hindi' | 'instrumental_only';
export type LanguageMix = 'tamil_only' | 'tamil_plus_english' | 'multilingual';

export type VocalRole =
  | 'lead_only'
  | 'lead_plus_harmonies'
  | 'hook_chant'
  | 'choir_pads'
  | 'humming_only';

export type VocalGender = 'male' | 'female' | 'mixed' | 'androgynous' | 'childlike';

export type VocalTone = 'airy' | 'nasal' | 'chesty' | 'breathy' | 'raspy' | 'bright' | 'dark';

export type VocalStyle =
  | 'carnatic_classical'
  | 'light_classical'
  | 'tamil_folk'
  | 'gaana'
  | 'tamil_film_ballad'
  | 'tamil_film_mass'
  | 'pop'
  | 'rock'
  | 'devotional';

export interface VocalPerformance {
  vibratoDepth: number; // 0-100
  ornamentationLevel: number; // 0-100
  pitchSlides: number; // 0-100
  reverbAmount: number; // 0-100
  delayAmount: number; // 0-100
}

export interface VocalConfig {
  level: number; // 0-100
  density: number; // 0-100 (number of layers/harmonies)
  lineComplexity: number; // 0-100
  rhythmicTightness: number; // 0-100
  language: {
    primary: VocalLanguage;
    codeSwitching: number; // 0-100 (Tamil-English mix)
  };
  role: VocalRole[];
  genderTimbre: {
    genderBlend: number; // 0-100 (male to female)
    toneSliders: Partial<Record<VocalTone, number>>;
  };
  style: VocalStyle[];
  phrasing: {
    legato_vs_staccato: number; // 0-100
    syncopation: number; // 0-100
  };
  performance: VocalPerformance;
}

// ============================================================================
// ORNAMENTATION
// ============================================================================

export type HumPosition = 'intro' | 'background' | 'throughout';

export interface HumsConfig {
  enabled: boolean;
  position: HumPosition;
}

export interface NonLyricalTextures {
  ooh_aah_pads: boolean;
  crowd_chants: boolean;
  claps: boolean;
}

export type AlapanaPlacement = 'intro' | 'interlude' | 'outro';

export type RagaFlavor = 'kalyani_like' | 'bhairavi_like' | 'kapi_like' | 'hindolam_like' | 'other';

export interface CarnaticOrnamentation {
  alapana: {
    enabled: boolean;
    placement: AlapanaPlacement;
    complexity: number; // 0-100
  };
  gamakamIntensity: number; // 0-100
  ragaFlavor: RagaFlavor;
  tanBrigaDensity: number; // 0-100
}

export interface FolkOrnamentation {
  tamilFolkFeel: number; // 0-100
  gaanaStyle: number; // 0-100
  festivalEnergy: number; // 0-100
}

export interface OrnamentationRouting {
  appliesToLeadVocal: boolean;
  appliesToSoloInstrument: boolean;
  appliesToBackgroundOnly: boolean;
}

export interface Ornamentation {
  hums: HumsConfig;
  nonLyricalTextures: NonLyricalTextures;
  carnatic: CarnaticOrnamentation;
  folk: FolkOrnamentation;
  routing: OrnamentationRouting;
}

// ============================================================================
// STRUCTURE
// ============================================================================

export type SongForm =
  | 'intro_verse_chorus_bridge_outro'
  | 'ab'
  | 'aaba'
  | 'loop_based'
  | 'build_and_drop';

export interface EnergyCurve {
  start: number; // 0-100
  peak: number; // 0-100
  end: number; // 0-100
  buildRate: number; // 0-100
}

export interface SectionHints {
  intro?: string;
  verses?: string;
  chorus?: string;
  bridge?: string;
  outro?: string;
}

export interface Structure {
  form: SongForm;
  energyCurve: EnergyCurve;
  sectionHints: SectionHints;
}

// ============================================================================
// MIX
// ============================================================================

export type MixAdjective =
  | 'clean'
  | 'lush'
  | 'cinematic'
  | 'raw'
  | 'lofi'
  | 'vintage'
  | 'modern_pop'
  | 'club_ready'
  | 'punchy'
  | 'soothing'
  | 'warm'
  | 'spiritual'
  | 'lively'
  | 'crowd_energy'
  | 'guitar_forward'
  | 'acoustic'
  | 'intimate';

export type MixSpace = 'dry' | 'room' | 'hall' | 'plate' | 'wide_ambient';
export type MixFocus = 'vocal_forward' | 'band_forward' | 'balanced';

export interface MixConfig {
  mixAdjectives: MixAdjective[];
  space: MixSpace;
  focus: MixFocus;
}

// ============================================================================
// MACRO COHERENCE CONTROLS
// ============================================================================

export interface MacroCoherenceControls {
  overall_density: number; // 0-100
  clarity_vs_complexity: number; // 0-100
  vocal_vs_instrumental_focus: number; // 0-100
}

// ============================================================================
// CANONICAL SCHEMA (Complete Config)
// ============================================================================

export interface CanonicalSchema {
  global: GlobalConfig;
  instrumentation: Instrumentation;
  vocals: VocalConfig;
  ornamentation: Ornamentation;
  structure: Structure;
  mix: MixConfig;
  macroControls: MacroCoherenceControls;
  promptLengthTarget: number; // 120-580 chars
}

// ============================================================================
// INPUT SOURCES
// ============================================================================

export type InputSourceType = 'direct_config' | 'lyrics_text' | 'external_link';

export interface LyricsInput {
  text: string;
  maxLength: number; // default 5000
}

export interface ExternalLinkInput {
  url: string;
  allowedDomains: string[];
}

export interface InputConfig {
  sourceType: InputSourceType;
  lyricsText?: LyricsInput;
  externalLink?: ExternalLinkInput;
}

// ============================================================================
// PIPELINE OUTPUT
// ============================================================================

export interface PipelineOutput {
  finalPrompt: string;
  characterCount: number;
  modelAttribution: {
    chosenAnalyzerModel: string;
    confidenceNotes?: string;
  };
  agentMetadata: {
    schemaAgent: AgentMetadata;
    styleComposer: AgentMetadata;
    platformAdapter: AgentMetadata;
    lengthController: AgentMetadata;
    qualityConstraints: AgentMetadata;
  };
}

export interface AgentMetadata {
  llmUsed: string;
  tokensUsed: number;
  processingTimeMs: number;
  decisions: string[];
}

// ============================================================================
// PRESETS
// ============================================================================

export interface Preset {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  config: Partial<CanonicalSchema>;
  microPromptPreview: string;
  isSystem: boolean;
  createdAt: Date;
}
