---
plan: intake
seq: 0001
stage: implement
owner: main
---
# Intake — greenfield bootstrap

A brand-new project. Run the founder funnel before writing any code.

## Now (resume here)
1. Review `docs/product/prd.md`, `docs/product/architecture.md`,
   `docs/product/user-stories.md`, and `docs/product/ui-ux.md`.
2. Resolve the open implementation-planning items in
   `docs/superpowers/specs/2026-07-03-content-writer-cli-design.md`.
3. Run **to-issues**: decompose into atomic, testable implementation issues.

## Founder check

- User: long-form content creator or content marketer who wants help writing an
  original article from a topic.
- Smallest valuable slice: topic input -> sentence generation ->
  approve/reject/refine -> approved article grows -> local JSON preference
  memory updates.
- Riskiest assumption: sentence-by-sentence approval is not too slow and creates
  better personalized long-form writing.
- Build-measure-learn loop: test whether a user can complete one article, refine
  several sentences, and see later candidate sentences reflect saved preference
  rules.

## Five-Step pass

- Questioned: this is a writing assistant for long articles, not a generic
  multi-platform content system.
- Deleted: platform selection, source-text rewriting, outline/angle workflow,
  full-draft-first generation, agent SDK/framework dependency, database memory,
  persistent conversation context, and compaction.
- Simplified: memory is local JSON with article/paragraph/sentence/word
  provenance; context is process memory only.
- Accelerated: first slice focuses on one command, one terminal workspace, one
  sentence loop, and one memory extraction path.
- Automated last: model calls, memory extraction, and tool calls are application
  side effects outside the stateless agent core.

## Problem

Long-form creators need help turning a topic into a polished article without
losing control of wording and style. Existing AI writing flows often generate too
much text at once, forcing users to rewrite after the fact. This project uses a
sentence-by-sentence approval loop so the user can guide the article and the
agent can learn durable preference rules from refinements.

## Acceptance criteria

- [ ] Product docs exist for architecture, PRD, user stories, and CLI UI/UX.
- [ ] PRD states TypeScript CLI, no agent SDK/framework, local JSON memory, and
  handwritten agent core.
- [ ] Architecture defines `src/prompts`, `src/tools`, model routing, process
  memory context, and stateless derived agent state.
- [ ] UI/UX describes left approved-article pane and right agent-sentence pane.
- [ ] Memory schema captures article id, paragraph index, sentence index, and
  word/phrase replacement when available.

## Out of scope

- Platform-specific generation for Rednote, Instagram, X, WeChat Official
  Account, or blogs.
- Source-text rewriting.
- Outline or angle selection workflows.
- Database-backed memory.
- Agent SDKs and agent frameworks.

## Vertical slices (build order)

1. Documentation and implementation issue decomposition.
2. TypeScript CLI skeleton and config loading.
3. Ink terminal workspace with approved-article and agent-sentence panes.
4. Writing session state with approve/reject/refine transitions.
5. Stateless agent core with model-message derivation and app-controlled loop.
6. Model routing for writing and memory extraction.
7. Local JSON preference store and extraction pipeline.
8. Markdown export.

## Next
- Advance stage (`stage-viewer`) to `implement`; the generator builds one
  vertical slice via `tdd` + `slice-coding`.

## Decisions
- 2026-07-03: Target user narrowed to long-form creators/content marketers
  writing original articles from a topic.
- 2026-07-03: MVP removed platform targeting, source rewriting, and outline/angle
  workflows.
- 2026-07-03: Approved architecture uses a handwritten TypeScript agent core,
  Ink-style CLI UI, app-controlled side effects, local JSON preference memory,
  and separate writing/memory model routing.
- 2026-07-05: Advanced to implement for the Ink copilot writing workspace slice.
