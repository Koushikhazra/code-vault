export interface Question {
  _id: string;
  name: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  code: string;
  notes: string;
  isRevised: boolean;
  lastRevisedDate: string | null;
  createdAt: string;
  userId: string;
}

export interface Topic {
  _id: string;
  name: string;
  createdAt: string;
  userId: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export type FilterBy = 'all' | 'revised' | 'not-revised' | 'not-revised-7-days';
export type DifficultyFilter = 'all' | 'Easy' | 'Medium' | 'Hard';