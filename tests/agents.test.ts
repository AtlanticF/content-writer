import { describe, expect, it } from 'vitest';
import { AgentLoop, type AgentModel, type AgentTool } from '../src/agents.js';

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
  it('accepts user input and derives that the model should act next', () => {
    const agent = new AgentLoop({ model: createEchoModel() });

    agent.userInput('Write about focus.');

    expect(agent.getMessages()).toEqual([{ role: 'user', content: 'Write about focus.' }]);
    expect(agent._next()).toMatchObject({
      actor: 'model',
      unprocessedToolCalls: [],
    });
  });

  it('runs one model step without using an SDK agent loop', async () => {
    const agent = new AgentLoop({ model: createEchoModel() });

    agent.userInput('Topic');
    const state = await agent.next();

    expect(state.actor).toBe('user');
    expect(agent.getMessages()).toEqual([
      { role: 'user', content: 'Topic' },
      { role: 'assistant', content: 'echo:Topic' },
    ]);
  });

  it('detects unprocessed tool calls from assistant messages', () => {
    const agent = new AgentLoop({ model: createEchoModel() });

    agent.addMessages([
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: 'call-1',
            name: 'thinking',
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
    expect(agent._next().actor).toBe('tool');
  });

  it('executes a tool call and records its result as a tool message', async () => {
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
        toolCalls: [{ id: 'call-1', name: 'thinking', input: { thought: 'Plan next.' } }],
      },
    ]);

    await agent.executeTool(agent.getUnprocessedToolCalls()[0]);

    expect(agent.getMessages().at(-1)).toEqual({
      role: 'tool',
      toolCallId: 'call-1',
      toolName: 'thinking',
      content: '{"thought":"Plan next."}',
      result: { thought: 'Plan next.' },
    });
    expect(agent.getUnprocessedToolCalls()).toEqual([]);
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

    expect(agent.getMessages().at(-1)).toMatchObject({
      role: 'tool',
      toolCallId: 'call-1',
      toolName: 'thinking',
    });
  });
});
