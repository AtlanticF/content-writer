import { z } from 'zod';

export const DEFAULT_ENV = {
  openrouterBaseUrl: 'https://openrouter.ai/api/v1',
  writingModel: 'z-ai/glm-4.5',
  memoryModel: 'google/gemini-2.5-flash-lite',
} as const;

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  OPENROUTER_BASE_URL: z.string().url().default(DEFAULT_ENV.openrouterBaseUrl),
  CONTENT_WRITER_WRITING_MODEL: z.string().min(1).default(DEFAULT_ENV.writingModel),
  CONTENT_WRITER_MEMORY_MODEL: z.string().min(1).default(DEFAULT_ENV.memoryModel),
});

export type ContentWriterEnv = {
  openrouterApiKey: string;
  openrouterBaseUrl: string;
  writingModel: string;
  memoryModel: string;
};

export type ContentWriterProcessEnv = {
  OPENROUTER_API_KEY?: string;
  OPENROUTER_BASE_URL?: string;
  CONTENT_WRITER_WRITING_MODEL?: string;
  CONTENT_WRITER_MEMORY_MODEL?: string;
};

export function createEnv(input: ContentWriterProcessEnv): ContentWriterEnv {
  const env = envSchema.parse(input);

  return {
    openrouterApiKey: env.OPENROUTER_API_KEY,
    openrouterBaseUrl: env.OPENROUTER_BASE_URL,
    writingModel: env.CONTENT_WRITER_WRITING_MODEL,
    memoryModel: env.CONTENT_WRITER_MEMORY_MODEL,
  };
}

export function readEnv(): ContentWriterEnv {
  return createEnv(process.env);
}
