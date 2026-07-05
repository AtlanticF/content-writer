#!/usr/bin/env node
import { Command } from 'commander';
import { render } from 'ink';
import { pathToFileURL } from 'node:url';
import { AgentLoop, type AgentModel } from './agents.js';
import { App } from './cli/App.js';
import { createCli } from './cli/createCli.js';
import { readEnv } from './env.js';
import { createLlmClient, type LlmClient } from './llm.js';
import { createWorkflowSystemPrompt } from './prompts/system.workflow.js';

export type GenerateWriteUnitOptions = {
  llmClient: Pick<LlmClient, 'generateText'>;
  memory?: string;
};

export async function generateWriteUnit(
  topic: string,
  { llmClient, memory = '' }: GenerateWriteUnitOptions,
): Promise<string> {
  const system = createWorkflowSystemPrompt({ memory });
  const model: AgentModel = {
    async generate({ messages }) {
      const lastMessage = messages.at(-1);
      const prompt = `Write one sentence about: ${extractText(lastMessage?.content ?? topic)}`;
      const content = await llmClient.generateText({
        role: 'writing',
        system,
        prompt,
      });

      return {
        role: 'assistant',
        content,
      };
    },
  };
  const agent = new AgentLoop({ model });

  agent.userInput(topic);
  await agent.next();

  const lastMessage = agent.getMessages().at(-1);

  return extractText(lastMessage?.content ?? '');
}

export function createProgram(): Command {
  const cli = createCli();
  const program = new Command();

  program.name(cli.name).description(cli.description);

  program
    .command(cli.command)
    .description(cli.description)
    .action(async (topic: string) => {
      try {
        const env = readEnv();
        const llmClient = createLlmClient({
          apiKey: env.openrouterApiKey,
          baseURL: env.openrouterBaseUrl,
          models: {
            writing: env.writingModel,
            memory: env.memoryModel,
          },
        });
        const result = await generateWriteUnit(topic, { llmClient });

        render(<App topic={topic} result={result} />);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        render(<App topic={topic} error={message} />);
        process.exitCode = 1;
      }
    });

  return program;
}

function extractText(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (part && typeof part === 'object' && 'text' in part) {
          return String(part.text);
        }

        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  return '';
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await createProgram().parseAsync(process.argv);
}
