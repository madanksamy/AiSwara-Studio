'use client';

import { useConfigStore } from '@/stores/configStore';
import { Slider, Select, Knob } from '../controls';
import type { Genre, UseCase } from '@/types/schema';

const GENRE_OPTIONS: { value: Genre; label: string }[] = [
  { value: 'carnatic_classical', label: 'Carnatic Classical' },
  { value: 'carnatic_fusion', label: 'Carnatic Fusion' },
  { value: 'tamil_film', label: 'Tamil Film' },
  { value: 'tamil_folk', label: 'Tamil Folk' },
  { value: 'tamil_indie', label: 'Tamil Indie' },
  { value: 'devotional', label: 'Devotional' },
  { value: 'ghazal', label: 'Ghazal' },
  { value: 'qawwali', label: 'Qawwali' },
  { value: 'bollywood', label: 'Bollywood' },
  { value: 'indian_pop', label: 'Indian Pop' },
  { value: 'indian_rock', label: 'Indian Rock' },
  { value: 'indian_electronic', label: 'Indian Electronic' },
  { value: 'lofi_indian', label: 'Lo-Fi Indian' },
  { value: 'ambient_indian', label: 'Ambient Indian' },
  { value: 'world_fusion', label: 'World Fusion' },
];

const USE_CASE_OPTIONS: { value: UseCase; label: string; description: string }[] = [
  { value: 'background_score', label: 'Background Score', description: 'Film/video background music' },
  { value: 'standalone_song', label: 'Standalone Song', description: 'Complete song with vocals' },
  { value: 'instrumental', label: 'Instrumental', description: 'Pure instrumental piece' },
  { value: 'meditation', label: 'Meditation', description: 'Calm, meditative music' },
  { value: 'workout', label: 'Workout', description: 'High-energy exercise music' },
  { value: 'study', label: 'Study', description: 'Focus-friendly background' },
  { value: 'party', label: 'Party', description: 'Dance/party music' },
  { value: 'romantic', label: 'Romantic', description: 'Love songs and ballads' },
  { value: 'cinematic', label: 'Cinematic', description: 'Epic orchestral pieces' },
];

export function GlobalSection() {
  const config = useConfigStore((state) => state.config);
  const updateGlobal = useConfigStore((state) => state.updateGlobal);

  return (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Global Settings
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Genre & Use Case */}
        <Select
          label="Genre"
          value={config.global.genre}
          options={GENRE_OPTIONS}
          onChange={(v) => updateGlobal({ genre: v as Genre })}
          searchable
        />

        <Select
          label="Use Case"
          value={config.global.useCase}
          options={USE_CASE_OPTIONS}
          onChange={(v) => updateGlobal({ useCase: v as UseCase })}
        />
      </div>

      {/* Tempo */}
      <div className="mt-6">
        <Slider
          label="Tempo"
          value={config.global.tempo}
          min={40}
          max={200}
          step={1}
          unit=" BPM"
          onChange={(v) => updateGlobal({ tempo: v })}
        />
      </div>

      {/* Mood Axes - 4 Knobs */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">Mood Axes</h3>
        <div className="flex justify-around">
          <Knob
            label="Energy"
            value={config.global.moodAxes.energy}
            min={0}
            max={100}
            onChange={(v) =>
              updateGlobal({
                moodAxes: { ...config.global.moodAxes, energy: v },
              })
            }
            unit="%"
          />
          <Knob
            label="Tension"
            value={config.global.moodAxes.tension}
            min={0}
            max={100}
            onChange={(v) =>
              updateGlobal({
                moodAxes: { ...config.global.moodAxes, tension: v },
              })
            }
            unit="%"
          />
          <Knob
            label="Brightness"
            value={config.global.moodAxes.brightness}
            min={0}
            max={100}
            onChange={(v) =>
              updateGlobal({
                moodAxes: { ...config.global.moodAxes, brightness: v },
              })
            }
            unit="%"
          />
          <Knob
            label="Warmth"
            value={config.global.moodAxes.warmth}
            min={0}
            max={100}
            onChange={(v) =>
              updateGlobal({
                moodAxes: { ...config.global.moodAxes, warmth: v },
              })
            }
            unit="%"
          />
        </div>
      </div>
    </div>
  );
}

export default GlobalSection;
