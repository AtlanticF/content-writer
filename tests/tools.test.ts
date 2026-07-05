import { describe, expect, it } from 'vitest';
import {
  contentWriterTools,
  createLsTool,
  createReadTool,
  createThinkingTool,
  createWritingTool,
} from '../src/tools/index.js';

const toolExecutionOptions = {
  toolCallId: 'tool-call-id',
  messages: [],
  abortSignal: undefined,
  context: {},
};

describe('content writer tools', () => {
  it('exports the expected tool registry', () => {
    expect(Object.keys(contentWriterTools).sort()).toEqual([
      'ls',
      'read',
      'thinking',
      'writing',
    ]);
  });

  it('creates an ls tool that delegates directory listing', async () => {
    const lsTool = createLsTool({
      list: async ({ path }) => ({
        path,
        entries: [{ name: 'draft.md', type: 'file' }],
      }),
    });

    await expect(lsTool.execute({ path: 'notes' }, toolExecutionOptions)).resolves.toEqual({
      path: 'notes',
      entries: [{ name: 'draft.md', type: 'file' }],
    });
  });

  it('creates a read tool that delegates file reads', async () => {
    const readTool = createReadTool({
      read: async ({ path }) => ({
        path,
        content: 'A saved draft sentence.',
      }),
    });

    await expect(readTool.execute({ path: 'draft.md' }, toolExecutionOptions)).resolves.toEqual({
      path: 'draft.md',
      content: 'A saved draft sentence.',
    });
  });

  it('creates a thinking tool that records concise planning notes', async () => {
    const thinkingTool = createThinkingTool();

    await expect(
      thinkingTool.execute(
        {
          thought: 'The next sentence should make the tension concrete.',
        },
        toolExecutionOptions,
      ),
    ).resolves.toEqual({
      thought: 'The next sentence should make the tension concrete.',
    });
  });

  it('creates a writing tool that returns one write unit', async () => {
    const writingTool = createWritingTool({
      write: async ({ intention }) => ({
        writeUnit: `Sentence for ${intention}`,
      }),
    });

    await expect(
      writingTool.execute(
        {
          intention: 'show the creator hesitating before publishing',
        },
        toolExecutionOptions,
      ),
    ).resolves.toEqual({
      writeUnit: 'Sentence for show the creator hesitating before publishing',
    });
  });
});
