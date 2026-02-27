/**
 * AiSwara Music Studio - Default Configuration Values
 */

import type {
  CanonicalSchema,
  GlobalConfig,
  Instrumentation,
  VocalConfig,
  Ornamentation,
  Structure,
  MixConfig,
  MacroCoherenceControls,
} from './types';

export const defaultMoodAxes = {
  calm_to_energetic: 50,
  dark_to_bright: 50,
  intimate_to_epic: 50,
  devotional_to_romantic: 50,
};

export const defaultGlobalConfig: GlobalConfig = {
  targetPlatform: 'suno',
  genres: ['tamil_film'],
  tempo: {
    feel: 'medium',
    bpmRange: { min: 90, max: 120 },
  },
  moodAxes: defaultMoodAxes,
  useCase: 'full_song',
};

export const defaultPercussionGlobal = {
  kitPreset: 'mridangam_focus' as const,
  grooveFeel: 'straight' as const,
  densityMain: 50,
  fillsFrequency: 40,
  layering: 'moderate' as const,
};

export const defaultGuitarsGlobal = {
  dominantRole: 'balanced' as const,
  toneAdjectives: ['warm'],
  effectToggles: {
    delay: false,
    reverb: true,
    chorus: false,
    overdrive: false,
    distortion: false,
    tremolo: false,
    wah: false,
  },
};

export const defaultInstrumentation: Instrumentation = {
  instruments: [],
  percussionGlobal: defaultPercussionGlobal,
  guitarsGlobal: defaultGuitarsGlobal,
  maxActiveInstruments: 12,
  melodicEmphasis: 50,
};

export const defaultVocalPerformance = {
  vibratoDepth: 40,
  ornamentationLevel: 40,
  pitchSlides: 30,
  reverbAmount: 50,
  delayAmount: 20,
};

export const defaultVocalConfig: VocalConfig = {
  level: 70,
  density: 40,
  lineComplexity: 50,
  rhythmicTightness: 60,
  language: {
    primary: 'tamil',
    codeSwitching: 0,
  },
  role: ['lead_plus_harmonies'],
  genderTimbre: {
    genderBlend: 50,
    toneSliders: {
      bright: 50,
      chesty: 50,
    },
  },
  style: ['tamil_film_ballad'],
  phrasing: {
    legato_vs_staccato: 50,
    syncopation: 30,
  },
  performance: defaultVocalPerformance,
};

export const defaultOrnamentation: Ornamentation = {
  hums: {
    enabled: false,
    position: 'intro',
  },
  nonLyricalTextures: {
    ooh_aah_pads: false,
    crowd_chants: false,
    claps: false,
  },
  carnatic: {
    alapana: {
      enabled: false,
      placement: 'intro',
      complexity: 50,
    },
    gamakamIntensity: 30,
    ragaFlavor: 'kalyani_like',
    tanBrigaDensity: 30,
  },
  folk: {
    tamilFolkFeel: 0,
    gaanaStyle: 0,
    festivalEnergy: 0,
  },
  routing: {
    appliesToLeadVocal: true,
    appliesToSoloInstrument: false,
    appliesToBackgroundOnly: false,
  },
};

export const defaultEnergyCurve = {
  start: 40,
  peak: 80,
  end: 50,
  buildRate: 50,
};

export const defaultStructure: Structure = {
  form: 'intro_verse_chorus_bridge_outro',
  energyCurve: defaultEnergyCurve,
  sectionHints: {},
};

export const defaultMixConfig: MixConfig = {
  mixAdjectives: ['clean', 'modern_pop'],
  space: 'room',
  focus: 'vocal_forward',
};

export const defaultMacroControls: MacroCoherenceControls = {
  overall_density: 50,
  clarity_vs_complexity: 40,
  vocal_vs_instrumental_focus: 60,
};

export const defaultCanonicalSchema: CanonicalSchema = {
  global: defaultGlobalConfig,
  instrumentation: defaultInstrumentation,
  vocals: defaultVocalConfig,
  ornamentation: defaultOrnamentation,
  structure: defaultStructure,
  mix: defaultMixConfig,
  macroControls: defaultMacroControls,
  promptLengthTarget: 300,
};

/**
 * Create a new config with defaults, merging in any provided overrides
 */
export function createConfig(overrides?: Partial<CanonicalSchema>): CanonicalSchema {
  return {
    ...defaultCanonicalSchema,
    ...overrides,
    global: {
      ...defaultGlobalConfig,
      ...overrides?.global,
      moodAxes: {
        ...defaultMoodAxes,
        ...overrides?.global?.moodAxes,
      },
    },
    instrumentation: {
      ...defaultInstrumentation,
      ...overrides?.instrumentation,
    },
    vocals: {
      ...defaultVocalConfig,
      ...overrides?.vocals,
    },
    ornamentation: {
      ...defaultOrnamentation,
      ...overrides?.ornamentation,
    },
    structure: {
      ...defaultStructure,
      ...overrides?.structure,
    },
    mix: {
      ...defaultMixConfig,
      ...overrides?.mix,
    },
    macroControls: {
      ...defaultMacroControls,
      ...overrides?.macroControls,
    },
  };
}
