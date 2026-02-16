
export interface Question {
  id: number | string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  userAnswers: number[];
  isFinished: boolean;
  selectedCategory: string | null;
  selectedLevel: DifficultyLevel | null;
  selectedPart: number | null;
  isLoading: boolean;
  dynamicQuestions: Question[];
  userName: string | null;
}

export enum DifficultyLevel {
  BASIC = 'પાયાનું (Basic)',
  MEDIUM = 'મધ્યમ (Medium)',
  ADVANCED = 'નિષ્ણાત (Advanced)'
}

export enum Category {
  IPC = 'IPC (ભારતીય ફોજદારી ધારો)',
  CRPC = 'CrPC (ફોજદારી કાર્યરીતિ સંહિતા)',
  EVIDENCE = 'EVIDENCE (ભારતીય પુરાવા અધિનિયમ)',
  CONSTITUTION = 'બંધારણ (Constitution)',
  GUJARAT_HISTORY = 'ગુજરાતનો ઇતિહાસ',
  GENERAL_KNOWLEDGE = 'સામાન્ય જ્ઞાન',
  CURRENT_AFFAIRS = 'વર્તમાન પ્રવાહ (Current Affairs)',
  DAILY_CHALLENGE = 'Daily 1000+ MCQ ધડાકા',
  PYQ = 'PYQ (જુના પ્રશ્નપત્રો)'
}
