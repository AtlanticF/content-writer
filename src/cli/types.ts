import type { ReactElement } from 'react';

export type CliDefinition = {
  name: string;
  command: string;
  description: string;
  render: (topic: string) => ReactElement;
};
