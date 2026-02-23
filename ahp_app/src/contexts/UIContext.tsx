import { createContext, useContext } from 'react';
import type { ActionMessage } from '../hooks/useActionMessage';

export interface UIContextValue {
  actionMessage: ActionMessage | null;
  showActionMessage: (type: ActionMessage['type'], text: string) => void;
  backendStatus: 'checking' | 'available' | 'unavailable';
  showApiErrorModal: boolean;
  handleApiRetry: () => void;
  handleCloseApiError: () => void;
}

export const UIContext = createContext<UIContextValue | null>(null);

export function useUIContext(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUIContext must be used within UIProvider');
  return context;
}
