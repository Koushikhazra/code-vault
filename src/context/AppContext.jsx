import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const login = async (credentials) => {
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

  const register = async (userData) => {
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

  const addQuestion = async (questionData) => {
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

  const updateQuestion = async (id, updates) => {
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

  const deleteQuestion = async (id) => {
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

  const getRandomQuestions = async (count) => {
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