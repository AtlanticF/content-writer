# PRD: Content Writer CLI

## Problem

Long-form content creators often know the topic they want to write about but struggle to turn it into a polished article that matches their personal style. Generic AI writing tools produce large drafts too quickly, which forces the user to review and rewrite after the fact. This product slows the writing loop down to one sentence at a time so the user can approve, reject, or refine each sentence while the system learns explicit writing preferences from those refinements.

## Target User

The first target user is a long-form content creator or content marketer who writes original articles from a topic. They care about wording, tone, rhythm, and personal style. They want help writing, not a multi-platform repurposing system.

## Goal

Build a TypeScript CLI app that opens a terminal writing workspace from a topic, generates one candidate sentence at a time, lets the user approve/reject/refine that sentence, and stores refinements as local JSON preference rules.

## Non-Goals

- No platform selection for Rednote, Instagram, X, WeChat Official Account, or blogs in MVP.
- No source-text rewriting in MVP.
- No outline or angle workflow in MVP.
- No full-draft generation before review in MVP.
- No agent SDK or agent framework.
- No database for memory in MVP.
- No persistent conversation context or compaction in MVP.

## User Flow

1. User runs `content-writer write "topic"`.
2. CLI opens a two-pane terminal UI.
3. Left pane shows the approved article, grouped by paragraph.
4. Right pane shows the current paragraph and candidate sentence.
5. User chooses approve, reject, or refine.
6. Approved and refined sentences are appended to the article.
7. Refined sentences create or update local JSON preference rules.
8. The writing model uses existing preferences when generating future sentences.
9. User finishes and exports the article.

## Functional Requirements

- The CLI accepts a topic and starts a writing session.
- The app generates exactly one candidate sentence for the user to review at a time.
- The UI shows the current paragraph number and sentence number.
- The user can approve a candidate sentence.
- The user can reject a candidate sentence and request a replacement.
- The user can refine a candidate sentence through inline editing.
- Refined sentences are saved into the article.
- Refinement pairs are sent to the memory extraction flow.
- Memory extraction writes local JSON preference rules.
- Preference rules include article id, topic, paragraph index, sentence index, original sentence, refined sentence, and changed word or phrase when available.
- The agent core is implemented manually in TypeScript.
- The app separates app/UI messages from model messages through `getMessages()` and `toModelMessages()`.
- The application controls all side effects, including model calls and tool execution.
- Tools are registered under `src/tools/` and executed outside the core.
- User config can select different models for writing and memory extraction.

## Acceptance Criteria

- [ ] A documented architecture exists for TypeScript CLI, stateless agent core, tools, prompts, memory, and model routing.
- [ ] A documented UI/UX flow exists for the two-pane sentence approval workspace.
- [ ] A documented JSON memory schema exists with provenance down to paragraph, sentence, and word/phrase level when available.
- [ ] A documented user story set exists for topic start, sentence approval, rejection, refinement, memory learning, and export.
- [ ] The PRD explicitly excludes platform-specific writing, source rewriting, and outline/angle workflows from MVP.
- [ ] The PRD states that no agent SDK or agent framework will be used.
- [ ] The PRD states that memory is local JSON for MVP.

## Success Metrics

- A user can complete one long-form article through the sentence approval loop.
- A user refines at least several sentences during the session.
- Later candidate sentences reflect at least one saved preference rule.
- The user can inspect local preference JSON and understand what the system learned.

## Risks

- Sentence-by-sentence review may feel too slow for long articles.
- Preference extraction may create rules that are too broad or too narrow.
- The writing model may overfit to recent preferences and reduce article variety.
- Tool calls must be idempotent, or retries after crashes may create duplicate side effects.

## Vertical Slices

1. Documentation slice: architecture, PRD, user stories, UI/UX, and memory schema.
2. CLI skeleton: TypeScript project, command entry, config loading, and empty Ink UI.
3. Session loop: topic input, article state, candidate sentence placeholder, approve/reject/refine controls.
4. Agent core: message store, actor derivation, unprocessed tool-call derivation, app-controlled loop.
5. Model routing: writing model and memory model clients behind interfaces.
6. Memory: preference JSON store and preference extraction flow.
7. Export: save final article to Markdown.

