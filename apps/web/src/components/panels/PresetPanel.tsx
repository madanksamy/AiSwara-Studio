'use client';

import { useState, useEffect } from 'react';
import { useConfigStore } from '@/stores/configStore';
import type { CanonicalSchema } from '@/types/schema';

interface Preset {
  id: string;
  name: string;
  category: string;
  tags: string[];
  config: CanonicalSchema;
  preview?: string;
  isSystem: boolean;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'tamil_film', label: 'Tamil Film' },
  { id: 'carnatic', label: 'Carnatic' },
  { id: 'folk', label: 'Folk' },
  { id: 'fusion', label: 'Fusion' },
  { id: 'devotional', label: 'Devotional' },
  { id: 'indie', label: 'Indie' },
  { id: 'user', label: 'My Presets' },
];

// System presets (curated)
const SYSTEM_PRESETS: Preset[] = [
  {
    id: 'tamil-80s-ballad',
    name: 'Tamil 80s Ballad',
    category: 'tamil_film',
    tags: ['ilaiyaraaja', 'melody', 'romantic'],
    preview: 'Warm analog production, melodic Tamil vocals with classical nuances...',
    isSystem: true,
    config: {} as CanonicalSchema, // Will be populated from server
  },
  {
    id: 'tamil-mass-2010s',
    name: 'Tamil Mass Song',
    category: 'tamil_film',
    tags: ['kuthu', 'high-energy', 'edm'],
    preview: 'High-energy electronic production with folk percussion layers...',
    isSystem: true,
    config: {} as CanonicalSchema,
  },
  {
    id: 'carnatic-kriti',
    name: 'Carnatic Kriti',
    category: 'carnatic',
    tags: ['classical', 'traditional', 'raga'],
    preview: 'Traditional Carnatic composition with mridangam and veena...',
    isSystem: true,
    config: {} as CanonicalSchema,
  },
  {
    id: 'carnatic-fusion',
    name: 'Carnatic Ambient Fusion',
    category: 'fusion',
    tags: ['ambient', 'electronic', 'raga'],
    preview: 'Ethereal pads with classical ragas and electronic textures...',
    isSystem: true,
    config: {} as CanonicalSchema,
  },
  {
    id: 'tamil-folk-parai',
    name: 'Tamil Parai Dance',
    category: 'folk',
    tags: ['parai', 'high-energy', 'village'],
    preview: 'Energetic parai drums with village folk vocals...',
    isSystem: true,
    config: {} as CanonicalSchema,
  },
  {
    id: 'devotional-soft',
    name: 'Tamil Devotional',
    category: 'devotional',
    tags: ['bhakti', 'soft', 'temple'],
    preview: 'Soft devotional with nadaswaram and gentle percussion...',
    isSystem: true,
    config: {} as CanonicalSchema,
  },
  {
    id: 'fusion-rock',
    name: 'Indian Fusion Rock',
    category: 'fusion',
    tags: ['rock', 'electric-guitar', 'raga'],
    preview: 'Electric guitar riffs with Indian melodic elements...',
    isSystem: true,
    config: {} as CanonicalSchema,
  },
  {
    id: 'tamil-90s-duet',
    name: '90s Tamil Pop Duet',
    category: 'tamil_film',
    tags: ['duet', 'melody', 'ar-rahman'],
    preview: 'Sweet melodic duet with synthesizers and acoustic layers...',
    isSystem: true,
    config: {} as CanonicalSchema,
  },
];

export function PresetPanel() {
  const [presets, setPresets] = useState<Preset[]>(SYSTEM_PRESETS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const config = useConfigStore((state) => state.config);
  const setConfig = useConfigStore((state) => state.setConfig);
  const resetToDefaults = useConfigStore((state) => state.resetToDefaults);

  // Load presets from server
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const response = await fetch('/api/presets');
        if (response.ok) {
          const data = await response.json();
          setPresets([...SYSTEM_PRESETS, ...(data.presets || [])]);
        }
      } catch (error) {
        console.error('Failed to load presets:', error);
      }
    };

    loadPresets();
  }, []);

  const filteredPresets = presets.filter((preset) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'user' ? !preset.isSystem : preset.category === selectedCategory);

    const matchesSearch =
      !searchQuery ||
      preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      preset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleLoadPreset = async (preset: Preset) => {
    setLoading(true);
    try {
      // If preset config is empty (placeholder), fetch from server
      if (!preset.config.global) {
        const response = await fetch(`/api/presets/${preset.id}`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data.config);
        }
      } else {
        setConfig(preset.config);
      }
    } catch (error) {
      console.error('Failed to load preset:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) return;

    try {
      const response = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPresetName,
          config,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPresets((prev) => [...prev, data.preset]);
        setSaveModalOpen(false);
        setNewPresetName('');
      }
    } catch (error) {
      console.error('Failed to save preset:', error);
    }
  };

  return (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Presets
        </h2>

        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => setSaveModalOpen(true)}
            className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors"
          >
            Save Current
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search presets..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Preset List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-zinc-500">Loading...</div>
        ) : filteredPresets.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">No presets found</div>
        ) : (
          filteredPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              className="w-full p-3 text-left bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-zinc-100 text-sm">
                    {preset.name}
                    {preset.isSystem && (
                      <span className="ml-2 text-xs text-purple-400">★</span>
                    )}
                  </div>
                  {preset.preview && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {preset.preview}
                    </p>
                  )}
                  <div className="flex gap-1 mt-2">
                    {preset.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[10px] bg-zinc-700 text-zinc-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Save Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-700 w-96">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Save Preset</h3>
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Preset name..."
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSaveModalOpen(false);
                  setNewPresetName('');
                }}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePreset}
                disabled={!newPresetName.trim()}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PresetPanel;
