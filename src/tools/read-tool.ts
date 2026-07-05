import { tool } from 'ai';
import { z } from 'zod';

export type ReadToolInput = {
  path: string;
};

export type ReadToolOutput = {
  path: string;
  content: string;
};

export type ReadToolRuntime = {
  read(input: ReadToolInput): Promise<ReadToolOutput> | ReadToolOutput;
};

export function createReadTool(runtime: ReadToolRuntime) {
  return tool({
    description:
      'Read a specific local file that the user named or that ls discovered for the current essay-writing task.',
    inputSchema: z.object({
      path: z.string().describe('File path to read.'),
    }),
    async execute(input: ReadToolInput) {
      return runtime.read(input);
    },
  });
}
