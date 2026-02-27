'use client';

import { useConfigStore } from '@/stores/configStore';
import { Slider, Select, Toggle } from '../controls';

const KIT_PRESETS = [
  { value: 'carnatic_traditional', label: 'Carnatic Traditional', description: 'Mridangam + Ghatam + Kanjira' },
  { value: 'tamil_folk', label: 'Tamil Folk', description: 'Parai + Thavil + Urumi' },
  { value: 'fusion_hybrid', label: 'Fusion Hybrid', description: 'Tabla + Drums + Electronic' },
  { value: 'film_standard', label: 'Film Standard', description: 'Drums + Dholak + Percussion' },
  { value: 'electronic_modern', label: 'Electronic Modern', description: '808s + Synth Drums' },
  { value: 'acoustic_minimal', label: 'Acoustic Minimal', description: 'Light acoustic kit' },
  { value: 'kuthu_high_energy', label: 'Kuthu High Energy', description: 'Layered drums + folk' },
  { value: 'lofi_chill', label: 'Lo-Fi Chill', description: 'Soft vinyl drums' },
  { value: 'custom', label: 'Custom', description: 'Build your own kit' },
];

const GROOVE_STYLES = [
  { value: 'straight', label: 'Straight' },
  { value: 'swing', label: 'Swing' },
  { value: 'shuffle', label: 'Shuffle' },
  { value: 'syncopated', label: 'Syncopated' },
  { value: 'polyrhythmic', label: 'Polyrhythmic' },
];

export function PercussionSection() {
  const config = useConfigStore((state) => state.config);
  const updateInstrumentation = useConfigStore((state) => state.updateInstrumentation);

  const percussion = config.instrumentation.percussion;

  const updatePercussion = (updates: Partial<typeof percussion>) => {
    updateInstrumentation({
      percussion: { ...percussion, ...updates },
    });
  };

  return (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Percussion
      </h2>

      <div className="space-y-6">
        {/* Kit Preset */}
        <Select
          label="Kit Preset"
          value={percussion.kit}
          options={KIT_PRESETS}
          onChange={(v) => updatePercussion({ kit: v })}
        />

        {/* Groove Style */}
        <Select
          label="Groove Style"
          value={percussion.groove || 'straight'}
          options={GROOVE_STYLES}
          onChange={(v) => updatePercussion({ groove: v })}
        />

        {/* Density Slider */}
        <Slider
          label="Density"
          value={percussion.density}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(v) => updatePercussion({ density: v })}
        />

        {/* Complexity Slider */}
        <Slider
          label="Pattern Complexity"
          value={percussion.complexity || 50}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(v) => updatePercussion({ complexity: v })}
        />

        {/* Fills */}
        <Slider
          label="Fill Frequency"
          value={percussion.fills}
          min={0}
          max={100}
          step={5}
          unit="%"
          onChange={(v) => updatePercussion({ fills: v })}
        />

        {/* Human Feel */}
        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
          <div>
            <div className="text-sm font-medium text-zinc-200">Human Feel</div>
            <div className="text-xs text-zinc-500">Add timing variations for organic sound</div>
          </div>
          <Slider
            label=""
            value={percussion.humanFeel || 50}
            min={0}
            max={100}
            step={5}
            unit="%"
            onChange={(v) => updatePercussion({ humanFeel: v })}
            showValue={false}
            className="w-32"
          />
        </div>
      </div>
    </div>
  );
}

export default PercussionSection;
