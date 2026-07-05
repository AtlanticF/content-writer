import { describe, expect, it } from 'vitest';
import { createMemoryContext } from '../src/context.js';

type AppMessage = {
  role: 'user' | 'assistant';
  content: string;
  uiStatus?: 'pending' | 'done';
};

type ModelMessage = {
  role: 'user' | 'assistant';
  content: string;
};

describe('createMemoryContext', () => {
  it('stores messages in RAM and returns them in insertion order', () => {
    const context = createMemoryContext<AppMessage>();

    context.addMessages([
      { role: 'user', content: 'Write about focus.' },
      { role: 'assistant', content: 'Focus starts with refusal.' },
    ]);

    expect(context.getMessages()).toEqual([
      { role: 'user', content: 'Write about focus.' },
      { role: 'assistant', content: 'Focus starts with refusal.' },
    ]);
    expect(context.toModelMessages()).toEqual(context.getMessages());
  });

  it('returns array copies so callers cannot mutate stored context by pushing', () => {
    const context = createMemoryContext<AppMessage>();

    context.addMessages([{ role: 'user', content: 'Topic' }]);
    context.getMessages().push({ role: 'assistant', content: 'Injected' });

    expect(context.getMessages()).toEqual([{ role: 'user', content: 'Topic' }]);
  });

  it('maps app messages to model messages without UI-only fields', () => {
    const context = createMemoryContext<AppMessage, ModelMessage>({
      toModelMessage(message) {
        return {
          role: message.role,
          content: message.content,
        };
      },
    });

    context.addMessages([
      { role: 'user', content: 'Topic', uiStatus: 'done' },
      { role: 'assistant', content: 'Candidate sentence', uiStatus: 'pending' },
    ]);

    expect(context.getMessages()).toEqual([
      { role: 'user', content: 'Topic', uiStatus: 'done' },
      { role: 'assistant', content: 'Candidate sentence', uiStatus: 'pending' },
    ]);
    expect(context.toModelMessages()).toEqual([
      { role: 'user', content: 'Topic' },
      { role: 'assistant', content: 'Candidate sentence' },
    ]);
  });
});
