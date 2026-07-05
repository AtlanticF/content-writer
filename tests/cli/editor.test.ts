import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { openVimEditor } from '../../src/cli/editor.js';

describe('openVimEditor', () => {
  it('writes the candidate to a temporary file and returns the edited text', async () => {
    const edited = await openVimEditor('Original sentence.', {
      runEditor(filePath) {
        expect(readFileSync(filePath, 'utf8')).toBe('Original sentence.');
        writeFileSync(filePath, 'Edited in Vim.', 'utf8');
      },
    });

    expect(edited).toBe('Edited in Vim.');
  });
});
