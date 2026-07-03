# Content Writer CLI Design

## Summary

This project is a TypeScript CLI writing assistant for long-form content creators. The MVP writes original articles from a user-provided topic. It generates one sentence at a time, lets the user approve, reject, or refine each sentence, and records refinements as local JSON writing preference rules.

## Approved Direction

Use a sentence approval loop with local preference memory.

The user enters a topic. The application opens a two-pane terminal UI. The left pane shows approved article content grouped by paragraph. The right pane shows the current paragraph, current sentence number, and one candidate sentence. The user approves, rejects, or refines the sentence. Refinements update the article and create preference rules.

## Architecture

The system has four major layers:

- CLI UI: terminal rendering, panes, keybindings, refine input, status messages.
- Agent app: owns model calls, tool execution, user actions, and loop control.
- Agent core: stores messages and derives actor plus unprocessed tool calls.
- Memory: stores local JSON preference rules and session provenance.

The core does not execute side effects. It only derives state from messages. The application executes model calls and tools.

## Key Decisions

- TypeScript is the implementation language.
- Ink is the recommended terminal UI framework.
- The agent core is handwritten and does not use an agent SDK or framework.
- Prompts live in `src/prompts/`.
- Tools live in `src/tools/`.
- Writing and memory can use different configured models.
- Context is process memory only in MVP.
- Memory is local JSON in MVP.
- Tool execution must be idempotent.

## Documents

- `docs/product/architecture.md`
- `docs/product/prd.md`
- `docs/product/user-stories.md`
- `docs/product/ui-ux.md`

## Open Items For Implementation Planning

- Choose final CLI command parser.
- Choose exact model provider interface.
- Define export file naming.
- Decide whether paragraph boundaries are model-proposed or user-controlled in MVP.

