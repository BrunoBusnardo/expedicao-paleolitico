export interface Question {
  id: number;
  title: string;
  narrative: string;
  subQuestions: string[];
  suggestions: string[];
  objective: string;
  concept: string;
}

export interface GroupAnswers {
  [questionId: number]: string;
}

export interface ElderFeedback {
  message: string;
  hasErrors: boolean;
  suggestions: string[];
}

export interface StoryState {
  step: 'intro' | 'questions' | 'drafting' | 'final-story';
  currentQuestionIndex: number;
  answers: GroupAnswers;
  currentDraft: string;
  verifiedDrafts: { [questionId: number]: string };
  elderFeedback: ElderFeedback | null;
  isElderOpen: boolean;
  isDraftVerified: boolean;
  consultationCount: { [questionId: number]: number };
  finalStory: string;
}
