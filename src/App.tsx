import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { QuestionsPage } from './components/QuestionsPage';
import { RevisionPage } from './components/RevisionPage';

function AppContent() {
  const { currentPage } = useApp();

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