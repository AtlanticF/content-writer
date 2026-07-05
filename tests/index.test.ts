import { describe, expect, it } from 'vitest';
import { generateWriteUnit } from '../src/index.js';
import type { LlmClient } from '../src/llm.js';

describe('generateWriteUnit', () => {
  it('runs one custom agent-loop writing turn', async () => {
    const llmClient: Pick<LlmClient, 'generateText'> = {
      async generateText({ role, prompt }) {
        return `${role}:${prompt}`;
      },
    };

    await expect(
      generateWriteUnit('slow tools for creators', {
        llmClient,
        memory: 'Prefer concrete language.',
      }),
    ).resolves.toContain('writing:Write one sentence about: slow tools for creators');
  });
});
