import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/auth/AuthForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { BoardView } from './components/board/BoardView';

function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'board'>('dashboard');
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/board/')) {
        const boardId = hash.split('/')[2];
        setCurrentBoardId(boardId);
        setCurrentView('board');
      } else {
        setCurrentView('dashboard');
        setCurrentBoardId(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleBackToDashboard = () => {
    window.location.hash = '';
    setCurrentView('dashboard');
    setCurrentBoardId(null);
  };

  if (currentView === 'board' && currentBoardId) {
    return (
      <BoardView 
        boardId={currentBoardId} 
        onBack={handleBackToDashboard}
      />
    );
  }

  return <Dashboard />;
}

export default App;