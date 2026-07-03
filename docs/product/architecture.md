# Content Writer CLI Architecture

## Goal

Build a TypeScript CLI writing assistant for long-form content creators. The first product slice helps a user write an original article from a topic, one sentence at a time. The user approves, rejects, or refines each generated sentence. Refinements are stored as local JSON preference rules and used by future writing rounds.

## Constraints

- Language: TypeScript.
- Runtime: Node.js CLI.
- UI: terminal UI built with a TypeScript CLI UI framework.
- Agent core: implemented in this project, without an agent SDK or agent framework.
- Memory: local JSON files for MVP.
- Context: process memory only for MVP. No persistence, no compaction, no long-term conversation database.
- Tool execution: tools must be idempotent because failed in-flight tool calls are treated as not started and may be retried.

## Recommended Libraries

- CLI UI: Ink, because it supports component-based terminal UI in TypeScript.
- CLI command parsing: Commander or CAC.
- Validation: Zod for config, memory, model response, and tool schemas.
- Tests: Vitest.

## Source Layout

```text
src/
  cli/
    App.tsx
    components/
      ArticlePane.tsx
      AgentPane.tsx
      ParagraphStatus.tsx
      SentenceActions.tsx
      ToolStatus.tsx
    keybindings.ts

  app/
    AgentApp.ts
    WritingApp.ts
    renderState.ts

  agent-core/
    AgentCore.ts
    AgentState.ts
    deriveActor.ts
    deriveToolCalls.ts
    types.ts

  context/
    MessageStore.ts
    types.ts

  prompts/
    system.memory.ts
    system.workflow.ts
    writing.ts
    preference-extraction.ts

  tools/
    ls.ts
    read.ts
    thinking-tool.ts
    translate-tool.ts
    registry.ts
    types.ts

  models/
    ModelClient.ts
    ModelRouter.ts
    types.ts

  memory/
    PreferenceExtractor.ts
    PreferenceStore.ts
    types.ts

  session/
    ArticleState.ts
    WritingSession.ts
    types.ts

  config/
    Config.ts
```

Prompt files are deliberately separate. The referenced Claude Code prompt collection separates identity, workflow, reminders, compacting, and output style prompts; this project should follow the same modular pattern instead of building one large prompt.

Reference: https://github.com/Yuyz0112/claude-code-reverse/tree/main/results/prompts

## Agent Core

The agent core is a small functional state machine. It stores model messages and derives everything else from those messages.

```ts
type Actor = "user" | "model";

type DerivedAgentState = {
  messages: AppMessage[];
  modelMessages: ModelMessage[];
  actor: Actor;
  unprocessedToolCalls: ToolCall[];
};
```

Core API:

```ts
addMessages(messages: AppMessage[]): AgentState
getMessages(): AppMessage[]
toModelMessages(): ModelMessage[]
deriveActor(messages: AppMessage[]): Actor
deriveUnprocessedToolCalls(messages: AppMessage[]): ToolCall[]
```

`getMessages()` returns application messages with UI fields, provenance, display status, and other local metadata.

`toModelMessages()` returns the simplest message shape needed by the LLM. It excludes UI-only fields.

The core does not execute model calls or tools. It only computes what should happen next:

- If `actor` is `model`, the application may automatically trigger a model call.
- If `actor` is `user`, the application renders controls and waits for user action.
- If `unprocessedToolCalls` is non-empty, the application executes those tools and appends tool results as messages.

This keeps all impure actions in the application layer.

## Agent Application

The application owns control. It receives the derived state from the core and decides what to do:

1. Render messages, actor state, and tool-call state into the terminal UI.
2. If the actor is `model`, automatically call the configured writing model.
3. If there are unprocessed tool calls, execute them through the tool registry.
4. If the actor is `user`, wait for approve, reject, refine, quit, or command input.
5. Append the resulting messages back into the agent core.

The rendering path is idempotent: the same state must always render the same UI.

## Tool System

Tools live under `src/tools/` and are registered by name. Initial tools:

- `thinking-tool`: records explicit reasoning steps or planning notes for the model.
- `ls`: lists allowed local directories.
- `read`: reads allowed local files.
- `translate-tool`: translates selected text when needed.

Tool requirements:

- Tool calls are idempotent.
- Tools validate inputs before execution.
- Tools return structured results.
- Tools do not mutate user content unless the application explicitly routes that result into article or memory state.
- Interactive tools can request user input through the application, not the core.

## Model Routing

Different tasks use different models:

```json
{
  "models": {
    "writing": "high-level-model",
    "memory": "mini-model",
    "toolReasoning": "mini-model"
  }
}
```

Writing uses the strongest configured model because style, flow, and article quality matter. Memory extraction uses a cheaper mini model because it is structured input and output.

## Context Management

The MVP uses in-process memory only:

```ts
type MessageStore<T extends AppMessage> = {
  addMessages(messages: T[]): void;
  getMessages(): T[];
  toModelMessages(): ModelMessage[];
};
```

There is no persistence for conversation context in MVP. Article drafts and memory rules are persisted separately as JSON files.

## Local Files

```text
.content-writer/
  config.json
  preferences.json
  sessions/
    <article-id>.json
```

`preferences.json` stores reusable writing preference rules. Session files store article state and provenance.

