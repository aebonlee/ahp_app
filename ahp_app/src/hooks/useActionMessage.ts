import { useState, useCallback } from 'react';

export interface ActionMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

export function useActionMessage() {
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);

  const showActionMessage = useCallback((type: ActionMessage['type'], text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  }, []);

  return { actionMessage, showActionMessage };
}
