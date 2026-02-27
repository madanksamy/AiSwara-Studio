/**
 * Style Composer Agent - GPT-5.2 Pro HighThinking
 * Creates abstract description layers using deep reasoning
 */

import type { Agent, AgentContext, AgentResult, StyleLayer } from './types';
import { AgentClients } from '@aiswara/llm-clients';

const SYSTEM_PROMPT = `You are the Style Composer for AiSwara Music Studio, an AI music prompt generator focused on Indian/Tamil music.
Given a normalized music configuration JSON, generate a JSON array of style layers.

Each layer has:
- category: one of "genre", "mood", "instrumentation", "vocals", "ornamentation", "structure", "mix"
- description: a rich, evocative natural language description (5-30 words) using music terminology
- priority: 1-10 (10=most important, genre/mood highest, mix lowest)
- keywords: array of 2-5 key terms

Create 5-8 layers covering genre, mood/tempo, instruments, vocals, ornamentation, and mix.
Use vivid, specific music vocabulary. Reference Indian/Tamil musical traditions where relevant.
Return ONLY the JSON array, no explanation.`;

export const styleComposer: Agent = {
  name: 'StyleComposer',
  llmProvider: 'openai',

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      let styleLayers: StyleLayer[];
      let tokensUsed = 0;
      let llmUsed = 'gpt-5.2-pro-highthinking';
      const decisions: string[] = [];

      try {
        const client = AgentClients.styleComposer();
        const response = await client.complete({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: JSON.stringify(context.normalizedConfig, null, 2) },
          ],
          temperature: 0.8,
          maxTokens: 2048,
        });

        styleLayers = JSON.parse(response.content) as StyleLayer[];
        tokensUsed = response.usage.totalTokens;
        llmUsed = response.model;
        decisions.push('LLM-composed style layers via GPT-5.2');
      } catch {
        styleLayers = generateStyleLayers(context.normalizedConfig);
        decisions.push('Used rule-based fallback (LLM unavailable)');
      }

      decisions.push(
        `Generated ${styleLayers.length} style layers`,
        'Applied genre-specific vocabulary',
        'Created cohesive mood description',
      );

      return {
        success: true,
        context: {
          ...context,
          styleLayers,
          metadata: [
            ...context.metadata,
            {
              agentName: 'StyleComposer',
              llmUsed,
              tokensUsed,
              processingTimeMs: Date.now() - startTime,
              decisions,
            },
          ],
        },
      };
    } catch (error) {
      return {
        success: false,
        context,
        error: error instanceof Error ? error.message : 'Style composition failed',
      };
    }
  },
};

/**
 * Generate style layers from config (rule-based fallback)
 */
function generateStyleLayers(config: unknown): StyleLayer[] {
  const layers: StyleLayer[] = [];

  if (!config || typeof config !== 'object') {
    return layers;
  }

  const cfg = config as Record<string, unknown>;

  if (cfg.global && typeof cfg.global === 'object') {
    const global = cfg.global as Record<string, unknown>;

    if (global.genre) {
      layers.push({
        category: 'genre',
        description: formatGenre(global.genre as string),
        priority: 10,
        keywords: [global.genre as string],
      });
    }

    if (global.moodAxes && typeof global.moodAxes === 'object') {
      const axes = global.moodAxes as Record<string, number>;
      const moodDesc = describeMood(axes);
      if (moodDesc) {
        layers.push({
          category: 'mood',
          description: moodDesc,
          priority: 9,
          keywords: moodDesc.split(' ').filter((w) => w.length > 3),
        });
      }
    }

    if (typeof global.tempo === 'number') {
      layers.push({
        category: 'mood',
        description: describeTempo(global.tempo),
        priority: 8,
        keywords: ['tempo', 'rhythm'],
      });
    }
  }

  if (cfg.instrumentation && typeof cfg.instrumentation === 'object') {
    const inst = cfg.instrumentation as Record<string, unknown>;
    if (Array.isArray(inst.instruments) && inst.instruments.length > 0) {
      const instDesc = describeInstruments(inst.instruments);
      layers.push({
        category: 'instrumentation',
        description: instDesc,
        priority: 7,
        keywords: inst.instruments.map((i: unknown) =>
          (i as Record<string, string>).name || (i as Record<string, string>).id
        ),
      });
    }

    if (inst.percussion && typeof inst.percussion === 'object') {
      const percDesc = describePercussion(inst.percussion as Record<string, unknown>);
      if (percDesc) {
        layers.push({
          category: 'instrumentation',
          description: percDesc,
          priority: 6,
          keywords: ['percussion', 'drums', 'rhythm'],
        });
      }
    }
  }

  if (cfg.vocals && typeof cfg.vocals === 'object') {
    const vocals = cfg.vocals as Record<string, unknown>;
    if (vocals.language !== 'instrumental_only') {
      const vocalDesc = describeVocals(vocals);
      layers.push({
        category: 'vocals',
        description: vocalDesc,
        priority: 8,
        keywords: ['vocals', 'voice', 'singing'],
      });
    }
  }

  if (cfg.ornamentation && typeof cfg.ornamentation === 'object') {
    const orn = cfg.ornamentation as Record<string, unknown>;
    const ornDesc = describeOrnamentation(orn);
    if (ornDesc) {
      layers.push({
        category: 'ornamentation',
        description: ornDesc,
        priority: 5,
        keywords: ['ornament', 'embellishment'],
      });
    }
  }

  if (cfg.mix && typeof cfg.mix === 'object') {
    const mix = cfg.mix as Record<string, unknown>;
    const mixDesc = describeMix(mix);
    if (mixDesc) {
      layers.push({
        category: 'mix',
        description: mixDesc,
        priority: 4,
        keywords: ['production', 'mix', 'sound'],
      });
    }
  }

  return layers.sort((a, b) => b.priority - a.priority);
}

function formatGenre(genre: string): string {
  return genre.replace(/_/g, ' ');
}

function describeMood(axes: Record<string, number>): string {
  const parts: string[] = [];
  if (axes.energy > 70) parts.push('high energy');
  else if (axes.energy < 30) parts.push('calm and relaxed');
  if (axes.brightness > 70) parts.push('bright');
  else if (axes.brightness < 30) parts.push('dark');
  if (axes.warmth > 70) parts.push('warm');
  else if (axes.warmth < 30) parts.push('cool');
  if (axes.tension > 70) parts.push('intense');
  else if (axes.tension < 30) parts.push('peaceful');
  return parts.join(', ');
}

function describeTempo(tempo: number): string {
  if (tempo < 70) return 'slow, languid tempo';
  if (tempo < 100) return 'moderate, flowing tempo';
  if (tempo < 130) return 'upbeat, driving tempo';
  return 'fast, energetic tempo';
}

function describeInstruments(instruments: unknown[]): string {
  const names = instruments.map((i) => {
    const inst = i as Record<string, unknown>;
    const name = inst.name as string;
    const role = inst.role as string;
    return role === 'lead' ? `lead ${name}` : name;
  });
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function describePercussion(perc: Record<string, unknown>): string {
  const parts: string[] = [];
  if (perc.kit && perc.kit !== 'custom') {
    parts.push((perc.kit as string).replace(/_/g, ' '));
  }
  if (typeof perc.density === 'number') {
    if (perc.density > 70) parts.push('dense');
    else if (perc.density < 30) parts.push('minimal');
  }
  parts.push('percussion');
  return parts.join(' ');
}

function describeVocals(vocals: Record<string, unknown>): string {
  const parts: string[] = [];
  if (vocals.gender && vocals.gender !== 'neutral') {
    parts.push(vocals.gender as string);
  }
  parts.push(vocals.language as string);
  parts.push('vocals');
  if (Array.isArray(vocals.styles) && vocals.styles.length > 0) {
    const style = (vocals.styles[0] as string).replace(/_/g, ' ');
    parts.push(`in ${style} style`);
  }
  if (vocals.performance === 'intense' || vocals.performance === 'dramatic') {
    parts.push(`with ${vocals.performance} delivery`);
  }
  return parts.join(' ');
}

function describeOrnamentation(orn: Record<string, unknown>): string {
  const parts: string[] = [];
  if (orn.carnatic && typeof orn.carnatic === 'object') {
    const carnatic = orn.carnatic as Record<string, unknown>;
    if (carnatic.enabled) {
      if (carnatic.ragaFlavor && carnatic.ragaFlavor !== 'none') {
        parts.push(`${(carnatic.ragaFlavor as string).replace(/_/g, ' ')} raga flavor`);
      }
      if (Array.isArray(carnatic.techniques) && carnatic.techniques.length > 0) {
        const tech = carnatic.techniques.slice(0, 2).map((t) => (t as string).replace(/_/g, ' ')).join(' and ');
        parts.push(`with ${tech}`);
      }
    }
  }
  if (orn.folk && typeof orn.folk === 'object') {
    const folk = orn.folk as Record<string, unknown>;
    if (folk.enabled && Array.isArray(folk.elements) && folk.elements.length > 0) {
      const el = (folk.elements[0] as string).replace(/_/g, ' ');
      parts.push(`${el} folk influence`);
    }
  }
  return parts.join(', ');
}

function describeMix(mix: Record<string, unknown>): string {
  const parts: string[] = [];
  if (Array.isArray(mix.adjectives) && mix.adjectives.length > 0) {
    parts.push(...(mix.adjectives as string[]).slice(0, 2));
  }
  if (mix.spatialSize && mix.spatialSize !== 'medium_hall') {
    parts.push((mix.spatialSize as string).replace(/_/g, ' ') + ' space');
  }
  if (parts.length > 0) {
    return parts.join(', ') + ' production';
  }
  return '';
}

export default styleComposer;
