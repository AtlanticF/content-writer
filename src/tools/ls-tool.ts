import { tool } from 'ai';
import { z } from 'zod';

export type LsToolInput = {
  path: string;
};

export type LsToolOutput = {
  path: string;
  entries: Array<{
    name: string;
    type: 'file' | 'directory' | 'other';
  }>;
};

export type LsToolRuntime = {
  list(input: LsToolInput): Promise<LsToolOutput> | LsToolOutput;
};

export function createLsTool(runtime: LsToolRuntime) {
  return tool({
    description:
      'List files and folders when the user asks to inspect local writing material or before reading an unknown path.',
    inputSchema: z.object({
      path: z.string().describe('Directory path to list.'),
    }),
    async execute(input: LsToolInput) {
      return runtime.list(input);
    },
  });
}
