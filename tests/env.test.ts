import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ENV,
  createEnv,
  readEnv,
  type ContentWriterEnv,
} from '../src/env.js';

describe('createEnv', () => {
  it('requires OPENROUTER_API_KEY', () => {
    expect(() => createEnv({})).toThrow('OPENROUTER_API_KEY');
  });

  it('fills optional OpenRouter and model defaults', () => {
    const env = createEnv({
      OPENROUTER_API_KEY: 'test-key',
    });

    expect(env).toEqual({
      openrouterApiKey: 'test-key',
      openrouterBaseUrl: DEFAULT_ENV.openrouterBaseUrl,
      writingModel: 'z-ai/glm-4.5',
      memoryModel: 'google/gemini-2.5-flash-lite',
    });
  });

  it('uses explicit environment overrides', () => {
    const env = createEnv({
      OPENROUTER_API_KEY: 'test-key',
      OPENROUTER_BASE_URL: 'https://example.test/v1',
      CONTENT_WRITER_WRITING_MODEL: 'writer-model',
      CONTENT_WRITER_MEMORY_MODEL: 'memory-model',
    });

    expect(env.openrouterBaseUrl).toBe('https://example.test/v1');
    expect(env.writingModel).toBe('writer-model');
    expect(env.memoryModel).toBe('memory-model');
  });
});

describe('readEnv', () => {
  it('reads process.env by default', () => {
    const previous = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = 'process-key';

    try {
      const env: ContentWriterEnv = readEnv();

      expect(env.openrouterApiKey).toBe('process-key');
    } finally {
      if (previous === undefined) {
        delete process.env.OPENROUTER_API_KEY;
      } else {
        process.env.OPENROUTER_API_KEY = previous;
      }
    }
  });
});
