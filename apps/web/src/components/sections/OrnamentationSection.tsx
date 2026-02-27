'use client';

import { useConfigStore } from '@/stores/configStore';
import { Slider, Select, Toggle, MultiSelect } from '../controls';
import type { RagaFlavor, CarnaticTechnique, FolkElement } from '@/types/schema';

const RAGA_OPTIONS: { value: RagaFlavor; label: string; description: string }[] = [
  { value: 'none', label: 'No Raga', description: 'Western/modern harmony' },
  { value: 'mayamalavagowla', label: 'Mayamalavagowla', description: 'Symmetrical, morning raga' },
  { value: 'shankarabharanam', label: 'Shankarabharanam', description: 'Major scale equivalent' },
  { value: 'kalyani', label: 'Kalyani', description: 'Bright, auspicious' },
  { value: 'kharaharapriya', label: 'Kharaharapriya', description: 'Natural minor feel' },
  { value: 'harikambhoji', label: 'Harikambhoji', description: 'Mixolydian feel' },
  { value: 'mohanam', label: 'Mohanam', description: 'Pentatonic, pleasant' },
  { value: 'hamsadhwani', label: 'Hamsadhwani', description: 'Auspicious, bright' },
  { value: 'abhogi', label: 'Abhogi', description: 'Light, romantic' },
  { value: 'charukesi', label: 'Charukesi', description: 'Film-friendly' },
  { value: 'hindolam', label: 'Hindolam', description: 'Pentatonic, devotional' },
  { value: 'revathi', label: 'Revathi', description: 'Melancholic' },
  { value: 'kapi', label: 'Kapi', description: 'Emotional, night raga' },
  { value: 'sahana', label: 'Sahana', description: 'Devotional, serene' },
  { value: 'generic_indian', label: 'Generic Indian', description: 'Indian flavor without specific raga' },
];

const CARNATIC_TECHNIQUE_OPTIONS: { value: CarnaticTechnique; label: string; description: string }[] = [
  { value: 'alapana', label: 'Alapana', description: 'Raga elaboration without rhythm' },
  { value: 'gamakam', label: 'Gamakam', description: 'Oscillations and ornaments' },
  { value: 'sangati', label: 'Sangati', description: 'Melodic variations' },
  { value: 'brigas', label: 'Brigas', description: 'Fast melodic runs' },
  { value: 'kalpanaswaram', label: 'Kalpanaswaram', description: 'Improvised swaras' },
  { value: 'neraval', label: 'Neraval', description: 'Lyric elaboration' },
  { value: 'korvai', label: 'Korvai', description: 'Rhythmic pattern sequences' },
  { value: 'thani_avartanam', label: 'Thani Avartanam', description: 'Percussion solo' },
];

const FOLK_ELEMENT_OPTIONS: { value: FolkElement; label: string; description: string }[] = [
  { value: 'gaana', label: 'Gaana', description: 'Chennai street music style' },
  { value: 'parai', label: 'Parai', description: 'Traditional frame drum' },
  { value: 'oyilattam', label: 'Oyilattam', description: 'Folk dance rhythm' },
  { value: 'kummi', label: 'Kummi', description: 'Clapping folk dance' },
  { value: 'kolattam', label: 'Kolattam', description: 'Stick dance' },
  { value: 'kavadi', label: 'Kavadi', description: 'Devotional procession' },
  { value: 'therukoothu', label: 'Therukoothu', description: 'Street theater' },
  { value: 'oppari', label: 'Oppari', description: 'Lament style' },
  { value: 'naiyandi', label: 'Naiyandi', description: 'Temple festival' },
  { value: 'urumi', label: 'Urumi', description: 'Urumi drum' },
  { value: 'villuppattu', label: 'Villuppattu', description: 'Bow song' },
];

export function OrnamentationSection() {
  const config = useConfigStore((state) => state.config);
  const updateOrnamentation = useConfigStore((state) => state.updateOrnamentation);

  const carnatic = config.ornamentation.carnatic;
  const folk = config.ornamentation.folk;

  return (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        Ornamentation
      </h2>

      {/* Carnatic Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          Carnatic Elements
        </h3>

        <Toggle
          label="Enable Carnatic Ornamentation"
          checked={carnatic.enabled}
          onChange={(v) =>
            updateOrnamentation({
              carnatic: { ...carnatic, enabled: v },
            })
          }
        />

        {carnatic.enabled && (
          <div className="space-y-4 pl-4 border-l-2 border-orange-500/30">
            <Select
              label="Raga Flavor"
              value={carnatic.ragaFlavor}
              options={RAGA_OPTIONS}
              onChange={(v) =>
                updateOrnamentation({
                  carnatic: { ...carnatic, ragaFlavor: v as RagaFlavor },
                })
              }
              searchable
            />

            <MultiSelect
              label="Techniques"
              values={carnatic.techniques}
              options={CARNATIC_TECHNIQUE_OPTIONS}
              onChange={(v) =>
                updateOrnamentation({
                  carnatic: { ...carnatic, techniques: v as CarnaticTechnique[] },
                })
              }
              maxSelections={4}
              placeholder="Select techniques..."
            />

            <Slider
              label="Ornamentation Complexity"
              value={carnatic.complexity}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) =>
                updateOrnamentation({
                  carnatic: { ...carnatic, complexity: v },
                })
              }
            />
          </div>
        )}
      </div>

      {/* Folk Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Tamil Folk Elements
        </h3>

        <Toggle
          label="Enable Folk Elements"
          checked={folk.enabled}
          onChange={(v) =>
            updateOrnamentation({
              folk: { ...folk, enabled: v },
            })
          }
        />

        {folk.enabled && (
          <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
            <MultiSelect
              label="Folk Elements"
              values={folk.elements}
              options={FOLK_ELEMENT_OPTIONS}
              onChange={(v) =>
                updateOrnamentation({
                  folk: { ...folk, elements: v as FolkElement[] },
                })
              }
              maxSelections={3}
              placeholder="Select folk elements..."
            />

            <Slider
              label="Folk Intensity"
              value={folk.intensity}
              min={0}
              max={100}
              step={5}
              unit="%"
              onChange={(v) =>
                updateOrnamentation({
                  folk: { ...folk, intensity: v },
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default OrnamentationSection;
