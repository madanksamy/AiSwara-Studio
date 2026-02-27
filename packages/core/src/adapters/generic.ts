/**
 * Generic Platform Adapter
 * Formats prompts for any AI music generation platform
 */

import type { PlatformConfig, StyleInput, AdapterOutput } from './types';

export const genericConfig: PlatformConfig = {
  name: 'Generic',
  type: 'generic',
  maxChars: 600,
  minChars: 100,
  features: {
    genreTags: true,
    moodDescriptors: true,
    instrumentSpecs: true,
    vocalSpecs: true,
    productionSpecs: true,
    structureHints: true,
    tempoSpecs: true,
    culturalTags: true,
  },
  formatting: {
    separator: ', ',
    titleCase: false,
    useAbbreviations: false,
    maxWordsPerDescriptor: 5,
    stylePrefix: '',
    styleSuffix: '',
  },
};

/**
 * Format style input for generic platform
 * Uses neutral, widely-understood music terminology
 */
export function formatForGeneric(input: StyleInput): AdapterOutput {
  const parts: string[] = [];
  const elementsIncluded: string[] = [];
  const elementsDropped: string[] = [];
  const warnings: string[] = [];

  // Genre (use common terminology)
  if (input.genre) {
    parts.push(formatGenre(input.genre));
    elementsIncluded.push('genre');
  }

  // Mood
  if (input.mood) {
    parts.push(input.mood);
    elementsIncluded.push('mood');
  }

  // Tempo
  if (input.tempo) {
    parts.push(formatTempo(input.tempo));
    elementsIncluded.push('tempo');
  }

  // Vocals
  if (input.vocals) {
    const vocalPart = formatVocals(input.vocals);
    if (vocalPart) {
      parts.push(vocalPart);
      elementsIncluded.push('vocals');
    }
  }

  // Instruments
  if (input.instruments && input.instruments.length > 0) {
    const instPart = formatInstruments(input.instruments);
    parts.push(instPart);
    elementsIncluded.push('instruments');
  }

  // Ornamentation (translate Indian terms to generic descriptions)
  if (input.ornamentation && input.ornamentation.length > 0) {
    const ornPart = formatOrnamentation(input.ornamentation);
    if (ornPart) {
      parts.push(ornPart);
      elementsIncluded.push('ornamentation');
    }
  }

  // Production
  if (input.production && input.production.length > 0) {
    const prodPart = input.production.slice(0, 2).join(' ') + ' production';
    parts.push(prodPart);
    elementsIncluded.push('production');
  }

  // Build prompt
  let prompt = parts.join(genericConfig.formatting.separator);

  // Capitalize first letter
  prompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);

  // Ensure ends with period
  if (!prompt.endsWith('.')) {
    prompt += '.';
  }

  // Check length
  let compressionApplied = false;
  if (prompt.length > genericConfig.maxChars) {
    prompt = compressPrompt(prompt, genericConfig.maxChars);
    compressionApplied = true;
    warnings.push('Prompt was compressed to fit character limit');
  }

  return {
    prompt,
    charCount: prompt.length,
    platform: 'generic',
    warnings,
    metadata: {
      elementsIncluded,
      elementsDropped,
      compressionApplied,
    },
  };
}

function formatGenre(genre: string): string {
  // Map Indian-specific genres to more generic terms
  const genreMap: Record<string, string> = {
    carnatic_classical: 'Indian classical',
    carnatic_fusion: 'Indian fusion',
    tamil_film: 'Indian film',
    tamil_folk: 'Indian folk',
    tamil_indie: 'Indian indie',
    devotional: 'spiritual',
    gaana: 'Indian street music',
  };

  const mapped = genreMap[genre];
  if (mapped) return mapped;

  return genre.replace(/_/g, ' ');
}

function formatTempo(tempo: number): string {
  if (tempo < 70) return 'slow tempo';
  if (tempo < 100) return 'moderate tempo';
  if (tempo < 130) return 'upbeat tempo';
  return 'fast tempo';
}

function formatVocals(vocals: StyleInput['vocals']): string {
  if (!vocals) return '';

  if (vocals.language === 'instrumental_only') {
    return 'instrumental';
  }

  const parts: string[] = [];

  if (vocals.gender && vocals.gender !== 'neutral') {
    parts.push(vocals.gender);
  }

  // Use generic terms for languages
  if (vocals.language) {
    const langMap: Record<string, string> = {
      tamil: 'South Indian',
      hindi: 'North Indian',
      telugu: 'South Indian',
      kannada: 'South Indian',
      malayalam: 'South Indian',
      sanskrit: 'Sanskrit',
    };
    parts.push(langMap[vocals.language] || vocals.language);
  }

  parts.push('vocals');

  if (vocals.style) {
    const styleMap: Record<string, string> = {
      carnatic_classical: 'classical',
      ilaiyaraaja_style: 'melodic film',
      ar_rahman_style: 'contemporary film',
      kuthu: 'energetic',
      folk_gaana: 'folk',
    };
    const mappedStyle = styleMap[vocals.style] || vocals.style.replace(/_/g, ' ');
    parts.push(`in ${mappedStyle} style`);
  }

  return parts.join(' ');
}

function formatInstruments(instruments: string[]): string {
  // Translate Indian instruments to generic descriptions if needed
  const instMap: Record<string, string> = {
    veena: 'veena (string instrument)',
    mridangam: 'mridangam (hand drum)',
    tabla: 'tabla (percussion)',
    nadaswaram: 'nadaswaram (wind instrument)',
    thavil: 'thavil (barrel drum)',
    ghatam: 'ghatam (clay pot)',
    kanjira: 'kanjira (frame drum)',
    tanpura: 'tanpura (drone)',
  };

  const mapped = instruments.slice(0, 4).map((i) => instMap[i] || i);

  if (mapped.length === 1) return mapped[0];
  if (mapped.length === 2) return `${mapped[0]} and ${mapped[1]}`;

  return `${mapped.slice(0, -1).join(', ')}, and ${mapped[mapped.length - 1]}`;
}

function formatOrnamentation(ornamentation: string[]): string {
  // Translate Indian ornamentation to generic terms
  const ornMap: Record<string, string> = {
    alapana: 'melodic improvisation',
    gamakam: 'pitch ornaments',
    sangati: 'melodic variations',
    brigas: 'fast melodic runs',
    kalpanaswaram: 'improvised phrases',
    gaana: 'street music influence',
    parai: 'traditional drums',
  };

  const mapped = ornamentation.slice(0, 2).map((o) => ornMap[o] || o.replace(/_/g, ' '));

  return mapped.join(' and ');
}

function compressPrompt(prompt: string, maxChars: number): string {
  if (prompt.length <= maxChars) return prompt;

  let compressed = prompt
    .replace(/\s+and\s+/g, ', ')
    .replace(/\s+with\s+/g, ', ')
    .replace(/\(.*?\)/g, ''); // Remove parenthetical explanations

  if (compressed.length <= maxChars) return compressed.trim();

  // Truncate
  compressed = compressed.substring(0, maxChars - 1);
  const lastBreak = compressed.lastIndexOf(', ');
  if (lastBreak > maxChars * 0.7) {
    compressed = compressed.substring(0, lastBreak);
  }

  if (!compressed.endsWith('.')) {
    compressed += '.';
  }

  return compressed;
}

export default {
  config: genericConfig,
  format: formatForGeneric,
};
