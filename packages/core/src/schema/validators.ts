/**
 * AiSwara Music Studio - Zod Validators
 * Runtime validation for the canonical schema
 */

import { z } from 'zod';

// ============================================================================
// GLOBAL CONFIG VALIDATORS
// ============================================================================

export const TargetPlatformSchema = z.enum(['suno', 'heartmula', 'generic']);

export const GenreSchema = z.enum([
  'tamil_film',
  'carnatic_classical',
  'tamil_folk',
  'gaana',
  'indian_fusion',
  'bollywood_style',
  'western_pop',
  'rock',
  'edm',
  'ambient',
  'cinematic_score',
  'lofi',
  'devotional',
]);

export const TempoFeelSchema = z.enum(['slow', 'medium', 'fast', 'variable']);

export const UseCaseSchema = z.enum([
  'full_song',
  'background_score',
  'intro_theme',
  'short_form_video_bgm',
  'ad_jingle',
  'podcast_intro',
]);

export const MoodAxesSchema = z.object({
  calm_to_energetic: z.number().min(0).max(100),
  dark_to_bright: z.number().min(0).max(100),
  intimate_to_epic: z.number().min(0).max(100),
  devotional_to_romantic: z.number().min(0).max(100),
});

export const GlobalConfigSchema = z.object({
  targetPlatform: TargetPlatformSchema,
  genres: z.array(GenreSchema).min(1),
  tempo: z.object({
    feel: TempoFeelSchema,
    bpmRange: z.object({
      min: z.number().min(40).max(200),
      max: z.number().min(40).max(200),
    }).optional(),
  }),
  moodAxes: MoodAxesSchema,
  useCase: UseCaseSchema,
});

// ============================================================================
// INSTRUMENTATION VALIDATORS
// ============================================================================

export const InstrumentCategorySchema = z.enum(['melodic', 'percussion', 'guitar', 'texture', 'bass']);
export const StereoPositionSchema = z.enum(['center', 'wide', 'left', 'right']);
export const RegisterSchema = z.enum(['low', 'mid', 'high']);
export const TalaSchema = z.enum(['adi', 'rupaka', 'misra_chapu', 'kanda_chapu', 'other']);

export const InstrumentEffectsSchema = z.object({
  reverb: z.number().min(0).max(100).optional(),
  delay: z.number().min(0).max(100).optional(),
  chorus: z.number().min(0).max(100).optional(),
  overdrive: z.number().min(0).max(100).optional(),
  distortion: z.number().min(0).max(100).optional(),
  tremolo: z.number().min(0).max(100).optional(),
  wah: z.number().min(0).max(100).optional(),
});

export const InstrumentConfigSchema = z.object({
  id: z.string().min(1),
  category: InstrumentCategorySchema,
  enabled: z.boolean(),
  intensity: z.number().min(0).max(100),
  style: z.string().optional(),
  register: RegisterSchema.optional(),
  stereo: StereoPositionSchema.optional(),
  effects: InstrumentEffectsSchema.optional(),
  tala: TalaSchema.optional(),
  role: z.string().optional(),
  tone: z.string().optional(),
  articulationDetail: z.number().min(0).max(100).optional(),
  gain: z.number().min(0).max(100).optional(),
});

export const PercussionKitPresetSchema = z.enum([
  'mridangam_focus',
  'parai_ensemble',
  'tabla_drumkit_fusion',
  'edm_plus_indian',
]);

export const GrooveFeelSchema = z.enum(['straight', 'swing', 'syncopated', 'complex_tala']);
export const LayeringSchema = z.enum(['minimal', 'moderate', 'dense']);

export const PercussionGlobalSchema = z.object({
  kitPreset: PercussionKitPresetSchema,
  grooveFeel: GrooveFeelSchema,
  densityMain: z.number().min(0).max(100),
  fillsFrequency: z.number().min(0).max(100),
  layering: LayeringSchema,
});

export const GuitarRoleSchema = z.enum(['rhythmic', 'lead', 'texture', 'balanced']);

export const GuitarsGlobalSchema = z.object({
  dominantRole: GuitarRoleSchema,
  toneAdjectives: z.array(z.string()),
  effectToggles: z.object({
    delay: z.boolean(),
    reverb: z.boolean(),
    chorus: z.boolean(),
    overdrive: z.boolean(),
    distortion: z.boolean(),
    tremolo: z.boolean(),
    wah: z.boolean(),
  }),
});

export const InstrumentationSchema = z.object({
  instruments: z.array(InstrumentConfigSchema),
  percussionGlobal: PercussionGlobalSchema,
  guitarsGlobal: GuitarsGlobalSchema,
  maxActiveInstruments: z.number().min(1).max(20).default(12),
  melodicEmphasis: z.number().min(0).max(100),
});

// ============================================================================
// VOCALS VALIDATORS
// ============================================================================

export const VocalLanguageSchema = z.enum(['tamil', 'english', 'hindi', 'instrumental_only']);
export const LanguageMixSchema = z.enum(['tamil_only', 'tamil_plus_english', 'multilingual']);

export const VocalRoleSchema = z.enum([
  'lead_only',
  'lead_plus_harmonies',
  'hook_chant',
  'choir_pads',
  'humming_only',
]);

export const VocalGenderSchema = z.enum(['male', 'female', 'mixed', 'androgynous', 'childlike']);
export const VocalToneSchema = z.enum(['airy', 'nasal', 'chesty', 'breathy', 'raspy', 'bright', 'dark']);

export const VocalStyleSchema = z.enum([
  'carnatic_classical',
  'light_classical',
  'tamil_folk',
  'gaana',
  'tamil_film_ballad',
  'tamil_film_mass',
  'pop',
  'rock',
  'devotional',
]);

export const VocalPerformanceSchema = z.object({
  vibratoDepth: z.number().min(0).max(100),
  ornamentationLevel: z.number().min(0).max(100),
  pitchSlides: z.number().min(0).max(100),
  reverbAmount: z.number().min(0).max(100),
  delayAmount: z.number().min(0).max(100),
});

export const VocalConfigSchema = z.object({
  level: z.number().min(0).max(100),
  density: z.number().min(0).max(100),
  lineComplexity: z.number().min(0).max(100),
  rhythmicTightness: z.number().min(0).max(100),
  language: z.object({
    primary: VocalLanguageSchema,
    codeSwitching: z.number().min(0).max(100),
  }),
  role: z.array(VocalRoleSchema).min(1),
  genderTimbre: z.object({
    genderBlend: z.number().min(0).max(100),
    toneSliders: z.record(VocalToneSchema, z.number().min(0).max(100)),
  }),
  style: z.array(VocalStyleSchema).min(1),
  phrasing: z.object({
    legato_vs_staccato: z.number().min(0).max(100),
    syncopation: z.number().min(0).max(100),
  }),
  performance: VocalPerformanceSchema,
});

// ============================================================================
// ORNAMENTATION VALIDATORS
// ============================================================================

export const HumPositionSchema = z.enum(['intro', 'background', 'throughout']);
export const AlapanaPlacementSchema = z.enum(['intro', 'interlude', 'outro']);
export const RagaFlavorSchema = z.enum(['kalyani_like', 'bhairavi_like', 'kapi_like', 'hindolam_like', 'other']);

export const HumsConfigSchema = z.object({
  enabled: z.boolean(),
  position: HumPositionSchema,
});

export const NonLyricalTexturesSchema = z.object({
  ooh_aah_pads: z.boolean(),
  crowd_chants: z.boolean(),
  claps: z.boolean(),
});

export const CarnaticOrnamentationSchema = z.object({
  alapana: z.object({
    enabled: z.boolean(),
    placement: AlapanaPlacementSchema,
    complexity: z.number().min(0).max(100),
  }),
  gamakamIntensity: z.number().min(0).max(100),
  ragaFlavor: RagaFlavorSchema,
  tanBrigaDensity: z.number().min(0).max(100),
});

export const FolkOrnamentationSchema = z.object({
  tamilFolkFeel: z.number().min(0).max(100),
  gaanaStyle: z.number().min(0).max(100),
  festivalEnergy: z.number().min(0).max(100),
});

export const OrnamentationRoutingSchema = z.object({
  appliesToLeadVocal: z.boolean(),
  appliesToSoloInstrument: z.boolean(),
  appliesToBackgroundOnly: z.boolean(),
});

export const OrnamentationSchema = z.object({
  hums: HumsConfigSchema,
  nonLyricalTextures: NonLyricalTexturesSchema,
  carnatic: CarnaticOrnamentationSchema,
  folk: FolkOrnamentationSchema,
  routing: OrnamentationRoutingSchema,
});

// ============================================================================
// STRUCTURE VALIDATORS
// ============================================================================

export const SongFormSchema = z.enum([
  'intro_verse_chorus_bridge_outro',
  'ab',
  'aaba',
  'loop_based',
  'build_and_drop',
]);

export const EnergyCurveSchema = z.object({
  start: z.number().min(0).max(100),
  peak: z.number().min(0).max(100),
  end: z.number().min(0).max(100),
  buildRate: z.number().min(0).max(100),
});

export const SectionHintsSchema = z.object({
  intro: z.string().optional(),
  verses: z.string().optional(),
  chorus: z.string().optional(),
  bridge: z.string().optional(),
  outro: z.string().optional(),
});

export const StructureSchema = z.object({
  form: SongFormSchema,
  energyCurve: EnergyCurveSchema,
  sectionHints: SectionHintsSchema,
});

// ============================================================================
// MIX VALIDATORS
// ============================================================================

export const MixAdjectiveSchema = z.enum([
  'clean',
  'lush',
  'cinematic',
  'raw',
  'lofi',
  'vintage',
  'modern_pop',
  'club_ready',
  'punchy',
  'soothing',
  'warm',
  'spiritual',
  'lively',
  'crowd_energy',
  'guitar_forward',
  'acoustic',
  'intimate',
]);

export const MixSpaceSchema = z.enum(['dry', 'room', 'hall', 'plate', 'wide_ambient']);
export const MixFocusSchema = z.enum(['vocal_forward', 'band_forward', 'balanced']);

export const MixConfigSchema = z.object({
  mixAdjectives: z.array(MixAdjectiveSchema),
  space: MixSpaceSchema,
  focus: MixFocusSchema,
});

// ============================================================================
// MACRO CONTROLS VALIDATORS
// ============================================================================

export const MacroCoherenceControlsSchema = z.object({
  overall_density: z.number().min(0).max(100),
  clarity_vs_complexity: z.number().min(0).max(100),
  vocal_vs_instrumental_focus: z.number().min(0).max(100),
});

// ============================================================================
// CANONICAL SCHEMA VALIDATOR
// ============================================================================

export const CanonicalSchemaValidator = z.object({
  global: GlobalConfigSchema,
  instrumentation: InstrumentationSchema,
  vocals: VocalConfigSchema,
  ornamentation: OrnamentationSchema,
  structure: StructureSchema,
  mix: MixConfigSchema,
  macroControls: MacroCoherenceControlsSchema,
  promptLengthTarget: z.number().min(120).max(580),
});

// ============================================================================
// INPUT VALIDATORS
// ============================================================================

export const InputSourceTypeSchema = z.enum(['direct_config', 'lyrics_text', 'external_link']);

export const LyricsInputSchema = z.object({
  text: z.string().max(5000),
  maxLength: z.number().default(5000),
});

export const ExternalLinkInputSchema = z.object({
  url: z.string().url(),
  allowedDomains: z.array(z.string()),
});

export const InputConfigSchema = z.object({
  sourceType: InputSourceTypeSchema,
  lyricsText: LyricsInputSchema.optional(),
  externalLink: ExternalLinkInputSchema.optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateCanonicalSchema(data: unknown) {
  return CanonicalSchemaValidator.safeParse(data);
}

export function validateGlobalConfig(data: unknown) {
  return GlobalConfigSchema.safeParse(data);
}

export function validateInstrumentation(data: unknown) {
  return InstrumentationSchema.safeParse(data);
}

export function validateVocalConfig(data: unknown) {
  return VocalConfigSchema.safeParse(data);
}

// ============================================================================
// PROMPT LENGTH CONSTRAINT
// ============================================================================

export const PROMPT_MAX_CHARS = 600;
export const PROMPT_MIN_CHARS = 120;
export const PROMPT_DEFAULT_TARGET = 300;

export function isWithinPromptLimit(prompt: string): boolean {
  return prompt.length <= PROMPT_MAX_CHARS;
}

export function getCharacterCount(prompt: string): number {
  return prompt.length;
}
