import { useEffect, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';

type CopilotStatus = 'idle' | 'generating' | 'review' | 'approved' | 'rejected' | 'error';

type CopilotViewModelInput = {
  topic: string;
  approvedSentences: string[];
  candidate?: string;
  paragraphIndex: number;
  status: CopilotStatus;
  refineMode: boolean;
  draft: string;
  error?: string;
};

export type CopilotViewModel = {
  title: string;
  topic: string;
  leftTitle: string;
  leftBody: string;
  rightTitle: string;
  rightBody: string;
  controls: string;
};

type AppProps = {
  topic: string;
  result?: string;
  error?: string;
  generateCandidate?: (topic: string) => Promise<string>;
};

export function createCopilotViewModel({
  topic,
  approvedSentences,
  candidate,
  paragraphIndex,
  status,
  refineMode,
  draft,
  error,
}: CopilotViewModelInput): CopilotViewModel {
  const leftBody = approvedSentences.length > 0 ? approvedSentences.join(' ') : 'No approved sentence yet.';
  const activeCandidate = refineMode ? draft : candidate;
  const statusLine = status === 'generating' ? 'Generating next write unit...' : `Paragraph ${paragraphIndex}`;
  const errorLine = error ? `\n${error}` : '';
  const candidateLine = activeCandidate ? `\n${activeCandidate}` : '';

  return {
    title: 'Content Writer',
    topic,
    leftTitle: 'Approved Article',
    leftBody,
    rightTitle: 'Agent Copilot',
    rightBody: `${statusLine}${candidateLine}${errorLine}`,
    controls: refineMode ? 'enter save | esc cancel | type to edit' : 'a approve | r reject | e refine | q quit',
  };
}

export function App({ topic, result, error, generateCandidate }: AppProps) {
  const { exit } = useApp();
  const [approvedSentences, setApprovedSentences] = useState<string[]>([]);
  const [candidate, setCandidate] = useState(result);
  const [status, setStatus] = useState<CopilotStatus>(result ? 'review' : 'idle');
  const [currentError, setCurrentError] = useState(error);
  const [refineMode, setRefineMode] = useState(false);
  const [draft, setDraft] = useState(result ?? '');

  useEffect(() => {
    let cancelled = false;

    if (candidate || currentError || !generateCandidate) {
      return () => {
        cancelled = true;
      };
    }

    setStatus('generating');
    generateCandidate(topic)
      .then((nextCandidate) => {
        if (cancelled) {
          return;
        }

        setCandidate(nextCandidate);
        setDraft(nextCandidate);
        setStatus('review');
      })
      .catch((caught) => {
        if (cancelled) {
          return;
        }

        setCurrentError(caught instanceof Error ? caught.message : String(caught));
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [candidate, currentError, generateCandidate, topic]);

  useInput((input, key) => {
    if (refineMode) {
      if (key.escape) {
        setDraft(candidate ?? '');
        setRefineMode(false);
        return;
      }

      if (key.return) {
        setCandidate(draft);
        setApprovedSentences((sentences) => [...sentences, draft]);
        setRefineMode(false);
        setStatus('approved');
        return;
      }

      if (key.backspace || key.delete) {
        setDraft((current) => current.slice(0, -1));
        return;
      }

      if (input) {
        setDraft((current) => `${current}${input}`);
      }

      return;
    }

    if (input === 'q') {
      exit();
      return;
    }

    if (input === 'a' && candidate) {
      setApprovedSentences((sentences) => [...sentences, candidate]);
      setStatus('approved');
      return;
    }

    if (input === 'r') {
      setStatus('rejected');
      return;
    }

    if (input === 'e' && candidate) {
      setDraft(candidate);
      setRefineMode(true);
    }
  });

  const view = createCopilotViewModel({
    topic,
    approvedSentences,
    candidate,
    paragraphIndex: approvedSentences.length + 1,
    status,
    refineMode,
    draft,
    error: currentError,
  });

  return (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="column">
        <Text bold>{view.title}</Text>
        <Text>{view.topic}</Text>
      </Box>
      <Box gap={2}>
        <Box borderStyle="round" flexDirection="column" width="50%" paddingX={1}>
          <Text bold>{view.leftTitle}</Text>
          <Text>{view.leftBody}</Text>
        </Box>
        <Box borderStyle="round" flexDirection="column" width="50%" paddingX={1}>
          <Text bold>{view.rightTitle}</Text>
          <Text>{view.rightBody}</Text>
        </Box>
      </Box>
      <Text>{view.controls}</Text>
    </Box>
  );
}
