/**
 * Suno.ai Platform Adapter
 * Formats prompts for Suno's AI music generation
 */

import type { PlatformConfig, StyleInput, AdapterOutput } from './types';

export const sunoConfig: PlatformConfig = {
  name: 'Suno.ai',
  type: 'suno',
  maxChars: 580,
  minChars: 120,
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
    maxWordsPerDescriptor: 4,
    stylePrefix: '',
    styleSuffix: '',
  },
};

/**
 * Format style input for Suno platform
 */
export function formatForSuno(input: StyleInput): AdapterOutput {
  const parts: string[] = [];
  const elementsIncluded: string[] = [];
  const elementsDropped: string[] = [];
  const warnings: string[] = [];

  // Genre (highest priority)
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

  // Instruments (limit to top 4)
  if (input.instruments && input.instruments.length > 0) {
    const instPart = formatInstruments(input.instruments, 4);
    parts.push(instPart);
    elementsIncluded.push('instruments');
    if (input.instruments.length > 4) {
      warnings.push(`Only included ${4} of ${input.instruments.length} instruments`);
    }
  }

  // Ornamentation
  if (input.ornamentation && input.ornamentation.length > 0) {
    const ornPart = input.ornamentation.slice(0, 2).join(' and ');
    parts.push(ornPart);
    elementsIncluded.push('ornamentation');
  }

  // Production
  if (input.production && input.production.length > 0) {
    const prodPart = input.production.slice(0, 2).join(' ') + ' production';
    parts.push(prodPart);
    elementsIncluded.push('production');
  }

  // Build prompt
  let prompt = parts.join(sunoConfig.formatting.separator);

  // Capitalize first letter
  prompt = prompt.charAt(0).toUpperCase() + prompt.slice(1);

  // Ensure ends with period
  if (!prompt.endsWith('.')) {
    prompt += '.';
  }

  // Check length and compress if needed
  let compressionApplied = false;
  if (prompt.length > sunoConfig.maxChars) {
    prompt = compressPrompt(prompt, sunoConfig.maxChars);
    compressionApplied = true;
    warnings.push('Prompt was compressed to fit character limit');
  }

  if (prompt.length < sunoConfig.minChars) {
    warnings.push(`Prompt is shorter than recommended minimum (${sunoConfig.minChars} chars)`);
  }

  return {
    prompt,
    charCount: prompt.length,
    platform: 'suno',
    warnings,
    metadata: {
      elementsIncluded,
      elementsDropped,
      compressionApplied,
    },
  };
}

function formatGenre(genre: string): string {
  // Convert snake_case to natural language
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

  const parts: string[] = [];

  if (vocals.gender && vocals.gender !== 'neutral') {
    parts.push(vocals.gender);
  }

  if (vocals.language && vocals.language !== 'instrumental_only') {
    parts.push(vocals.language);
  } else {
    return 'instrumental';
  }

  parts.push('vocals');

  if (vocals.style) {
    parts.push(`in ${vocals.style.replace(/_/g, ' ')} style`);
  }

  return parts.join(' ');
}

function formatInstruments(instruments: string[], max: number): string {
  const limited = instruments.slice(0, max);

  if (limited.length === 1) return limited[0];
  if (limited.length === 2) return `${limited[0]} and ${limited[1]}`;

  return `${limited.slice(0, -1).join(', ')}, and ${limited[limited.length - 1]}`;
}

function compressPrompt(prompt: string, maxChars: number): string {
  if (prompt.length <= maxChars) return prompt;

  // Remove less important parts
  let compressed = prompt
    .replace(/\s+and\s+/g, ', ')
    .replace(/\s+with\s+/g, ', ')
    .replace(/production/g, 'prod')
    .replace(/instrumental/g, 'inst');

  if (compressed.length <= maxChars) {
    return compressed;
  }

  // Truncate at last complete phrase
  compressed = compressed.substring(0, maxChars - 1);
  const lastComma = compressed.lastIndexOf(',');
  if (lastComma > maxChars * 0.7) {
    compressed = compressed.substring(0, lastComma);
  }

  if (!compressed.endsWith('.')) {
    compressed += '.';
  }

  return compressed;
}

export default {
  config: sunoConfig,
  format: formatForSuno,
};
