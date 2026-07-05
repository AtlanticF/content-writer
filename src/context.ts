import type { ModelMessage } from './types.js';

export type MemoryContextOptions<TMessage, TModelMessage = ModelMessage> = {
  toModelMessage?: (message: TMessage) => TModelMessage;
};

export type MemoryContext<TMessage, TModelMessage = ModelMessage> = {
  addMessages(messages: TMessage[]): void;
  getMessages(): TMessage[];
  toModelMessages(): TModelMessage[];
};

export function createMemoryContext<TMessage, TModelMessage = ModelMessage>({
  toModelMessage,
}: MemoryContextOptions<TMessage, TModelMessage> = {}): MemoryContext<
  TMessage,
  TModelMessage
> {
  const messages: TMessage[] = [];
  const mapToModelMessage =
    toModelMessage ?? ((message: TMessage) => message as unknown as TModelMessage);

  return {
    addMessages(nextMessages: TMessage[]) {
      messages.push(...nextMessages);
    },
    getMessages() {
      return [...messages];
    },
    toModelMessages() {
      return messages.map(mapToModelMessage);
    },
  };
}
