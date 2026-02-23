import React from 'react';
import './index.css';
import './App.css';
import { useColorTheme } from './hooks/useColorTheme';
import { useTheme } from './hooks/useTheme';
import { AppProviders } from './contexts/AppProviders';
import AppContent from './components/AppContent';

function App() {
  // Initialize theme systems
  useColorTheme();
  useTheme();

  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
