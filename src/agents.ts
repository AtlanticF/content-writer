import { createMemoryContext } from './context.js';
import type { JSONValue } from 'ai';
import type { ModelMessage } from './types.js';

export type AgentActor = 'user' | 'model' | 'tool';

export type AgentToolCall = {
  id: string;
  name: string;
  input: Record<string, unknown>;
};

export type AgentMessage =
  | {
      role: 'user';
      content: string;
    }
  | {
      role: 'assistant';
      content?: string;
      toolCalls?: AgentToolCall[];
    }
  | {
      role: 'tool';
      toolCallId: string;
      toolName: string;
      content: string;
      result: unknown;
    };

export type AgentState = {
  messages: AgentMessage[];
  modelMessages: ModelMessage[];
  actor: AgentActor;
  unprocessedToolCalls: AgentToolCall[];
};

export type AgentModel = {
  generate(input: {
    messages: ModelMessage[];
  }): Promise<Extract<AgentMessage, { role: 'assistant' }>>;
};

export type AgentTool = {
  execute(input: Record<string, unknown>): Promise<unknown> | unknown;
};

export type AgentLoopOptions = {
  model: AgentModel;
  tools?: Record<string, AgentTool>;
};

export class AgentLoop {
  readonly #context = createMemoryContext<AgentMessage, ModelMessage>({
    toModelMessage: toModelMessage,
  });
  readonly #model: AgentModel;
  readonly #tools: Record<string, AgentTool>;

  constructor({ model, tools = {} }: AgentLoopOptions) {
    this.#model = model;
    this.#tools = tools;
  }

  addMessages(messages: AgentMessage[]): void {
    this.#context.addMessages(messages);
  }

  userInput(content: string): AgentState {
    this.addMessages([{ role: 'user', content }]);

    return this._next();
  }

  getMessages(): AgentMessage[] {
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
      modelMessages: this.toModelMessages(),
      actor: deriveActor(messages, unprocessedToolCalls),
      unprocessedToolCalls,
    };
  }

  async next(): Promise<AgentState> {
    const state = this._next();

    if (state.actor === 'tool') {
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
    this.addMessages([
      {
        role: 'tool',
        toolCallId: toolCall.id,
        toolName: toolCall.name,
        content: stringifyToolResult(result),
        result,
      },
    ]);

    return this._next();
  }

  async excuteTool(toolCall: AgentToolCall): Promise<AgentState> {
    return this.executeTool(toolCall);
  }
}

export function deriveActor(
  messages: AgentMessage[],
  unprocessedToolCalls = deriveUnprocessedToolCalls(messages),
): AgentActor {
  if (unprocessedToolCalls.length > 0) {
    return 'tool';
  }

  const lastMessage = messages.at(-1);

  if (!lastMessage || lastMessage.role === 'assistant') {
    return 'user';
  }

  return 'model';
}

export function deriveUnprocessedToolCalls(messages: AgentMessage[]): AgentToolCall[] {
  const processedToolCallIds = new Set(
    messages
      .filter((message): message is Extract<AgentMessage, { role: 'tool' }> => message.role === 'tool')
      .map((message) => message.toolCallId),
  );

  return messages.flatMap((message) => {
    if (message.role !== 'assistant') {
      return [];
    }

    return (message.toolCalls ?? []).filter((toolCall) => !processedToolCallIds.has(toolCall.id));
  });
}

function toModelMessage(message: AgentMessage): ModelMessage {
  if (message.role === 'tool') {
    return {
      role: 'tool',
      content: [
        {
          type: 'tool-result',
          toolCallId: message.toolCallId,
          toolName: message.toolName,
          output: {
            type: 'json',
            value: message.result as JSONValue,
          },
        },
      ],
    };
  }

  if (message.role === 'assistant' && message.toolCalls?.length) {
    return {
      role: 'assistant',
      content: [
        ...(message.content
          ? [
              {
                type: 'text' as const,
                text: message.content,
              },
            ]
          : []),
        ...message.toolCalls.map((toolCall) => ({
          type: 'tool-call' as const,
          toolCallId: toolCall.id,
          toolName: toolCall.name,
          input: toolCall.input,
        })),
      ],
    };
  }

  return {
    role: message.role,
    content: message.content ?? '',
  };
}

function stringifyToolResult(result: unknown): string {
  if (typeof result === 'string') {
    return result;
  }

  return JSON.stringify(result);
}
