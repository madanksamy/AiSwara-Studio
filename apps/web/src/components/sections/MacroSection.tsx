'use client';

import { useConfigStore } from '@/stores/configStore';
import { Knob } from '../controls';

export function MacroSection() {
  const config = useConfigStore((state) => state.config);
  const updateMacroControls = useConfigStore((state) => state.updateMacroControls);

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
      <h2 className="text-lg font-semibold text-zinc-100 mb-2 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Master Controls
      </h2>
      <p className="text-xs text-zinc-400 mb-6">
        These macro controls affect multiple parameters across the entire composition
      </p>

      <div className="flex justify-around items-start">
        {/* Overall Density */}
        <div className="text-center">
          <Knob
            label="Overall Density"
            value={config.macroControls.overallDensity}
            min={0}
            max={100}
            size="lg"
            unit="%"
            onChange={(v) => updateMacroControls({ overallDensity: v })}
          />
          <p className="text-xs text-zinc-500 mt-2 max-w-24">
            Links to percussion, fills, ornamentation
          </p>
        </div>

        {/* Clarity vs Complexity */}
        <div className="text-center">
          <Knob
            label="Clarity ↔ Complexity"
            value={config.macroControls.clarityVsComplexity}
            min={0}
            max={100}
            size="lg"
            unit="%"
            onChange={(v) => updateMacroControls({ clarityVsComplexity: v })}
          />
          <p className="text-xs text-zinc-500 mt-2 max-w-24">
            Inverse links to instruments, alapana
          </p>
        </div>

        {/* Vocal vs Instrumental */}
        <div className="text-center">
          <Knob
            label="Vocal ↔ Instrumental"
            value={config.macroControls.vocalVsInstrumental}
            min={0}
            max={100}
            size="lg"
            unit="%"
            onChange={(v) => updateMacroControls({ vocalVsInstrumental: v })}
          />
          <p className="text-xs text-zinc-500 mt-2 max-w-24">
            Balances focus between vocals and instruments
          </p>
        </div>
      </div>

      {/* Coherence indicator */}
      <div className="mt-6 p-3 bg-zinc-900/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Coherence Score</span>
          <span className="text-green-400 font-medium">High</span>
        </div>
        <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full w-4/5 bg-gradient-to-r from-green-500 to-emerald-400" />
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          All settings are well-balanced and compatible
        </p>
      </div>
    </div>
  );
}

export default MacroSection;
