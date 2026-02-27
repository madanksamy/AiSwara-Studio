/**
 * Quality Constraints Agent - Claude Opus 4.6
 * Final cleaning, quality check, and 600 char hard cap enforcement
 */

import type { Agent, AgentContext, AgentResult } from './types';
import { AgentClients } from '@aiswara/llm-clients';

const HARD_CAP = 600;

const SYSTEM_PROMPT = `You are the Quality Constraints agent for AiSwara Music Studio.
Your job is to review and polish a music style prompt for AI music generators.

Tasks:
1. Fix any grammatical issues, repetition, or awkward phrasing
2. Ensure musical terminology is used correctly (especially Indian/Carnatic terms)
3. Remove redundancy while preserving musical detail
4. Ensure the prompt reads naturally and flows well
5. The final output MUST be under ${HARD_CAP} characters
6. Must end with a period
7. Must start with a capital letter

Return ONLY the polished prompt, no explanation.`;

export const qualityConstraints: Agent = {
  name: 'QualityConstraints',
  llmProvider: 'anthropic',

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      const input = context.platformOutput || '';
      let cleaned: string;
      let tokensUsed = 0;
      let llmUsed = 'claude-opus-4-6-20260225';
      const decisions: string[] = [];

      // Try LLM-based quality check
      try {
        const client = AgentClients.qualityConstraints();
        const response = await client.complete({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: input },
          ],
          temperature: 0.3,
          maxTokens: 1024,
        });

        cleaned = response.content.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
          cleaned = cleaned.slice(1, -1);
        }
        tokensUsed = response.usage.totalTokens;
        llmUsed = response.model;
        decisions.push('LLM-polished via Claude Opus 4.6');
      } catch {
        cleaned = cleanPrompt(input);
        const issues = detectIssues(cleaned);
        if (issues.length > 0) {
          cleaned = fixIssues(cleaned, issues);
          decisions.push(`Fixed ${issues.length} quality issues: ${issues.join(', ')}`);
        }
        decisions.push('Used rule-based fallback (LLM unavailable)');
      }

      // Always enforce hard cap regardless of LLM output
      if (cleaned.length > HARD_CAP) {
        cleaned = enforceHardCap(cleaned);
        decisions.push(`Enforced ${HARD_CAP} char hard cap`);
      }

      const validation = validateOutput(cleaned);
      if (!validation.valid) {
        decisions.push(`Warning: ${validation.warning}`);
      } else {
        decisions.push('Output validated successfully');
      }

      return {
        success: true,
        context: {
          ...context,
          platformOutput: cleaned,
          charCount: cleaned.length,
          metadata: [
            ...context.metadata,
            {
              agentName: 'QualityConstraints',
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
        error: error instanceof Error ? error.message : 'Quality check failed',
      };
    }
  },
};

function cleanPrompt(prompt: string): string {
  return prompt
    .replace(/\s+/g, ' ')
    .replace(/,+/g, ',')
    .replace(/,\./g, '.')
    .trim()
    .replace(/\.+$/, '.')
    .replace(/([^.])$/, '$1.');
}

function detectIssues(prompt: string): string[] {
  const issues: string[] = [];
  const words = prompt.toLowerCase().split(/\s+/);
  const wordCounts = new Map<string, number>();
  for (const word of words) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }
  for (const [, count] of wordCounts) {
    if (count > 3) {
      issues.push('word_repetition');
      break;
    }
  }
  if (/,\s*,/.test(prompt)) {
    issues.push('double_comma');
  }
  const sentences = prompt.split(/[.!?]/);
  if (sentences.some((s) => s.length > 200)) {
    issues.push('long_sentence');
  }
  if (/,\s*\w{1,3}\.$/.test(prompt)) {
    issues.push('orphan_ending');
  }
  return issues;
}

function fixIssues(prompt: string, issues: string[]): string {
  let fixed = prompt;
  for (const issue of issues) {
    switch (issue) {
      case 'double_comma':
        fixed = fixed.replace(/,\s*,/g, ',');
        break;
      case 'orphan_ending':
        fixed = fixed.replace(/,\s*\w{1,3}\.$/, '.');
        break;
    }
  }
  return fixed;
}

function enforceHardCap(prompt: string): string {
  if (prompt.length <= HARD_CAP) return prompt;

  const breakPoints = ['. ', ', ', ' '];
  let truncated = prompt.substring(0, HARD_CAP);

  for (const bp of breakPoints) {
    const lastBreak = truncated.lastIndexOf(bp);
    if (lastBreak > HARD_CAP * 0.8) {
      truncated = truncated.substring(0, lastBreak + (bp === '. ' ? 1 : 0));
      break;
    }
  }

  truncated = truncated.trim();
  if (!truncated.endsWith('.')) {
    truncated += '.';
  }
  if (truncated.length > HARD_CAP) {
    truncated = truncated.substring(0, HARD_CAP - 1) + '.';
  }

  return truncated;
}

function validateOutput(prompt: string): { valid: boolean; warning?: string } {
  if (prompt.length < 50) {
    return { valid: false, warning: 'Prompt too short (< 50 chars)' };
  }
  if (prompt.length > HARD_CAP) {
    return { valid: false, warning: `Prompt exceeds ${HARD_CAP} char limit` };
  }
  if (!prompt.endsWith('.')) {
    return { valid: false, warning: 'Prompt should end with a period' };
  }
  const words = prompt.split(/\s+/).filter((w) => w.length > 2);
  if (words.length < 5) {
    return { valid: false, warning: 'Prompt has too few meaningful words' };
  }
  return { valid: true };
}

export default qualityConstraints;
