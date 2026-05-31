export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  timestamp: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  tagline: string;
}

export const MODELS: ModelOption[] = [
  {
    id: 'claude-3-5-sonnet',
    name: 'Sonnet 3.5',
    description: 'Anthropic\'s most advanced balanced model.',
    tagline: 'Ideal for coding, writing, and analytical reasoning.',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude Opus',
    description: 'Supreme performance on complex reasoning tasks.',
    tagline: 'Deep research, complex coding, and masterfully thorough insights.',
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude Haiku',
    description: 'Blazing fast speed and prompt efficiency.',
    tagline: 'Perfect for quick questions, formatting, and high-tempo chatting.',
  }
];
