import { createLsTool, type LsToolRuntime } from './ls-tool.js';
import { createReadTool, type ReadToolRuntime } from './read-tool.js';
import { createThinkingTool } from './thinking-tool.js';
import { createWritingTool, type WritingToolRuntime } from './writing-tool.js';

export { createLsTool } from './ls-tool.js';
export type { LsToolInput, LsToolOutput, LsToolRuntime } from './ls-tool.js';
export { createReadTool } from './read-tool.js';
export type { ReadToolInput, ReadToolOutput, ReadToolRuntime } from './read-tool.js';
export { createThinkingTool } from './thinking-tool.js';
export type { ThinkingToolInput, ThinkingToolOutput } from './thinking-tool.js';
export { createWritingTool } from './writing-tool.js';
export type { WritingToolInput, WritingToolOutput, WritingToolRuntime } from './writing-tool.js';

export type ContentWriterToolRuntime = LsToolRuntime & ReadToolRuntime & WritingToolRuntime;

const unavailable = (toolName: string) => {
  throw new Error(`${toolName} runtime is not configured.`);
};

export function createContentWriterTools(runtime: ContentWriterToolRuntime) {
  return {
    ls: createLsTool(runtime),
    read: createReadTool(runtime),
    thinking: createThinkingTool(),
    writing: createWritingTool(runtime),
  };
}

export const contentWriterTools = createContentWriterTools({
  list: () => unavailable('ls'),
  read: () => unavailable('read'),
  write: () => unavailable('writing'),
});
