'use client';

import { useState, useEffect } from 'react';
import { useConfigStore } from '@/stores/configStore';
import { Slider, Toggle, MultiSelect } from '../controls';
import type { InstrumentConfig } from '@/types/schema';

interface InstrumentData {
  id: string;
  name: string;
  category: string;
  styles: string[];
  techniques?: string[];
  tones?: string[];
}

const CATEGORIES = [
  { id: 'melodic', label: 'Melodic', icon: '🎵' },
  { id: 'percussion', label: 'Percussion', icon: '🥁' },
  { id: 'guitar', label: 'Guitar', icon: '🎸' },
  { id: 'bass', label: 'Bass', icon: '🎸' },
  { id: 'texture', label: 'Texture', icon: '🌊' },
];

export function InstrumentsSection() {
  const [instruments, setInstruments] = useState<InstrumentData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('melodic');
  const [expandedInstrument, setExpandedInstrument] = useState<string | null>(null);

  const config = useConfigStore((state) => state.config);
  const updateInstrumentation = useConfigStore((state) => state.updateInstrumentation);

  useEffect(() => {
    // Load instruments from API
    fetch('/api/instruments')
      .then((res) => res.json())
      .then((data) => setInstruments(data.instruments || []))
      .catch((err) => {
        console.error('Failed to load instruments:', err);
        // Set empty array on failure
        setInstruments([]);
      });
  }, []);

  const filteredInstruments = instruments.filter(
    (inst) => inst.category === selectedCategory
  );

  const selectedInstruments = config.instrumentation.instruments;

  const isSelected = (instrumentId: string) =>
    selectedInstruments.some((inst) => inst.id === instrumentId);

  const toggleInstrument = (instrument: InstrumentData) => {
    if (isSelected(instrument.id)) {
      updateInstrumentation({
        instruments: selectedInstruments.filter((inst) => inst.id !== instrument.id),
      });
    } else {
      const newInstrument: InstrumentConfig = {
        id: instrument.id,
        name: instrument.name,
        role: 'supporting',
        level: 0.5,
        style: instrument.styles[0] || 'standard',
        adjectives: [],
      };
      updateInstrumentation({
        instruments: [...selectedInstruments, newInstrument],
      });
    }
  };

  const updateInstrumentConfig = (
    instrumentId: string,
    updates: Partial<InstrumentConfig>
  ) => {
    updateInstrumentation({
      instruments: selectedInstruments.map((inst) =>
        inst.id === instrumentId ? { ...inst, ...updates } : inst
      ),
    });
  };

  const getInstrumentConfig = (instrumentId: string): InstrumentConfig | undefined =>
    selectedInstruments.find((inst) => inst.id === instrumentId);

  return (
    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        Instruments
        <span className="text-sm text-zinc-500 font-normal ml-2">
          ({selectedInstruments.length} selected)
        </span>
      </h2>

      {/* Max Instruments Slider */}
      <div className="mb-6">
        <Slider
          label="Maximum Instruments"
          value={config.instrumentation.maxInstruments}
          min={1}
          max={12}
          step={1}
          onChange={(v) => updateInstrumentation({ maxInstruments: v })}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Instrument Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {filteredInstruments.map((instrument) => {
          const selected = isSelected(instrument.id);
          const instrumentConfig = getInstrumentConfig(instrument.id);
          const isExpanded = expandedInstrument === instrument.id;

          return (
            <div key={instrument.id} className="relative">
              <button
                onClick={() => toggleInstrument(instrument)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  selected
                    ? 'bg-purple-600/30 border-purple-500 text-purple-100'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                } border`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{instrument.name}</span>
                  {selected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedInstrument(isExpanded ? null : instrument.id);
                      }}
                      className="p-1 hover:bg-purple-500/30 rounded"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </button>

              {/* Expanded Settings */}
              {selected && isExpanded && instrumentConfig && (
                <div className="mt-2 p-4 bg-zinc-800/80 rounded-lg border border-zinc-700 space-y-4">
                  {/* Role */}
                  <div className="flex gap-2">
                    {(['lead', 'supporting', 'texture'] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => updateInstrumentConfig(instrument.id, { role })}
                        className={`flex-1 py-1.5 px-2 text-xs rounded capitalize ${
                          instrumentConfig.role === role
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>

                  {/* Level */}
                  <Slider
                    label="Level"
                    value={Math.round(instrumentConfig.level * 100)}
                    min={0}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(v) =>
                      updateInstrumentConfig(instrument.id, { level: v / 100 })
                    }
                  />

                  {/* Style */}
                  {instrument.styles.length > 1 && (
                    <div className="flex flex-wrap gap-1">
                      {instrument.styles.map((style) => (
                        <button
                          key={style}
                          onClick={() =>
                            updateInstrumentConfig(instrument.id, { style })
                          }
                          className={`px-2 py-1 text-xs rounded ${
                            instrumentConfig.style === style
                              ? 'bg-pink-600 text-white'
                              : 'bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredInstruments.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          Loading instruments...
        </div>
      )}
    </div>
  );
}

export default InstrumentsSection;
