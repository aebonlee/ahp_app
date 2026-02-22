/// <reference types="react-scripts" />

// Global window extensions used by the app
interface Window {
  __SUPER_ADMIN__?: boolean;
  comparisonStartTime?: number;
google?: {
    charts: {
      load: (version: string, options: object) => void;
      setOnLoadCallback: (callback: () => void) => void;
    };
    visualization: Record<string, new (...args: unknown[]) => unknown>;
  };
}

// Non-standard Navigator properties (device detection)
interface Navigator {
  /** RAM in GB — part of Device Memory API (not all browsers) */
  deviceMemory?: number;
  /** Battery Status API */
  getBattery?(): Promise<BatteryManager>;
}

// Battery Status API types
interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

// Non-standard Performance extensions (Chrome-only)
interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}
