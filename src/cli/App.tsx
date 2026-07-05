import { Box, Text } from 'ink';

type AppProps = {
  topic: string;
  result?: string;
  error?: string;
};

export function App({ topic, result, error }: AppProps) {
  return (
    <Box flexDirection="column">
      <Text>Content Writer</Text>
      <Text>{topic}</Text>
      {result ? <Text>{result}</Text> : null}
      {error ? <Text>{error}</Text> : null}
      {!result && !error ? <Text>Bootstrapping CLI foundation.</Text> : null}
    </Box>
  );
}
