import type { ContentWriterProcessEnv } from './env.js';

declare global {
  namespace NodeJS {
    interface ProcessEnv extends ContentWriterProcessEnv {}
  }
}

export {};
