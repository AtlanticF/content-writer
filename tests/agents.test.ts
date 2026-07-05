import { describe, expect, it } from 'vitest';
import { AgentLoop, type AgentModel, type AgentTool } from '../src/agents.js';
import type { ModelMessage } from '../src/types.js';

const createEchoModel = (): AgentModel => ({
  async generate({ messages }) {
    const last = messages.at(-1);

    return {
      role: 'assistant',
      content: `echo:${typeof last?.content === 'string' ? last.content : ''}`,
    };
  },
});

describe('AgentLoop', () => {
  it('stores only model messages and derives that the model should act next', () => {
    const agent = new AgentLoop({ model: createEchoModel() });

    agent.userInput('Write about focus.');

    const messages: ModelMessage[] = agent.getMessages();
    expect(messages).toEqual([{ role: 'user', content: 'Write about focus.' }]);
    expect(agent._next()).toMatchObject({
      actor: 'model',
      unprocessedToolCalls: [],
    });
  });

  it('runs one model step with the custom loop', async () => {
    const agent = new AgentLoop({ model: createEchoModel() });

    agent.userInput('Topic');
    const state = await agent.next();

    expect(state.actor).toBe('user');
    expect(agent.getMessages()).toEqual([
      { role: 'user', content: 'Topic' },
      { role: 'assistant', content: 'echo:Topic' },
    ]);
  });

  it('detects waiting tool calls from assistant model messages', () => {
    const agent = new AgentLoop({ model: createEchoModel() });

    agent.addMessages([
      {
        role: 'assistant',
        content: [
          {
            type: 'tool-call',
            toolCallId: 'call-1',
            toolName: 'thinking',
            input: { thought: 'Choose a concrete next sentence.' },
          },
        ],
      },
    ]);

    expect(agent.getUnprocessedToolCalls()).toEqual([
      {
        id: 'call-1',
        name: 'thinking',
        input: { thought: 'Choose a concrete next sentence.' },
      },
    ]);
    expect(agent.getUnprocessedTollCalls()).toEqual(agent.getUnprocessedToolCalls());
    expect(agent._next().actor).toBe('model');
  });

  it('executes a waiting tool call and records the finished result as a model message', async () => {
    const tools: Record<string, AgentTool> = {
      thinking: {
        async execute(input) {
          return { thought: String(input['thought']) };
        },
      },
    };
    const agent = new AgentLoop({ model: createEchoModel(), tools });

    agent.addMessages([
      {
        role: 'assistant',
        content: [
          {
            type: 'tool-call',
            toolCallId: 'call-1',
            toolName: 'thinking',
            input: { thought: 'Plan next.' },
          },
        ],
      },
    ]);

    await agent.executeTool(agent.getUnprocessedToolCalls()[0]);

    expect(agent.getMessages().at(-1)).toEqual({
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolCallId: 'call-1',
          toolName: 'thinking',
          output: {
            type: 'json',
            value: { thought: 'Plan next.' },
          },
        },
      ],
    });
    expect(agent.getUnprocessedToolCalls()).toEqual([]);
    expect(agent._next().actor).toBe('model');
  });

  it('supports the legacy misspelled excuteTool alias', async () => {
    const agent = new AgentLoop({
      model: createEchoModel(),
      tools: {
        thinking: {
          async execute() {
            return { ok: true };
          },
        },
      },
    });

    await agent.excuteTool({ id: 'call-1', name: 'thinking', input: {} });

    expect(agent.getMessages().at(-1)).toEqual({
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolCallId: 'call-1',
          toolName: 'thinking',
          output: {
            type: 'json',
            value: { ok: true },
          },
        },
      ],
    });
  });
});
