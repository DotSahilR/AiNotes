export interface AIOutput {
  _id: string;
  originalInput: string;
  feature: string;
  output: string;
  createdAt: string;
}

export interface Note {
  _id: string;
  userId: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  isPinned: boolean;
  aiOutputs: AIOutput[];
  createdAt: string;
  updatedAt: string;
}

export type AIFeature =
  | 'summarize'
  | 'rewrite'
  | 'explain'
  | 'organize'
  | 'translate'
  | 'improve'
  | 'change_format'
  | 'main_theme'
  | 'detect_tone'
  | 'key_points'
  | 'answer_question';
