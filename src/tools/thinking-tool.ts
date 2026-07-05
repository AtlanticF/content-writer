import { tool } from 'ai';
import { z } from 'zod';

export type ThinkingToolInput = {
  thought: string;
};

export type ThinkingToolOutput = {
  thought: string;
};

export function createThinkingTool() {
  return tool({
    description:
      'Record a concise private planning note before choosing the next essay write unit or inspecting article state.',
    inputSchema: z.object({
      thought: z.string().describe('A concise planning note for the current writing step.'),
    }),
    async execute(input: ThinkingToolInput) {
      return {
        thought: input.thought,
      };
    },
  });
}
