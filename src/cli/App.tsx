import { Box, Text } from 'ink';

type AppProps = {
  topic: string;
};

export function App({ topic }: AppProps) {
  return (
    <Box flexDirection="column">
      <Text>Content Writer</Text>
      <Text>{topic}</Text>
      <Text>Bootstrapping CLI foundation.</Text>
    </Box>
  );
}
