// Screen ID constants for capture 1:1 mapping

export const SCREEN_IDS = {
  // Admin Screens
  ADMIN: {
    LOGIN: 'ADMIN-LOGIN',
    DASHBOARD: 'ADMIN-DASH',
    PROJECT_CREATE: 'ADMIN-PROJ-CREATE',
    PROJECT_SETUP: 'ADMIN-PROJ-SETUP',
    USER_MGMT: 'ADMIN-USER-MGMT',
    STEP1_CRITERIA: 'ADMIN-STEP1-CRITERIA',
    STEP1_ALTERNATIVES: 'ADMIN-STEP1-ALTS',
    STEP2_PAIRWISE: 'ADMIN-STEP2-PAIR',
    STEP2_DIRECT: 'ADMIN-STEP2-DIRECT',
    STEP3_RESULTS: 'ADMIN-STEP3-RESULTS',
    STEP3_WEIGHTS: 'ADMIN-STEP3-WEIGHTS',
    STEP3_SENS: 'ADMIN-STEP3-SENS',
  },
  
  // Evaluator/Rater Screens
  RATER: {
    LOGIN: 'RATER-LOGIN',
    PROJECT_SELECT: 'RATER-PROJ-SELECT',
    PAIRWISE: 'RATER-PAIRWISE',
    DIRECT_INPUT: 'RATER-DIRECT',
    MATRIX_GRID: 'RATER-MATRIX',
    JUDGMENT_HELPER: 'RATER-HELPER',
    RESULTS: 'RATER-RESULTS',
  },
  
  // Workshop Screens
  WORKSHOP: {
    ADMIN_CONTROL: 'WS-ADMIN',
    RATER_VIEW: 'WS-RATER',
    SYNC_DASHBOARD: 'WS-SYNC',
  },
  
  // Common Screens
  COMMON: {
    ERROR: 'COMMON-ERROR',
    LOADING: 'COMMON-LOADING',
    NOT_FOUND: 'COMMON-404',
  }
} as const;

// Helper function to get screen ID
export const getScreenId = (category: keyof typeof SCREEN_IDS, screen: string): string => {
  const categoryObj = SCREEN_IDS[category] as Record<string, string>;
  return categoryObj[screen] || `${category}-${screen}`;
};