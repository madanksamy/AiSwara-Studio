'use client';

import { useConfigStore } from '@/stores/configStore';
import { Slider, Select, MultiSelect, Toggle } from '../controls';
import type { MixAdjective, SpatialSize, FrequencyFocus } from '@/types/schema';

const MIX_ADJECTIVE_OPTIONS: { value: MixAdjective; label: string; category: string }[] = [
  // Clarity
  { value: 'crisp', label: 'Crisp', category: 'Clarity' },
  { value: 'clear', label: 'Clear', category: 'Clarity' },
  { value: 'polished', label: 'Polished', category: 'Clarity' },
  { value: 'clean', label: 'Clean', category: 'Clarity' },
  // Warmth
  { value: 'warm', label: 'Warm', category: 'Warmth' },
  { value: 'analog', label: 'Analog', category: 'Warmth' },
  { value: 'vintage', label: 'Vintage', category: 'Warmth' },
  { value: 'saturated', label: 'Saturated', category: 'Warmth' },
  // Space
  { value: 'spacious', label: 'Spacious', category: 'Space' },
  { value: 'wide', label: 'Wide', category: 'Space' },
  { value: 'airy', label: 'Airy', category: 'Space' },
  { value: 'ambient', label: 'Ambient', category: 'Space' },
  // Texture
  { value: 'lush', label: 'Lush', category: 'Texture' },
  { value: 'thick', label: 'Thick', category: 'Texture' },
  { value: 'dense', label: 'Dense', category: 'Texture' },
  { value: 'layered', label: 'Layered', category: 'Texture' },
  // Character
  { value: 'punchy', label: 'Punchy', category: 'Character' },
  { value: 'aggressive', label: 'Aggressive', category: 'Character' },
  { value: 'smooth', label: 'Smooth', category: 'Character' },
  { value: 'dreamy', label: 'Dreamy', category: 'Character' },
  { value: 'ethereal', label: 'Ethereal', category: 'Character' },
  { value: 'gritty', label: 'Gritty', category: 'Character' },
  { value: 'raw', label: 'Raw', category: 'Character' },
  { value: 'lo-fi', label: 'Lo-Fi', category: 'Character' },
];

const SPATIAL_OPTIONS: { value: SpatialSize; label: string; description: string }[] = [
  { value: 'intimate', label: 'Intimate', description: 'Close, personal sound' },
  { value: 'small_room', label: 'Small Room', description: 'Cozy acoustic space' },
  { value: 'medium_hall', label: 'Medium Hall', description: 'Concert hall feel' },
  { value: 'large_venue', label: 'Large Venue', description: 'Stadium/arena sound' },
  { value: 'cathedral', label: 'Cathedral', description: 'Huge reverberant space' },
  { value: 'outdoor', label: 'Outdoor', description: 'Open air ambience' },
];

const FREQUENCY_FOCUS_OPTIONS: { value: FrequencyFocus; label: string }[] = [
  { value: 'bass_heavy', label: 'Bass Heavy' },
  { value: 'low_mid_focus', label: 'Low-Mid Focus' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'mid_forward', label: 'Mid Forward' },
  { value: 'bright', label: 'Bright' },
  { value: 'treble_sparkle', label: 'Treble Sparkle' },
];

export function MixSection() {
  const config = useConfigStore((state) => state.config);
  const updateMix = useConfigStore((state) => state.updateMix);

  return (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Mix & Sound Design
      </h2>

      <div className="space-y-6">
        {/* Mix Adjectives */}
        <MultiSelect
          label="Mix Character"
          values={config.mix.adjectives}
          options={MIX_ADJECTIVE_OPTIONS}
          onChange={(v) => updateMix({ adjectives: v as MixAdjective[] })}
          maxSelections={4}
          placeholder="Select up to 4 mix characteristics..."
        />

        {/* Spatial Size */}
        <Select
          label="Spatial Size"
          value={config.mix.spatialSize}
          options={SPATIAL_OPTIONS}
          onChange={(v) => updateMix({ spatialSize: v as SpatialSize })}
        />

        {/* Frequency Focus */}
        <Select
          label="Frequency Focus"
          value={config.mix.frequencyFocus}
          options={FREQUENCY_FOCUS_OPTIONS}
          onChange={(v) => updateMix({ frequencyFocus: v as FrequencyFocus })}
        />

        {/* Stereo Width */}
        <Slider
          label="Stereo Width"
          value={config.mix.stereoWidth}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(v) => updateMix({ stereoWidth: v })}
        />

        {/* Dynamics */}
        <Slider
          label="Dynamic Range"
          value={config.mix.dynamicRange}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(v) => updateMix({ dynamicRange: v })}
        />

        {/* Reverb Amount */}
        <Slider
          label="Reverb Amount"
          value={config.mix.reverbAmount}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(v) => updateMix({ reverbAmount: v })}
        />

        {/* Advanced Toggles */}
        <div className="grid grid-cols-2 gap-4">
          <Toggle
            label="Master Compression"
            checked={config.mix.compression}
            onChange={(v) => updateMix({ compression: v })}
          />
          <Toggle
            label="Tape Saturation"
            checked={config.mix.saturation}
            onChange={(v) => updateMix({ saturation: v })}
          />
        </div>
      </div>
    </div>
  );
}

export default MixSection;
