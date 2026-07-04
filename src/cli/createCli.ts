import { createElement } from 'react';
import { App } from './App.js';
import type { CliDefinition } from './types.js';

export function createCli(): CliDefinition {
  return {
    name: 'content-writer',
    command: 'write <topic>',
    description: 'Write long-form content from a topic, one sentence at a time.',
    render(topic: string) {
      return createElement(App, { topic });
    },
  };
}
