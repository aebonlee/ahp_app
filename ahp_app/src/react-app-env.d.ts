/// <reference types="react-scripts" />

// Global window extensions used by the app
interface Window {
  __SUPER_ADMIN__?: boolean;
  comparisonStartTime?: number;
  projectDebugger?: unknown;
  google?: {
    charts: {
      load: (version: string, options: object) => void;
      setOnLoadCallback: (callback: () => void) => void;
    };
    visualization: Record<string, new (...args: unknown[]) => unknown>;
  };
}
