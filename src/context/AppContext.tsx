import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Question, Topic, User } from '../types';
import { apiService } from '../services/api';

interface AppContextType {
  user: User | null;
  questions: Question[];
  topics: Topic[];
  darkMode: boolean;
  currentPage: 'home' | 'questions' | 'revision';
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  addQuestion: (question: Omit<Question, '_id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateQuestion: (id: string, updates: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  toggleDarkMode: () => void;
  setCurrentPage: (page: 'home' | 'questions' | 'revision') => void;
  getRandomQuestions: (count: number) => Promise<Question[]>;
  getProgress: () => { revised: number; total: number; percentage: number };
  loadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'questions' | 'revision'>('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved token and auto-login
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    }

    // Check system preference for dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const checkAuthStatus = async () => {
    try {
      const response = await apiService.getCurrentUser();
      setUser(response.user);
      await loadData();
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.login(credentials);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      await loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { username: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.register(userData);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      await loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setQuestions([]);
    setTopics([]);
    setCurrentPage('home');
  };

  const loadData = async () => {
    try {
      const [questionsData, topicsData] = await Promise.all([
        apiService.getQuestions(),
        apiService.getTopics()
      ]);
      setQuestions(questionsData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addQuestion = async (questionData: Omit<Question, '_id' | 'createdAt' | 'userId'>) => {
    try {
      const newQuestion = await apiService.createQuestion(questionData);
      setQuestions(prev => [newQuestion, ...prev]);
      
      // Check if topic exists, if not add it to local state
      const topicExists = topics.some(topic => topic.name === questionData.topic);
      if (!topicExists) {
        await loadData(); // Reload to get the new topic
      }
    } catch (error) {
      console.error('Error adding question:', error);
      throw error;
    }
  };

  const updateQuestion = async (id: string, updates: Partial<Question>) => {
    try {
      const updatedQuestion = await apiService.updateQuestion(id, updates);
      setQuestions(prev => prev.map(q => 
        q._id === id ? updatedQuestion : q
      ));
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      await apiService.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const getRandomQuestions = async (count: number): Promise<Question[]> => {
    try {
      return await apiService.getRandomQuestions(count);
    } catch (error) {
      console.error('Error getting random questions:', error);
      return [];
    }
  };

  const getProgress = () => {
    const revised = questions.filter(q => q.isRevised).length;
    const total = questions.length;
    const percentage = total > 0 ? Math.round((revised / total) * 100) : 0;
    return { revised, total, percentage };
  };

  return (
    <AppContext.Provider value={{
      user,
      questions,
      topics,
      darkMode,
      currentPage,
      loading,
      error,
      login,
      register,
      logout,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      toggleDarkMode,
      setCurrentPage,
      getRandomQuestions,
      getProgress,
      loadData
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