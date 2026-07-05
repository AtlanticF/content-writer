import {
  createOpenAICompatible,
  type OpenAICompatibleProvider,
} from '@ai-sdk/openai-compatible';
import { generateText as aiGenerateText } from 'ai';

export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const DEFAULT_LLM_MODELS = {
  writing: 'z-ai/glm-4.5',
  memory: 'openai/gpt-4o-mini',
} as const;

export type LlmRole = keyof typeof DEFAULT_LLM_MODELS;

export type LlmModelConfig = Record<LlmRole, string>;

export type LlmConfigInput = {
  apiKey?: string;
  baseURL?: string;
  models?: Partial<LlmModelConfig>;
  headers?: Record<string, string>;
};

export type LlmConfig = {
  apiKey: string;
  baseURL: string;
  models: LlmModelConfig;
  headers?: Record<string, string>;
};

export type LlmModel = ReturnType<OpenAICompatibleProvider['chatModel']>;

export type LlmModels = Record<LlmRole, LlmModel>;

type GenerateTextFunction = (input: {
  model: LlmModel;
  system?: string;
  prompt: string;
}) => Promise<{ text: string }>;

export type LlmGenerateTextInput = {
  role: LlmRole;
  system?: string;
  prompt: string;
};

export type LlmClient = {
  readonly config: LlmConfig;
  readonly models: LlmModels;
  generateText(input: LlmGenerateTextInput): Promise<string>;
};

export function resolveLlmConfig(input: LlmConfigInput = {}): LlmConfig {
  const apiKey = input.apiKey ?? process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is required to create an LLM client.');
  }

  return {
    apiKey,
    baseURL: input.baseURL ?? OPENROUTER_BASE_URL,
    models: {
      ...DEFAULT_LLM_MODELS,
      ...input.models,
    },
    headers: input.headers,
  };
}

export function createOpenRouterProvider(input: LlmConfigInput = {}): OpenAICompatibleProvider {
  const config = resolveLlmConfig(input);

  return createOpenAICompatible({
    name: 'openrouter',
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    headers: config.headers,
  });
}

export function createLlmModels(input: LlmConfigInput = {}): LlmModels {
  const config = resolveLlmConfig(input);
  const provider = createOpenRouterProvider(config);

  return {
    writing: provider.chatModel(config.models.writing),
    memory: provider.chatModel(config.models.memory),
  };
}

export function createLlmClient(
  input: LlmConfigInput = {},
  generateText: GenerateTextFunction = aiGenerateText,
): LlmClient {
  const config = resolveLlmConfig(input);
  const models = createLlmModels(config);

  return {
    config,
    models,
    async generateText({ role, system, prompt }: LlmGenerateTextInput) {
      const result = await generateText({
        model: models[role],
        system,
        prompt,
      });

      return result.text;
    },
  };
}
