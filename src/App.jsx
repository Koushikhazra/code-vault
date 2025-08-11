import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { QuestionsPage } from './components/QuestionsPage';
import { RevisionPage } from './components/RevisionPage';

function AppContent() {
  const { user, currentPage, login, register, loading, error } = useApp();

  if (!user) {
    return (
      <LoginForm 
        onLogin={login}
        onRegister={register}
        loading={loading}
        error={error}
      />
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'questions':
        return <QuestionsPage />;
      case 'revision':
        return <RevisionPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout>
      {renderCurrentPage()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;