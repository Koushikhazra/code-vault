import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Question, Topic, AppData, FilterBy, DifficultyFilter } from '../types';

interface AppContextType {
  questions: Question[];
  topics: Topic[];
  darkMode: boolean;
  currentPage: 'home' | 'questions' | 'revision';
  addQuestion: (question: Omit<Question, 'id' | 'createdAt'>) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  toggleDarkMode: () => void;
  setCurrentPage: (page: 'home' | 'questions' | 'revision') => void;
  exportData: () => void;
  importData: (data: AppData) => void;
  getRandomQuestions: (count: number) => Question[];
  getProgress: () => { revised: number; total: number; percentage: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'dsa-revision-hub-data';

const defaultData: AppData = {
  questions: [],
  topics: [],
  settings: { darkMode: false }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'questions' | 'revision'>('home');

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data: AppData = JSON.parse(savedData);
        setQuestions(data.questions || []);
        setTopics(data.topics || []);
        setDarkMode(data.settings?.darkMode || false);
      } catch (error) {
        console.error('Error loading data:', error);
        setTopics([]);
      }
    }

    // Check system preference for dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const data: AppData = {
      questions,
      topics,
      settings: { darkMode }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [questions, topics, darkMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addQuestion = (questionData: Omit<Question, 'id' | 'createdAt'>) => {
    // Check if topic exists, if not create it
    const topicExists = topics.some(topic => topic.name === questionData.topic);
    if (!topicExists && questionData.topic.trim()) {
      const newTopic: Topic = {
        id: Date.now().toString() + '_topic',
        name: questionData.topic.trim(),
        createdAt: new Date().toISOString()
      };
      setTopics(prev => [...prev, newTopic]);
    }

    const newQuestion: Question = {
      ...questionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const addTopic = (name: string) => {
    const newTopic: Topic = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString()
    };
    setTopics(prev => [...prev, newTopic]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };


  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const exportData = () => {
    const data: AppData = { questions, topics, settings: { darkMode } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-revision-hub-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (data: AppData) => {
    if (data.questions) setQuestions(data.questions);
    if (data.topics) setTopics(data.topics);
    if (data.settings?.darkMode !== undefined) setDarkMode(data.settings.darkMode);
  };

  const getRandomQuestions = (count: number): Question[] => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const getProgress = () => {
    const revised = questions.filter(q => q.isRevised).length;
    const total = questions.length;
    const percentage = total > 0 ? Math.round((revised / total) * 100) : 0;
    return { revised, total, percentage };
  };

  return (
    <AppContext.Provider value={{
      questions,
      topics,
      darkMode,
      currentPage,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      toggleDarkMode,
      setCurrentPage,
      exportData,
      importData,
      getRandomQuestions,
      getProgress
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}