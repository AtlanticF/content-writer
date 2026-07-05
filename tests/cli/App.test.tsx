import { describe, expect, it } from 'vitest';
import { createCopilotViewModel } from '../../src/cli/App.js';

describe('createCopilotViewModel', () => {
  it('describes the two-pane copilot writing workspace', () => {
    const view = createCopilotViewModel({
      topic: '失业2个月，我和自己完成了和解',
      approvedSentences: ['我以为失业会把我击垮。'],
      candidate: '后来我发现，它只是让我停下来。',
      paragraphIndex: 1,
      status: 'review',
      refineMode: false,
      draft: '',
      error: undefined,
    });

    expect(view.leftTitle).toBe('Approved Article');
    expect(view.leftBody).toContain('我以为失业会把我击垮。');
    expect(view.rightTitle).toBe('Agent Copilot');
    expect(view.rightBody).toContain('Paragraph 1');
    expect(view.rightBody).toContain('后来我发现，它只是让我停下来。');
    expect(view.controls).toContain('a approve');
    expect(view.controls).toContain('r reject');
    expect(view.controls).toContain('e refine');
  });

  it('shows refine draft as the active editable candidate', () => {
    const view = createCopilotViewModel({
      topic: 'A topic',
      approvedSentences: [],
      candidate: 'Original sentence.',
      paragraphIndex: 2,
      status: 'review',
      refineMode: true,
      draft: 'Refined sentence.',
      error: undefined,
    });

    expect(view.rightBody).toContain('Paragraph 2');
    expect(view.rightBody).toContain('Refined sentence.');
    expect(view.controls).toContain('enter save');
    expect(view.controls).toContain('esc cancel');
  });
});
