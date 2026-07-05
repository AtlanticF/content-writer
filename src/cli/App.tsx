import { useEffect, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { openVimEditor } from './editor.js';

type CopilotStatus = 'idle' | 'generating' | 'review' | 'approved' | 'rejected' | 'editing' | 'error';

type CopilotViewModelInput = {
  topic: string;
  approvedSentences: string[];
  candidate?: string;
  paragraphIndex: number;
  status: CopilotStatus;
  editing: boolean;
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
  editCandidate?: (candidate: string) => Promise<string>;
};

export function createCopilotViewModel({
  topic,
  approvedSentences,
  candidate,
  paragraphIndex,
  status,
  editing,
  error,
}: CopilotViewModelInput): CopilotViewModel {
  const leftBody = approvedSentences.length > 0 ? approvedSentences.join(' ') : 'No approved sentence yet.';
  const statusLine =
    status === 'generating'
      ? 'Generating next write unit...'
      : `Paragraph ${paragraphIndex}${editing ? '\nVim editor is open. Save and quit to return.' : ''}`;
  const errorLine = error ? `\n${error}` : '';
  const candidateLine = candidate ? `\n${candidate}` : '';

  return {
    title: 'Content Writer',
    topic,
    leftTitle: 'Approved Article',
    leftBody,
    rightTitle: 'Agent Copilot',
    rightBody: `${statusLine}${candidateLine}${errorLine}`,
    controls: editing ? 'save and quit Vim to accept refine' : 'a approve | r reject | e vim refine | q quit',
  };
}

export function App({
  topic,
  result,
  error,
  generateCandidate,
  editCandidate = openVimEditor,
}: AppProps) {
  const { exit } = useApp();
  const [approvedSentences, setApprovedSentences] = useState<string[]>([]);
  const [candidate, setCandidate] = useState(result);
  const [status, setStatus] = useState<CopilotStatus>(result ? 'review' : 'idle');
  const [currentError, setCurrentError] = useState(error);
  const [editing, setEditing] = useState(false);

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

  useInput((input) => {
    if (editing) {
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
      setEditing(true);
      setStatus('editing');

      editCandidate(candidate)
        .then((editedCandidate) => {
          setCandidate(editedCandidate);
          setApprovedSentences((sentences) => [...sentences, editedCandidate]);
          setStatus('approved');
        })
        .catch((caught) => {
          setCurrentError(caught instanceof Error ? caught.message : String(caught));
          setStatus('error');
        })
        .finally(() => {
          setEditing(false);
        });
    }
  });

  const view = createCopilotViewModel({
    topic,
    approvedSentences,
    candidate,
    paragraphIndex: approvedSentences.length + 1,
    status,
    editing,
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
