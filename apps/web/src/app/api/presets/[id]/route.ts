import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_CONFIG } from '@/types/schema';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// System preset configs (curated)
const SYSTEM_PRESETS: Record<string, typeof DEFAULT_CONFIG> = {
  'tamil-80s-ballad': {
    ...DEFAULT_CONFIG,
    global: {
      ...DEFAULT_CONFIG.global,
      genre: 'tamil_film',
      tempo: 72,
      moodAxes: { energy: 30, tension: 20, brightness: 60, warmth: 80 },
      useCase: 'romantic',
    },
    instrumentation: {
      ...DEFAULT_CONFIG.instrumentation,
      instruments: [
        { id: 'violin', name: 'Violin', role: 'lead', level: 0.8, style: 'classical', adjectives: ['melodic', 'expressive'] },
        { id: 'veena', name: 'Veena', role: 'supporting', level: 0.5, style: 'carnatic', adjectives: ['subtle'] },
        { id: 'flute', name: 'Flute', role: 'supporting', level: 0.4, style: 'bansuri', adjectives: ['breathy'] },
      ],
    },
    vocals: {
      ...DEFAULT_CONFIG.vocals,
      language: 'tamil',
      role: 'lead',
      gender: 'male',
      timbre: 'medium',
      styles: ['ilaiyaraaja_style', 'melody_90s'],
      performance: 'expressive',
      level: 0.9,
    },
    ornamentation: {
      carnatic: {
        enabled: true,
        ragaFlavor: 'kharaharapriya',
        techniques: ['gamakam', 'sangati'],
        complexity: 40,
      },
      folk: { enabled: false, elements: [], intensity: 0 },
    },
    mix: {
      ...DEFAULT_CONFIG.mix,
      adjectives: ['warm', 'analog', 'vintage'],
      spatialSize: 'medium_hall',
    },
  },
  'tamil-mass-2010s': {
    ...DEFAULT_CONFIG,
    global: {
      ...DEFAULT_CONFIG.global,
      genre: 'tamil_film',
      tempo: 135,
      moodAxes: { energy: 90, tension: 60, brightness: 80, warmth: 50 },
      useCase: 'party',
    },
    instrumentation: {
      ...DEFAULT_CONFIG.instrumentation,
      instruments: [
        { id: 'synth-lead', name: 'Synth Lead', role: 'lead', level: 0.8, style: 'electronic', adjectives: ['bright', 'punchy'] },
        { id: 'electronic-drums', name: 'Electronic Drums', role: 'supporting', level: 0.9, style: '808', adjectives: ['heavy'] },
      ],
      percussion: {
        kit: 'kuthu_high_energy',
        density: 90,
        fills: 70,
      },
    },
    vocals: {
      ...DEFAULT_CONFIG.vocals,
      language: 'tamil',
      role: 'lead',
      gender: 'male',
      styles: ['kuthu', 'playback_energetic'],
      performance: 'intense',
      level: 0.85,
    },
    ornamentation: {
      carnatic: { enabled: false, ragaFlavor: 'none', techniques: [], complexity: 0 },
      folk: { enabled: true, elements: ['gaana', 'parai'], intensity: 70 },
    },
    mix: {
      ...DEFAULT_CONFIG.mix,
      adjectives: ['punchy', 'aggressive', 'thick'],
      frequencyFocus: 'bass_heavy',
    },
  },
  'carnatic-kriti': {
    ...DEFAULT_CONFIG,
    global: {
      ...DEFAULT_CONFIG.global,
      genre: 'carnatic_classical',
      tempo: 80,
      moodAxes: { energy: 40, tension: 30, brightness: 70, warmth: 60 },
      useCase: 'standalone_song',
    },
    instrumentation: {
      ...DEFAULT_CONFIG.instrumentation,
      instruments: [
        { id: 'veena', name: 'Veena', role: 'lead', level: 0.8, style: 'saraswati', adjectives: ['rich', 'resonant'] },
        { id: 'mridangam', name: 'Mridangam', role: 'supporting', level: 0.7, style: 'classical', adjectives: ['traditional'] },
        { id: 'ghatam', name: 'Ghatam', role: 'texture', level: 0.4, style: 'traditional', adjectives: ['subtle'] },
        { id: 'tanpura', name: 'Tanpura', role: 'texture', level: 0.3, style: 'drone', adjectives: ['continuous'] },
      ],
    },
    vocals: {
      ...DEFAULT_CONFIG.vocals,
      language: 'tamil',
      role: 'lead',
      styles: ['carnatic_classical'],
      performance: 'expressive',
    },
    ornamentation: {
      carnatic: {
        enabled: true,
        ragaFlavor: 'shankarabharanam',
        techniques: ['alapana', 'gamakam', 'sangati', 'kalpanaswaram'],
        complexity: 80,
      },
      folk: { enabled: false, elements: [], intensity: 0 },
    },
    structure: {
      ...DEFAULT_CONFIG.structure,
      form: 'pallavi_anupallavi_charanam',
      tala: 'adi',
    },
  },
};

/**
 * GET /api/presets/[id]
 * Get a single preset by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Check system presets first
    if (SYSTEM_PRESETS[id]) {
      return NextResponse.json({
        id,
        config: SYSTEM_PRESETS[id],
        isSystem: true,
      });
    }

    // Then check database
    if (supabase) {
      const { data: preset, error } = await supabase
        .from('presets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        ...preset,
        config: preset.config,
      });
    }

    return NextResponse.json(
      { error: 'Preset not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Failed to fetch preset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preset' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/presets/[id]
 * Delete a user preset (cannot delete system presets)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Cannot delete system presets
    if (SYSTEM_PRESETS[id]) {
      return NextResponse.json(
        { error: 'Cannot delete system presets' },
        { status: 403 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from('presets')
      .delete()
      .eq('id', id)
      .eq('is_system', false);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete preset:', error);
    return NextResponse.json(
      { error: 'Failed to delete preset' },
      { status: 500 }
    );
  }
}
