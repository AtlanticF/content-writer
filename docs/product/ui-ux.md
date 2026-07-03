# CLI UI/UX

## UX Principle

The CLI is a writing workspace, not a chatbot. The user should always know:

- What article is being written.
- Which paragraph and sentence they are reviewing.
- What the candidate sentence is.
- What action is available next.
- Whether the agent is thinking, calling tools, saving memory, or waiting.

## Layout

```text
+---------------------------------------+--------------------------------------+
| Approved Article                      | Agent Sentence                       |
+---------------------------------------+--------------------------------------+
| Topic: Why creators need slower tools | Paragraph 2 / Sentence 4             |
|                                       |                                      |
| Paragraph 1                           | Candidate:                           |
| The first approved sentence...        | The sentence appears here for review. |
| The second approved sentence...       |                                      |
|                                       | Actions:                             |
| Paragraph 2                           | [A] Approve                          |
| The next paragraph begins here...     | [R] Reject                           |
|                                       | [E] Refine                           |
|                                       | [Q] Quit                             |
|                                       |                                      |
|                                       | Status: waiting for user              |
+---------------------------------------+--------------------------------------+
```

## Pane Behavior

### Left Pane: Approved Article

- Shows only approved or refined sentences.
- Groups sentences by paragraph.
- Keeps paragraph labels visible.
- Scrolls when the article grows beyond the terminal height.
- Does not show rejected candidates.

### Right Pane: Agent Sentence

- Shows one candidate sentence.
- Shows paragraph index and sentence index.
- Shows available actions.
- Shows agent/tool status.
- Shows inline edit mode when the user chooses refine.

## Controls

- `A`: approve candidate sentence.
- `R`: reject candidate sentence.
- `E`: refine candidate sentence.
- `Q`: quit or finish prompt.
- `Enter`: confirm inline refine input.
- `Esc`: cancel inline refine input.

## Refine Flow

1. User presses `E`.
2. Candidate sentence becomes editable text.
3. User changes words, phrases, or the full sentence.
4. User presses `Enter`.
5. Refined sentence is added to the article.
6. Original and refined sentence pair is sent to memory extraction.
7. The right pane shows "saving preference" while memory updates.
8. The app generates the next sentence.

## Agent Status

Statuses should be short and concrete:

- `thinking`
- `reading memory`
- `generating sentence`
- `saving preference`
- `waiting for user`
- `tool waiting`
- `exported`

The UI may show tool names, but should not show raw tool-call JSON.

## Error UX

- Model failure: show retry option and keep current article intact.
- Memory extraction failure: save article sentence anyway and show non-blocking warning.
- Export failure: keep session open and show the failed path.
- Tool failure: show tool name, human-readable error, and retry option.

## Terminal Best Practices

- Keep controls visible and stable.
- Avoid full-screen flicker.
- Avoid verbose logs in the main UI.
- Use clear focus states for refine mode.
- Preserve user text exactly after refinement.
- Make quit/exit confirm if unsaved content exists.
