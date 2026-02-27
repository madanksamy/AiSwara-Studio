'use client';

import { useConfigStore } from '@/stores/configStore';
import { Slider, Select, Toggle } from '../controls';
import type { SongForm, Tala } from '@/types/schema';

const FORM_OPTIONS: { value: SongForm; label: string; description: string }[] = [
  { value: 'verse_chorus', label: 'Verse-Chorus', description: 'Standard pop/film structure' },
  { value: 'verse_chorus_bridge', label: 'Verse-Chorus-Bridge', description: 'With a contrasting bridge' },
  { value: 'aaba', label: 'AABA', description: 'Classic 32-bar form' },
  { value: 'through_composed', label: 'Through-Composed', description: 'Continuous, no repeats' },
  { value: 'rondo', label: 'Rondo', description: 'ABACA pattern' },
  { value: 'pallavi_anupallavi_charanam', label: 'Pallavi-Anupallavi-Charanam', description: 'Traditional Carnatic' },
  { value: 'kriti', label: 'Kriti', description: 'Full Carnatic composition' },
  { value: 'varnam', label: 'Varnam', description: 'Carnatic exercise form' },
  { value: 'film_intro_verse_chorus', label: 'Film Style', description: 'Intro + verse-chorus' },
  { value: 'kuthu_buildup', label: 'Kuthu Buildup', description: 'High-energy Tamil style' },
  { value: 'free_form', label: 'Free Form', description: 'No fixed structure' },
];

const TALA_OPTIONS: { value: Tala; label: string; description: string }[] = [
  { value: 'adi', label: 'Adi Tala', description: '8 beats (4+2+2)' },
  { value: 'rupaka', label: 'Rupaka Tala', description: '3 beats (1+2)' },
  { value: 'khanda_chapu', label: 'Khanda Chapu', description: '5 beats' },
  { value: 'misra_chapu', label: 'Misra Chapu', description: '7 beats' },
  { value: 'tisra_eka', label: 'Tisra Eka', description: '3 beats' },
  { value: 'western_4_4', label: '4/4 Time', description: 'Standard Western' },
  { value: 'western_3_4', label: '3/4 Time', description: 'Waltz time' },
  { value: 'western_6_8', label: '6/8 Time', description: 'Compound duple' },
  { value: 'mixed', label: 'Mixed Meter', description: 'Varying time signatures' },
  { value: 'free_rhythm', label: 'Free Rhythm', description: 'No fixed meter' },
];

export function StructureSection() {
  const config = useConfigStore((state) => state.config);
  const updateStructure = useConfigStore((state) => state.updateStructure);

  const { form, tala, energyCurve, sections, modulations, breakdowns } = config.structure;

  return (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
        Structure
      </h2>

      <div className="space-y-6">
        {/* Form & Tala */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Song Form"
            value={form}
            options={FORM_OPTIONS}
            onChange={(v) => updateStructure({ form: v as SongForm })}
          />
          <Select
            label="Tala / Time Signature"
            value={tala}
            options={TALA_OPTIONS}
            onChange={(v) => updateStructure({ tala: v as Tala })}
          />
        </div>

        {/* Energy Curve Editor */}
        <div>
          <label className="text-sm text-zinc-300 font-medium mb-3 block">
            Energy Curve
          </label>
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-end justify-between h-24 gap-1">
              {energyCurve.map((point, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={point.energy}
                    onChange={(e) => {
                      const newCurve = [...energyCurve];
                      newCurve[index] = {
                        ...point,
                        energy: parseInt(e.target.value),
                      };
                      updateStructure({ energyCurve: newCurve });
                    }}
                    className="h-20 appearance-none bg-transparent [writing-mode:vertical-lr] cursor-pointer"
                    style={{
                      background: `linear-gradient(to top, #9333ea ${point.energy}%, #27272a ${point.energy}%)`,
                    }}
                  />
                  <span className="text-[10px] text-zinc-500">{point.label}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-500">
              <span>Start</span>
              <span>→ Song Progression →</span>
              <span>End</span>
            </div>
          </div>
        </div>

        {/* Section Count */}
        <Slider
          label="Number of Sections"
          value={sections}
          min={2}
          max={8}
          step={1}
          onChange={(v) => updateStructure({ sections: v })}
        />

        {/* Toggles */}
        <div className="flex gap-6">
          <Toggle
            label="Key Modulations"
            checked={modulations}
            onChange={(v) => updateStructure({ modulations: v })}
          />
          <Toggle
            label="Include Breakdowns"
            checked={breakdowns}
            onChange={(v) => updateStructure({ breakdowns: v })}
          />
        </div>
      </div>
    </div>
  );
}

export default StructureSection;
