import { tool } from 'ai';
import { z } from 'zod';

export type WritingToolInput = {
  intention: string;
};

export type WritingToolOutput = {
  writeUnit: string;
};

export type WritingToolRuntime = {
  write(input: WritingToolInput): Promise<WritingToolOutput> | WritingToolOutput;
};

export function createWritingTool(runtime: WritingToolRuntime) {
  return tool({
    description:
      'Generate exactly one essay write unit. For MVP, a write unit is one sentence for the user to approve, reject, or refine.',
    inputSchema: z.object({
      intention: z.string().describe('The purpose of the next single-sentence write unit.'),
    }),
    async execute(input: WritingToolInput) {
      return runtime.write(input);
    },
  });
}
