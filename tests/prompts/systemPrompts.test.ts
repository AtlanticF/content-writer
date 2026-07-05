import { describe, expect, it } from 'vitest';
import { createMemorySystemPrompt } from '../../src/prompts/system.memory.js';
import { createWorkflowSystemPrompt } from '../../src/prompts/system.workflow.js';
import type { CopilotRequest, CopilotResponse } from '../../src/types.js';

describe('createWorkflowSystemPrompt', () => {
  it('includes user performance memory and write-unit workflow guidance', () => {
    const prompt = createWorkflowSystemPrompt({
      memory: 'Prefer direct verbs over abstract nouns.',
    });

    expect(prompt).toContain(
      'User performace is: Prefer direct verbs over abstract nouns. you need follow with it.',
    );
    expect(prompt).toContain('Role');
    expect(prompt).toContain('write unit');
    expect(prompt).toContain('Approve, reject, or refine');
    expect(prompt).toContain('Use ls tools to discover available files and folders');
    expect(prompt).toContain('Use read tools to load a specific file');
    expect(prompt).toContain('Use grep/search tools to find relevant notes');
    expect(prompt).not.toContain('Use translate tools');
    expect(prompt).toContain('You MUST answer concisely with fewer than 4 lines');
    expect(prompt).toContain('Proactiveness');
  });
});

describe('createMemorySystemPrompt', () => {
  it('builds a strict JSON memory prompt for refined feedback', () => {
    const req: CopilotRequest = {
      tool: 'write',
      intention_string: 'This is very important for creators.',
      file_id: 'article-1',
    };
    const res: CopilotResponse = {
      status: 'refined',
      write_string: 'Creators cannot ignore this pressure.',
    };

    const prompt = createMemorySystemPrompt({
      req,
      res,
      currentMemory: '- Prefer concrete pressure over generic importance.',
    });

    expect(prompt).toContain('You are a memory engine');
    expect(prompt).toContain('Status: refined');
    expect(prompt).toContain('FileID: article-1');
    expect(prompt).toContain('<from>');
    expect(prompt).toContain('This is very important for creators.');
    expect(prompt).toContain('<to>');
    expect(prompt).toContain('Creators cannot ignore this pressure.');
    expect(prompt).toContain('- Prefer concrete pressure over generic importance.');
    expect(prompt).toContain('"action": "add" | "update" | "delete"');
    expect(prompt).toContain('Return strict JSON only, no commentary.');
  });

  it('builds reject feedback with reason and without refined from-to blocks', () => {
    const req: CopilotRequest = {
      tool: 'write',
      intention_string: 'A rejected sentence',
      file_id: 'article-2',
    };
    const res: CopilotResponse = {
      status: 'reject',
      reason: 'Too promotional',
    };

    const prompt = createMemorySystemPrompt({
      req,
      res,
      currentMemory: '',
    });

    expect(prompt).toContain('User rejected the LLM output. Reason: Too promotional');
    expect(prompt).not.toContain('<from>');
    expect(prompt).not.toContain('<to>');
  });
});
