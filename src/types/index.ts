export interface Question {
  id: string;
  name: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  code: string;
  notes: string;
  isRevised: boolean;
  lastRevisedDate: string | null;
  createdAt: string;
}

export interface Topic {
  id: string;
  name: string;
  createdAt: string;
}

export interface AppData {
  questions: Question[];
  topics: Topic[];
  settings: {
    darkMode: boolean;
  };
}

export type FilterBy = 'all' | 'revised' | 'not-revised' | 'not-revised-7-days';
export type DifficultyFilter = 'all' | 'Easy' | 'Medium' | 'Hard';