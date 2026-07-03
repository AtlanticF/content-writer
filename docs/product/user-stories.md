# User Stories

## Persona

As a long-form content creator, I want the assistant to help me write an original article from a topic while preserving my personal writing style.

## Stories

### Start A Writing Session

As a user, I want to run a command with a topic so that the CLI opens a focused writing workspace.

Acceptance criteria:

- Given a topic, the app creates a new article session.
- The app shows the topic in the UI.
- The article starts empty.
- The app generates the first candidate sentence.

### Review One Sentence

As a user, I want to review one generated sentence at a time so that I stay in control of the article.

Acceptance criteria:

- The right pane shows one candidate sentence.
- The UI shows the current paragraph and sentence number.
- The user can choose approve, reject, or refine.

### Approve A Sentence

As a user, I want to approve a good sentence so that it becomes part of the article.

Acceptance criteria:

- Approved sentence is appended to the left article pane.
- The app advances to the next sentence.
- The writing model receives updated article context.

### Reject A Sentence

As a user, I want to reject a bad sentence so that the assistant tries again without adding it to the article.

Acceptance criteria:

- Rejected sentence is not added to the article.
- The app records the rejection in session state.
- The app requests a replacement sentence.

### Refine A Sentence

As a user, I want to edit a candidate sentence directly so that the final article uses my words.

Acceptance criteria:

- The UI opens an inline editing input.
- The refined sentence is saved into the article.
- The original and refined sentence pair is sent to memory extraction.
- The app advances to the next sentence.

### Learn A Preference

As a user, I want the assistant to learn clear preference rules from my refinements so that future sentences better match my style.

Acceptance criteria:

- The memory model creates a JSON preference rule.
- The rule describes why the refined wording is better than the original wording.
- The rule includes replace-from and replace-to details when detectable.
- The rule includes article id, topic, paragraph index, sentence index, and source sentence data.

### Use A Preference

As a user, I want the writing model to use saved preferences so that I do not repeat the same refinements.

Acceptance criteria:

- Existing preference rules are included in the writing prompt.
- Later candidate sentences reflect relevant saved rules.
- The app does not expose raw memory JSON in the normal writing UI.

### Export Article

As a user, I want to finish and export the article so that I can publish or edit it elsewhere.

Acceptance criteria:

- The app can save the approved article as Markdown.
- Paragraph grouping is preserved.
- Export path is shown to the user.

### Configure Models

As a user, I want to configure different models for writing and memory so that I can control quality and cost.

Acceptance criteria:

- Config exposes a writing model.
- Config exposes a memory model.
- Writing defaults to a higher-quality model.
- Memory defaults to a cheaper mini model.

