import { API_BASE_URL } from '../config/api';
import { ApiResponse } from './api';

// Anonymous Evaluation Interfaces
export interface AnonymousEvaluationSession {
  id: string;
  session_key: string;
  project_id: string;
  evaluator_name: string;
  evaluator_email?: string;
  evaluator_department?: string;
  is_anonymous: boolean;
  started_at: string;
  last_activity_at: string;
  completed_at?: string;
  current_step: number;
  total_steps: number;
  progress_percentage: number;
  session_data: any;
  ip_address?: string;
  user_agent?: string;
  status: 'active' | 'paused' | 'completed' | 'expired' | 'abandoned';
  expires_at: string;
}

export interface PairwiseComparisonResult {
  id?: string;
  session_id: string;
  project_id: string;
  comparison_type: 'criteria' | 'alternative';
  parent_criteria_id?: string;
  left_element_id: string;
  left_element_name: string;
  right_element_id: string;
  right_element_name: string;
  comparison_value: number;
  confidence_level?: number;
  response_time_ms?: number;
  created_at: string;
  is_skipped: boolean;
  notes?: string;
}

export interface EvaluationProgress {
  session_id: string;
  total_comparisons: number;
  completed_comparisons: number;
  skipped_comparisons: number;
  progress_percentage: number;
  estimated_time_remaining_minutes?: number;
  current_comparison_index: number;
  last_comparison_at?: string;
}

export interface SessionRecoveryData {
  session: AnonymousEvaluationSession;
  completed_comparisons: PairwiseComparisonResult[];
  remaining_comparisons: any[];
  progress: EvaluationProgress;
}

export interface EvaluationStatistics {
  total_sessions: number;
  active_sessions: number;
  completed_sessions: number;
  abandoned_sessions: number;
  average_completion_time_minutes: number;
  completion_rate_percentage: number;
}

// HTTP Headers for anonymous evaluation requests
const getAnonymousEvalHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Anonymous-Evaluation': 'true',
  };
  
  // Include session key if available
  const sessionKey = localStorage.getItem('anonymous_session_key') || sessionStorage.getItem('anonymous_session_key');
  if (sessionKey) {
    headers['X-Session-Key'] = sessionKey;
  }
  
  return headers;
};

// Make anonymous evaluation API request
const makeAnonymousEvalRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`🔍 Anonymous Eval API: ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        ...getAnonymousEvalHeaders(),
        ...options.headers
      }
    });
    
    const contentType = response.headers.get('content-type');
    let data: any = null;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (response.ok && options.method === 'DELETE') {
      data = { success: true };
    } else {
      const text = await response.text();
      console.error(`Anonymous Eval API: Expected JSON, got ${contentType}`, text.substring(0, 200));
    }

    if (!response.ok) {
      console.error(`Anonymous Eval API Error [${endpoint}]:`, {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: Anonymous evaluation API 요청 실패`);
    }

    return {
      success: true,
      data: data?.data || data,
      message: data?.message
    };
  } catch (error: any) {
    console.error(`Anonymous Eval API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'Unknown anonymous evaluation error occurred'
    };
  }
};

// Anonymous Evaluation Service
export const anonymousEvaluationService = {
  // Session Management
  createSession: async (projectId: string, evaluatorData: {
    name: string;
    email?: string;
    department?: string;
    isAnonymous: boolean;
  }): Promise<ApiResponse<AnonymousEvaluationSession>> => {
    const sessionData = {
      project_id: projectId,
      evaluator_name: evaluatorData.name,
      evaluator_email: evaluatorData.email,
      evaluator_department: evaluatorData.department,
      is_anonymous: evaluatorData.isAnonymous,
      user_agent: navigator.userAgent,
      // Include browser fingerprint for session validation
      browser_fingerprint: generateBrowserFingerprint()
    };
    
    const response = await makeAnonymousEvalRequest<AnonymousEvaluationSession>('/api/evaluation/anonymous/sessions/', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
    
    // Store session key locally for future requests
    if (response.success && response.data) {
      localStorage.setItem('anonymous_session_key', response.data.session_key);
      localStorage.setItem('anonymous_session_id', response.data.id);
      
      // Also store in sessionStorage as backup
      sessionStorage.setItem('anonymous_session_key', response.data.session_key);
      sessionStorage.setItem('anonymous_session_id', response.data.id);
    }
    
    return response;
  },

  getSession: async (sessionId: string): Promise<ApiResponse<AnonymousEvaluationSession>> => {
    return makeAnonymousEvalRequest<AnonymousEvaluationSession>(`/api/evaluation/anonymous/sessions/${sessionId}/`);
  },

  updateSessionActivity: async (sessionId: string): Promise<ApiResponse<AnonymousEvaluationSession>> => {
    return makeAnonymousEvalRequest<AnonymousEvaluationSession>(`/api/evaluation/anonymous/sessions/${sessionId}/activity/`, {
      method: 'POST',
      body: JSON.stringify({
        last_activity_at: new Date().toISOString(),
        session_data: getLocalSessionData()
      })
    });
  },

  recoverSession: async (sessionKey: string): Promise<ApiResponse<SessionRecoveryData>> => {
    return makeAnonymousEvalRequest<SessionRecoveryData>(`/api/evaluation/anonymous/sessions/recover/`, {
      method: 'POST',
      body: JSON.stringify({
        session_key: sessionKey,
        browser_fingerprint: generateBrowserFingerprint()
      })
    });
  },

  // Comparison Management
  saveComparison: async (comparisonData: Omit<PairwiseComparisonResult, 'id' | 'created_at'>): Promise<ApiResponse<PairwiseComparisonResult>> => {
    const enhancedData = {
      ...comparisonData,
      created_at: new Date().toISOString(),
      response_time_ms: getResponseTime(),
      ip_address: await getUserIpAddress()
    };
    
    const response = await makeAnonymousEvalRequest<PairwiseComparisonResult>('/api/evaluation/anonymous/comparisons/', {
      method: 'POST',
      body: JSON.stringify(enhancedData)
    });
    
    // Store comparison locally as backup
    if (response.success && response.data) {
      storeComparisonLocally(response.data);
    }
    
    return response;
  },

  getSessionComparisons: async (sessionId: string): Promise<ApiResponse<PairwiseComparisonResult[]>> => {
    return makeAnonymousEvalRequest<PairwiseComparisonResult[]>(`/api/evaluation/anonymous/sessions/${sessionId}/comparisons/`);
  },

  updateComparison: async (comparisonId: string, updates: Partial<PairwiseComparisonResult>): Promise<ApiResponse<PairwiseComparisonResult>> => {
    return makeAnonymousEvalRequest<PairwiseComparisonResult>(`/api/evaluation/anonymous/comparisons/${comparisonId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  // Progress Tracking
  getProgress: async (sessionId: string): Promise<ApiResponse<EvaluationProgress>> => {
    return makeAnonymousEvalRequest<EvaluationProgress>(`/api/evaluation/anonymous/sessions/${sessionId}/progress/`);
  },

  updateProgress: async (sessionId: string, progressData: Partial<EvaluationProgress>): Promise<ApiResponse<EvaluationProgress>> => {
    return makeAnonymousEvalRequest<EvaluationProgress>(`/api/evaluation/anonymous/sessions/${sessionId}/progress/`, {
      method: 'PATCH',
      body: JSON.stringify(progressData)
    });
  },

  // Session Completion
  completeSession: async (sessionId: string, completionData?: {
    feedback?: string;
    satisfaction_rating?: number;
    completion_notes?: string;
  }): Promise<ApiResponse<{ session: AnonymousEvaluationSession; results_summary: any }>> => {
    const data = {
      completed_at: new Date().toISOString(),
      status: 'completed',
      ...completionData
    };
    
    const response = await makeAnonymousEvalRequest<{ session: AnonymousEvaluationSession; results_summary: any }>(`/api/evaluation/anonymous/sessions/${sessionId}/complete/`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    // Clear local session data on completion
    if (response.success) {
      clearLocalSessionData();
    }
    
    return response;
  },

  // Data Validation and Integrity
  validateSessionIntegrity: async (sessionId: string): Promise<ApiResponse<{
    is_valid: boolean;
    issues: string[];
    missing_comparisons: number;
    duplicate_comparisons: number;
  }>> => {
    return makeAnonymousEvalRequest(`/api/evaluation/anonymous/sessions/${sessionId}/validate/`);
  },

  syncLocalData: async (sessionId: string): Promise<ApiResponse<{
    synced_comparisons: number;
    conflicts_resolved: number;
    errors: string[];
  }>> => {
    const localData = getLocalSessionData();
    const localComparisons = getLocalComparisons();
    
    return makeAnonymousEvalRequest(`/api/evaluation/anonymous/sessions/${sessionId}/sync/`, {
      method: 'POST',
      body: JSON.stringify({
        local_session_data: localData,
        local_comparisons: localComparisons,
        sync_timestamp: new Date().toISOString()
      })
    });
  },

  // Backup and Recovery
  createBackup: async (sessionId: string): Promise<ApiResponse<{ backup_id: string; backup_url: string }>> => {
    return makeAnonymousEvalRequest(`/api/evaluation/anonymous/sessions/${sessionId}/backup/`, {
      method: 'POST'
    });
  },

  restoreFromBackup: async (backupId: string): Promise<ApiResponse<SessionRecoveryData>> => {
    return makeAnonymousEvalRequest(`/api/evaluation/anonymous/backups/${backupId}/restore/`, {
      method: 'POST'
    });
  },

  // Statistics and Monitoring
  getSessionStatistics: async (projectId?: string): Promise<ApiResponse<EvaluationStatistics>> => {
    const params = projectId ? `?project_id=${projectId}` : '';
    return makeAnonymousEvalRequest<EvaluationStatistics>(`/api/evaluation/anonymous/statistics/${params}`);
  },

  // Session Cleanup
  cleanupExpiredSessions: async (): Promise<ApiResponse<{ cleaned_sessions: number }>> => {
    return makeAnonymousEvalRequest('/api/evaluation/anonymous/cleanup/', {
      method: 'POST'
    });
  },

  pauseSession: async (sessionId: string): Promise<ApiResponse<AnonymousEvaluationSession>> => {
    return makeAnonymousEvalRequest(`/api/evaluation/anonymous/sessions/${sessionId}/pause/`, {
      method: 'POST'
    });
  },

  resumeSession: async (sessionId: string): Promise<ApiResponse<AnonymousEvaluationSession>> => {
    return makeAnonymousEvalRequest(`/api/evaluation/anonymous/sessions/${sessionId}/resume/`, {
      method: 'POST'
    });
  }
};

// Utility functions for data integrity
export const anonymousEvaluationUtils = {
  // Local storage management
  storeSessionLocally: (session: AnonymousEvaluationSession): void => {
    try {
      const sessionData = {
        ...session,
        stored_at: new Date().toISOString()
      };
      localStorage.setItem(`session_${session.id}`, JSON.stringify(sessionData));
      console.log('✅ Session stored locally:', session.id);
    } catch (error) {
      console.error('❌ Failed to store session locally:', error);
    }
  },

  getSessionFromLocal: (sessionId: string): AnonymousEvaluationSession | null => {
    try {
      const stored = localStorage.getItem(`session_${sessionId}`);
      if (stored) {
        const data = JSON.parse(stored);
        console.log('📂 Session retrieved from local storage:', sessionId);
        return data;
      }
    } catch (error) {
      console.error('❌ Failed to retrieve session from local storage:', error);
    }
    return null;
  },

  // Comparison validation
  validateComparison: (comparison: Partial<PairwiseComparisonResult>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!comparison.session_id) {
      errors.push('Session ID is required');
    }
    
    if (!comparison.project_id) {
      errors.push('Project ID is required');
    }
    
    if (!comparison.comparison_type || !['criteria', 'alternative'].includes(comparison.comparison_type)) {
      errors.push('Valid comparison type is required');
    }
    
    if (!comparison.left_element_id || !comparison.right_element_id) {
      errors.push('Both comparison elements are required');
    }
    
    if (comparison.left_element_id === comparison.right_element_id) {
      errors.push('Cannot compare element with itself');
    }
    
    if (typeof comparison.comparison_value !== 'number' || comparison.comparison_value <= 0) {
      errors.push('Comparison value must be a positive number');
    }
    
    // Validate AHP scale values
    const validAHPValues = [1/9, 1/7, 1/5, 1/3, 1, 3, 5, 7, 9];
    if (!validAHPValues.includes(comparison.comparison_value!)) {
      errors.push('Comparison value must be a valid AHP scale value');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Data consistency checks
  checkDataConsistency: (comparisons: PairwiseComparisonResult[]): {
    consistent: boolean;
    issues: string[];
    duplicates: PairwiseComparisonResult[];
    missing: string[];
  } => {
    const issues: string[] = [];
    const duplicates: PairwiseComparisonResult[] = [];
    const missing: string[] = [];
    
    // Check for duplicates
    const seen = new Set<string>();
    comparisons.forEach(comp => {
      const key = `${comp.comparison_type}_${comp.left_element_id}_${comp.right_element_id}_${comp.parent_criteria_id || 'root'}`;
      if (seen.has(key)) {
        duplicates.push(comp);
        issues.push(`Duplicate comparison found: ${comp.left_element_name} vs ${comp.right_element_name}`);
      }
      seen.add(key);
    });
    
    // Check for reciprocal consistency
    const reciprocalMap = new Map<string, PairwiseComparisonResult>();
    comparisons.forEach(comp => {
      const key = `${comp.comparison_type}_${comp.left_element_id}_${comp.right_element_id}_${comp.parent_criteria_id || 'root'}`;
      const reciprocalKey = `${comp.comparison_type}_${comp.right_element_id}_${comp.left_element_id}_${comp.parent_criteria_id || 'root'}`;
      
      reciprocalMap.set(key, comp);
      
      const reciprocal = reciprocalMap.get(reciprocalKey);
      if (reciprocal) {
        const expectedReciprocalValue = 1 / comp.comparison_value;
        const tolerance = 0.001;
        
        if (Math.abs(reciprocal.comparison_value - expectedReciprocalValue) > tolerance) {
          issues.push(`Reciprocal inconsistency: ${comp.left_element_name} vs ${comp.right_element_name}`);
        }
      }
    });
    
    return {
      consistent: issues.length === 0,
      issues,
      duplicates,
      missing
    };
  },

  // Auto-save functionality
  setupAutoSave: (sessionId: string, interval: number = 30000): () => void => {
    const autoSaveInterval = setInterval(async () => {
      try {
        await anonymousEvaluationService.updateSessionActivity(sessionId);
        await anonymousEvaluationService.syncLocalData(sessionId);
        console.log('🔄 Auto-save completed for session:', sessionId);
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, interval);
    
    // Return cleanup function
    return () => {
      clearInterval(autoSaveInterval);
    };
  },

  // Session expiry handling
  isSessionExpired: (session: AnonymousEvaluationSession): boolean => {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    return now > expiresAt;
  },

  getTimeUntilExpiry: (session: AnonymousEvaluationSession): number => {
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    return Math.max(0, expiresAt.getTime() - now.getTime());
  },

  // Recovery mechanisms
  attemptRecovery: async (): Promise<SessionRecoveryData | null> => {
    try {
      // Try to recover from various sources
      const sessionKey = localStorage.getItem('anonymous_session_key') || sessionStorage.getItem('anonymous_session_key');
      
      if (sessionKey) {
        const response = await anonymousEvaluationService.recoverSession(sessionKey);
        if (response.success && response.data) {
          console.log('🔄 Session recovered successfully');
          return response.data;
        }
      }
      
      // Try to recover from local backup
      const localBackup = localStorage.getItem('anonymous_session_backup');
      if (localBackup) {
        const backupData = JSON.parse(localBackup);
        console.log('📂 Session recovered from local backup');
        return backupData;
      }
      
    } catch (error) {
      console.error('❌ Session recovery failed:', error);
    }
    
    return null;
  }
};

// Helper functions
function generateBrowserFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Browser fingerprint', 2, 2);
  
  return btoa(JSON.stringify({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    canvasFingerprint: canvas.toDataURL()
  }));
}

function getLocalSessionData(): any {
  try {
    return JSON.parse(localStorage.getItem('anonymous_session_data') || '{}');
  } catch {
    return {};
  }
}

function getLocalComparisons(): PairwiseComparisonResult[] {
  try {
    return JSON.parse(localStorage.getItem('anonymous_comparisons') || '[]');
  } catch {
    return [];
  }
}

function storeComparisonLocally(comparison: PairwiseComparisonResult): void {
  try {
    const existing = getLocalComparisons();
    existing.push(comparison);
    localStorage.setItem('anonymous_comparisons', JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to store comparison locally:', error);
  }
}

function clearLocalSessionData(): void {
  try {
    localStorage.removeItem('anonymous_session_key');
    localStorage.removeItem('anonymous_session_id');
    localStorage.removeItem('anonymous_session_data');
    localStorage.removeItem('anonymous_comparisons');
    sessionStorage.removeItem('anonymous_session_key');
    sessionStorage.removeItem('anonymous_session_id');
  } catch (error) {
    console.error('Failed to clear local session data:', error);
  }
}

function getResponseTime(): number {
  // This would track the time since the comparison was displayed
  return Date.now() - (window as any).comparisonStartTime || 0;
}

async function getUserIpAddress(): Promise<string | undefined> {
  try {
    // In production, this would be handled by the backend
    return undefined;
  } catch {
    return undefined;
  }
}

export default anonymousEvaluationService;