import React from 'react';
import './index.css';
import './App.css';
import { useColorTheme } from './hooks/useColorTheme';
import { useTheme } from './hooks/useTheme';
import { AppProviders } from './contexts/AppProviders';
import AppContent from './components/AppContent';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  // Initialize theme systems
  useColorTheme();
  useTheme();

  return (
    <ErrorBoundary level="page">
      <AppProviders>
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
