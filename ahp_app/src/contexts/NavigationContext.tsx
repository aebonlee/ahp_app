import { createContext, useContext } from 'react';

export interface NavigationContextValue {
  activeTab: string;
  viewMode: 'service' | 'evaluator';
  isNavigationReady: boolean;
  protectedTabs: string[];
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  changeTab: (tab: string, projectId?: string, projectTitle?: string) => void;
  handleModeSwitch: (mode: 'service' | 'evaluator') => void;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigationContext(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigationContext must be used within NavigationProvider');
  return context;
}
