import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

type EditorRunner = (filePath: string) => void;

export type OpenVimEditorOptions = {
  editor?: string;
  runEditor?: EditorRunner;
};

export async function openVimEditor(
  initialText: string,
  { editor = process.env['VISUAL'] ?? process.env['EDITOR'] ?? 'vim', runEditor }: OpenVimEditorOptions = {},
): Promise<string> {
  const directory = mkdtempSync(join(tmpdir(), 'content-writer-'));
  const filePath = join(directory, 'write-unit.md');

  writeFileSync(filePath, initialText, 'utf8');

  try {
    if (runEditor) {
      runEditor(filePath);
    } else {
      runTerminalEditor(editor, filePath);
    }

    return readFileSync(filePath, 'utf8');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function runTerminalEditor(editor: string, filePath: string): void {
  const rawMode = process.stdin.isTTY && process.stdin.isRaw;

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }

  try {
    const result = spawnSync(editor, [filePath], {
      stdio: 'inherit',
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      throw new Error(`${editor} exited with status ${result.status}`);
    }
  } finally {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(rawMode);
    }
  }
}
