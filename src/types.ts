export type { ModelMessage } from 'ai';

export type WorkflowSystemPromptInput = {
  memory: string;
};

export type CopilotRequest = {
  tool: string;
  intention_string: string;
  file_id: string;
};

export type CopilotResponse =
  | {
      status: 'refined';
      write_string: string;
      reason?: string;
    }
  | {
      status: 'reject';
      reason: string;
      write_string?: string;
    }
  | {
      status: 'approved';
      write_string: string;
      reason?: string;
    };

export type MemorySystemPromptInput = {
  req: CopilotRequest;
  res: CopilotResponse;
  currentMemory: string;
};
