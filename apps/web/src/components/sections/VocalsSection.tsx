'use client';

import { useConfigStore } from '@/stores/configStore';
import { Slider, Select, Toggle, MultiSelect } from '../controls';
import type { VocalLanguage, VocalRole, VocalGender, VocalTimbre, VocalStyle, PerformanceIntensity } from '@/types/schema';

const LANGUAGE_OPTIONS: { value: VocalLanguage; label: string }[] = [
  { value: 'tamil', label: 'Tamil' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'sanskrit', label: 'Sanskrit' },
  { value: 'english', label: 'English' },
  { value: 'instrumental_only', label: 'Instrumental Only' },
];

const ROLE_OPTIONS: { value: VocalRole; label: string }[] = [
  { value: 'lead', label: 'Lead Vocal' },
  { value: 'duet', label: 'Duet' },
  { value: 'chorus', label: 'Chorus' },
  { value: 'backing', label: 'Backing' },
  { value: 'spoken', label: 'Spoken Word' },
  { value: 'none', label: 'No Vocals' },
];

const GENDER_OPTIONS: { value: VocalGender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'neutral', label: 'Neutral' },
];

const TIMBRE_OPTIONS: { value: VocalTimbre; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
  { value: 'nasal', label: 'Nasal' },
  { value: 'breathy', label: 'Breathy' },
  { value: 'resonant', label: 'Resonant' },
  { value: 'husky', label: 'Husky' },
];

const STYLE_OPTIONS: { value: VocalStyle; label: string; category: string }[] = [
  // Classical
  { value: 'carnatic_classical', label: 'Carnatic Classical', category: 'Classical' },
  { value: 'hindustani_classical', label: 'Hindustani Classical', category: 'Classical' },
  { value: 'semi_classical', label: 'Semi-Classical', category: 'Classical' },
  // Film
  { value: 'playback_melodic', label: 'Playback Melodic', category: 'Film' },
  { value: 'playback_energetic', label: 'Playback Energetic', category: 'Film' },
  { value: 'kuthu', label: 'Kuthu', category: 'Film' },
  { value: 'melody_90s', label: '90s Melody', category: 'Film' },
  { value: 'melody_2000s', label: '2000s Melody', category: 'Film' },
  { value: 'ar_rahman_style', label: 'A.R. Rahman Style', category: 'Film' },
  { value: 'ilaiyaraaja_style', label: 'Ilaiyaraaja Style', category: 'Film' },
  // Folk & Traditional
  { value: 'folk_gaana', label: 'Gaana', category: 'Folk' },
  { value: 'folk_parai', label: 'Parai Folk', category: 'Folk' },
  { value: 'folk_village', label: 'Village Folk', category: 'Folk' },
  { value: 'devotional_soft', label: 'Devotional Soft', category: 'Folk' },
  { value: 'devotional_bhajan', label: 'Bhajan', category: 'Folk' },
  // Contemporary
  { value: 'pop_contemporary', label: 'Contemporary Pop', category: 'Contemporary' },
  { value: 'indie_acoustic', label: 'Indie Acoustic', category: 'Contemporary' },
  { value: 'indie_alternative', label: 'Indie Alternative', category: 'Contemporary' },
  { value: 'lofi_chill', label: 'Lo-Fi Chill', category: 'Contemporary' },
  { value: 'rnb_smooth', label: 'R&B Smooth', category: 'Contemporary' },
  { value: 'soul', label: 'Soul', category: 'Contemporary' },
  { value: 'jazz_vocal', label: 'Jazz Vocal', category: 'Contemporary' },
  { value: 'rock_vocal', label: 'Rock Vocal', category: 'Contemporary' },
  { value: 'electronic_processed', label: 'Electronic Processed', category: 'Contemporary' },
  { value: 'rap_flow', label: 'Rap/Flow', category: 'Contemporary' },
];

const PERFORMANCE_OPTIONS: { value: PerformanceIntensity; label: string }[] = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'expressive', label: 'Expressive' },
  { value: 'intense', label: 'Intense' },
  { value: 'dramatic', label: 'Dramatic' },
];

export function VocalsSection() {
  const config = useConfigStore((state) => state.config);
  const updateVocals = useConfigStore((state) => state.updateVocals);

  const isInstrumentalOnly = config.vocals.language === 'instrumental_only';

  return (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        Vocals
      </h2>

      <div className="space-y-6">
        {/* Language */}
        <Select
          label="Language"
          value={config.vocals.language}
          options={LANGUAGE_OPTIONS}
          onChange={(v) => updateVocals({ language: v as VocalLanguage })}
        />

        {!isInstrumentalOnly && (
          <>
            {/* Role & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Vocal Role"
                value={config.vocals.role}
                options={ROLE_OPTIONS}
                onChange={(v) => updateVocals({ role: v as VocalRole })}
              />
              <Select
                label="Gender"
                value={config.vocals.gender}
                options={GENDER_OPTIONS}
                onChange={(v) => updateVocals({ gender: v as VocalGender })}
              />
            </div>

            {/* Timbre */}
            <Select
              label="Timbre"
              value={config.vocals.timbre}
              options={TIMBRE_OPTIONS}
              onChange={(v) => updateVocals({ timbre: v as VocalTimbre })}
            />

            {/* Styles (Multi-select) */}
            <MultiSelect
              label="Vocal Styles"
              values={config.vocals.styles}
              options={STYLE_OPTIONS}
              onChange={(v) => updateVocals({ styles: v as VocalStyle[] })}
              maxSelections={3}
              placeholder="Select up to 3 styles..."
            />

            {/* Performance Intensity */}
            <Select
              label="Performance Intensity"
              value={config.vocals.performance}
              options={PERFORMANCE_OPTIONS}
              onChange={(v) => updateVocals({ performance: v as PerformanceIntensity })}
            />

            {/* Vocal Level */}
            <Slider
              label="Vocal Prominence"
              value={Math.round(config.vocals.level * 100)}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) => updateVocals({ level: v / 100 })}
            />

            {/* Harmonies Toggle */}
            <Toggle
              label="Include Harmonies"
              checked={config.vocals.harmonies}
              onChange={(v) => updateVocals({ harmonies: v })}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default VocalsSection;
