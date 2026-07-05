import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LLM_MODELS,
  OPENROUTER_BASE_URL,
  createLlmClient,
  createLlmModels,
  createOpenRouterProvider,
  resolveLlmConfig,
} from '../src/llm.js';

describe('resolveLlmConfig', () => {
  it('uses OpenRouter as the default OpenAI-compatible base URL', () => {
    const config = resolveLlmConfig({ apiKey: 'test-key' });

    expect(config.baseURL).toBe(OPENROUTER_BASE_URL);
    expect(config.models).toEqual(DEFAULT_LLM_MODELS);
  });

  it('allows callers to override writing and memory models independently', () => {
    const config = resolveLlmConfig({
      apiKey: 'test-key',
      models: {
        writing: 'anthropic/claude-sonnet-4',
        memory: 'openai/gpt-4.1-mini',
      },
    });

    expect(config.models.writing).toBe('anthropic/claude-sonnet-4');
    expect(config.models.memory).toBe('openai/gpt-4.1-mini');
  });
});

describe('createOpenRouterProvider', () => {
  it('creates an OpenAI-compatible provider named openrouter', () => {
    const provider = createOpenRouterProvider({ apiKey: 'test-key' });
    const model = provider.chat('openai/gpt-4o-mini');

    expect(model.provider).toBe('openrouter.chat');
    expect(model.modelId).toBe('openai/gpt-4o-mini');
  });
});

describe('createLlmModels', () => {
  it('creates separate chat models for writing and memory roles', () => {
    const models = createLlmModels({
      apiKey: 'test-key',
      models: {
        writing: 'anthropic/claude-sonnet-4',
        memory: 'openai/gpt-4.1-mini',
      },
    });

    expect(models.writing.provider).toBe('openrouter.chat');
    expect(models.writing.modelId).toBe('anthropic/claude-sonnet-4');
    expect(models.memory.provider).toBe('openrouter.chat');
    expect(models.memory.modelId).toBe('openai/gpt-4.1-mini');
  });
});

describe('createLlmClient', () => {
  it('routes generation to the selected role model without calling the network in tests', async () => {
    const client = createLlmClient(
      {
        apiKey: 'test-key',
        models: {
          writing: 'writer-model',
          memory: 'memory-model',
        },
      },
      async ({ model, system, prompt }) => ({
        text: `${model.modelId}:${system}:${prompt}`,
      }),
    );

    await expect(
      client.generateText({
        role: 'memory',
        system: 'memory system',
        prompt: 'extract preference',
      }),
    ).resolves.toBe('memory-model:memory system:extract preference');
  });
});
