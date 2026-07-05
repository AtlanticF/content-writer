export type MemoryContextOptions<TMessage, TModelMessage = TMessage> = {
  toModelMessage?: (message: TMessage) => TModelMessage;
};

export type MemoryContext<TMessage, TModelMessage = TMessage> = {
  addMessages(messages: TMessage[]): void;
  getMessages(): TMessage[];
  toModelMessages(): TModelMessage[];
};

export function createMemoryContext<TMessage, TModelMessage = TMessage>({
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
