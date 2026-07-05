import { createMemoryContext } from './context.js';
import type { JSONValue } from 'ai';
import type { ModelMessage } from './types.js';

export type AgentActor = 'user' | 'model';

export type AgentToolCall = {
  id: string;
  name: string;
  input: Record<string, unknown>;
};

export type AgentState = {
  messages: ModelMessage[];
  modelMessages: ModelMessage[];
  actor: AgentActor;
  unprocessedToolCalls: AgentToolCall[];
};

export type AgentModel = {
  generate(input: { messages: ModelMessage[] }): Promise<ModelMessage>;
};

export type AgentTool = {
  execute(input: Record<string, unknown>): Promise<unknown> | unknown;
};

type AgentContentPart =
  | {
      type: 'tool-call';
      toolCallId: string;
      toolName: string;
      input: unknown;
    }
  | {
      type: 'tool-result';
      toolCallId: string;
      toolName: string;
      output: unknown;
    }
  | {
      type?: string;
      [key: string]: unknown;
    };

export type AgentLoopOptions = {
  model: AgentModel;
  tools?: Record<string, AgentTool>;
};

export class AgentLoop {
  readonly #context = createMemoryContext<ModelMessage>();
  readonly #model: AgentModel;
  readonly #tools: Record<string, AgentTool>;

  constructor({ model, tools = {} }: AgentLoopOptions) {
    this.#model = model;
    this.#tools = tools;
  }

  addMessages(messages: ModelMessage[]): void {
    this.#context.addMessages(messages);
  }

  userInput(content: string): AgentState {
    this.addMessages([{ role: 'user', content }]);

    return this._next();
  }

  getMessages(): ModelMessage[] {
    return this.#context.getMessages();
  }

  toModelMessages(): ModelMessage[] {
    return this.#context.toModelMessages();
  }

  getUnprocessedToolCalls(): AgentToolCall[] {
    return deriveUnprocessedToolCalls(this.getMessages());
  }

  getUnprocessedTollCalls(): AgentToolCall[] {
    return this.getUnprocessedToolCalls();
  }

  _next(): AgentState {
    const messages = this.getMessages();
    const unprocessedToolCalls = deriveUnprocessedToolCalls(messages);

    return {
      messages,
      modelMessages: messages,
      actor: deriveActor(messages, unprocessedToolCalls),
      unprocessedToolCalls,
    };
  }

  async next(): Promise<AgentState> {
    const state = this._next();

    if (state.unprocessedToolCalls.length > 0) {
      for (const toolCall of state.unprocessedToolCalls) {
        await this.executeTool(toolCall);
      }

      return this._next();
    }

    if (state.actor === 'model') {
      const message = await this.#model.generate({
        messages: state.modelMessages,
      });
      this.addMessages([message]);

      return this._next();
    }

    return state;
  }

  async executeTool(toolCall: AgentToolCall): Promise<AgentState> {
    const selectedTool = this.#tools[toolCall.name];

    if (!selectedTool) {
      throw new Error(`Tool is not registered: ${toolCall.name}`);
    }

    const result = await selectedTool.execute(toolCall.input);
    this.addMessages([createToolResultMessage(toolCall, result)]);

    return this._next();
  }

  async excuteTool(toolCall: AgentToolCall): Promise<AgentState> {
    return this.executeTool(toolCall);
  }
}

export function deriveActor(
  messages: ModelMessage[],
  unprocessedToolCalls = deriveUnprocessedToolCalls(messages),
): AgentActor {
  const lastMessage = messages.at(-1);

  if (!lastMessage) {
    return 'user';
  }

  if (lastMessage.role === 'user' || lastMessage.role === 'tool' || unprocessedToolCalls.length > 0) {
    return 'model';
  }

  return 'user';
}

export function deriveUnprocessedToolCalls(messages: ModelMessage[]): AgentToolCall[] {
  const finishedToolCallIds = new Set(
    messages.flatMap((message) => {
      if (message.role !== 'tool') {
        return [];
      }

      return getContentParts(message.content)
        .filter(isToolResultPart)
        .map((part) => part.toolCallId);
    }),
  );

  return messages.flatMap((message) => {
    if (message.role !== 'assistant') {
      return [];
    }

    return getContentParts(message.content)
      .filter(isToolCallPart)
      .filter((part) => !finishedToolCallIds.has(part.toolCallId))
      .map((part) => ({
        id: part.toolCallId,
        name: part.toolName,
        input: toRecordInput(part.input),
      }));
  });
}

function createToolResultMessage(toolCall: AgentToolCall, result: unknown): ModelMessage {
  return {
    role: 'tool',
    content: [
      {
        type: 'tool-result',
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        output: {
          type: 'json',
          value: result as JSONValue,
        },
      },
    ],
  };
}

function getContentParts(content: ModelMessage['content']): AgentContentPart[] {
  if (typeof content === 'string') {
    return [];
  }

  return content as AgentContentPart[];
}

function isToolCallPart(part: AgentContentPart): part is Extract<AgentContentPart, { type: 'tool-call' }> {
  return part.type === 'tool-call';
}

function isToolResultPart(part: AgentContentPart): part is Extract<AgentContentPart, { type: 'tool-result' }> {
  return part.type === 'tool-result';
}

function toRecordInput(input: unknown): Record<string, unknown> {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    return input as Record<string, unknown>;
  }

  return {};
}
