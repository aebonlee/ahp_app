import { API_BASE_URL } from '../config/api';
import { ApiResponse } from './api';

// System Management Interfaces
export interface SystemConfiguration {
  id: string;
  category: 'general' | 'security' | 'performance' | 'notification' | 'backup';
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  sensitive?: boolean;
  default_value?: string;
  validation_regex?: string;
  restart_required?: boolean;
}

export interface BackupStatus {
  id: string;
  timestamp: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  size: string;
  duration: string;
  location: string;
  checksum?: string;
  compression_ratio?: number;
}

export interface SystemHealth {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_status: 'good' | 'warning' | 'error';
  database_status: 'connected' | 'disconnected' | 'slow';
  cache_status: 'active' | 'inactive' | 'error';
  external_apis: Record<string, 'online' | 'offline' | 'degraded'>;
  last_checked: string;
}

export interface SystemUpdate {
  version: string;
  release_date: string;
  type: 'major' | 'minor' | 'patch';
  description: string;
  changelog: string[];
  required: boolean;
  size: string;
  download_url?: string;
}

export interface MaintenanceTask {
  id: string;
  name: string;
  category: 'database' | 'cache' | 'logs' | 'system';
  description: string;
  last_run?: string;
  next_run?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  duration?: string;
  auto_schedule?: boolean;
}

// HTTP Headers for system management requests
const getSystemHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Admin-Required': 'true', // Indicates admin-only endpoint
  };
  
  const accessToken = localStorage.getItem('ahp_access_token') || sessionStorage.getItem('ahp_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
};

// Make system management API request
const makeSystemRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`🔧 System API Request: ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        ...getSystemHeaders(),
        ...options.headers
      }
    });
    
    const contentType = response.headers.get('content-type');
    let data: any = null;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (response.ok && options.method === 'DELETE') {
      // DELETE requests might not return JSON
      data = { success: true };
    } else {
      const text = await response.text();
      console.error(`System API: Expected JSON, got ${contentType}`, text.substring(0, 200));
    }

    if (!response.ok) {
      console.error(`System API Error [${endpoint}]:`, {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: System API 요청 실패`);
    }

    return {
      success: true,
      data: data?.data || data,
      message: data?.message
    };
  } catch (error: any) {
    console.error(`System API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'Unknown system error occurred'
    };
  }
};

// System Management Service
export const systemManagementService = {
  // Configuration Management
  getConfigurations: async (): Promise<ApiResponse<SystemConfiguration[]>> => {
    return makeSystemRequest<SystemConfiguration[]>('/api/admin/system/config/');
  },

  updateConfiguration: async (configId: string, value: string): Promise<ApiResponse<SystemConfiguration>> => {
    return makeSystemRequest<SystemConfiguration>(`/api/admin/system/config/${configId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ value })
    });
  },

  resetConfiguration: async (configId: string): Promise<ApiResponse<SystemConfiguration>> => {
    return makeSystemRequest<SystemConfiguration>(`/api/admin/system/config/${configId}/reset/`, {
      method: 'POST'
    });
  },

  // Backup Management
  getBackups: async (): Promise<ApiResponse<BackupStatus[]>> => {
    return makeSystemRequest<BackupStatus[]>('/api/admin/system/backups/');
  },

  createBackup: async (type: 'full' | 'incremental' | 'differential'): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>('/api/admin/system/backups/', {
      method: 'POST',
      body: JSON.stringify({ backup_type: type })
    });
  },

  downloadBackup: async (backupId: string): Promise<ApiResponse<Blob>> => {
    const response = await makeSystemRequest<any>(`/api/admin/system/backups/${backupId}/download/`, {
      method: 'GET'
    });
    
    if (response.success) {
      // Return blob for download
      return response;
    }
    return response;
  },

  restoreBackup: async (backupId: string): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>(`/api/admin/system/backups/${backupId}/restore/`, {
      method: 'POST'
    });
  },

  deleteBackup: async (backupId: string): Promise<ApiResponse<void>> => {
    return makeSystemRequest<void>(`/api/admin/system/backups/${backupId}/`, {
      method: 'DELETE'
    });
  },

  // System Health Monitoring
  getSystemHealth: async (): Promise<ApiResponse<SystemHealth>> => {
    return makeSystemRequest<SystemHealth>('/api/admin/system/health/');
  },

  runHealthCheck: async (): Promise<ApiResponse<SystemHealth>> => {
    return makeSystemRequest<SystemHealth>('/api/admin/system/health/check/', {
      method: 'POST'
    });
  },

  // Maintenance Tasks
  getMaintenanceTasks: async (): Promise<ApiResponse<MaintenanceTask[]>> => {
    return makeSystemRequest<MaintenanceTask[]>('/api/admin/system/maintenance/');
  },

  runMaintenanceTask: async (taskId: string): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>(`/api/admin/system/maintenance/${taskId}/run/`, {
      method: 'POST'
    });
  },

  scheduleMaintenanceTask: async (taskId: string, schedule: string): Promise<ApiResponse<MaintenanceTask>> => {
    return makeSystemRequest<MaintenanceTask>(`/api/admin/system/maintenance/${taskId}/schedule/`, {
      method: 'POST',
      body: JSON.stringify({ cron_schedule: schedule })
    });
  },

  // Cache Management
  clearCache: async (cacheType: 'application' | 'images' | 'sessions' | 'all'): Promise<ApiResponse<{ cleared: boolean }>> => {
    return makeSystemRequest<{ cleared: boolean }>('/api/admin/system/cache/clear/', {
      method: 'POST',
      body: JSON.stringify({ cache_type: cacheType })
    });
  },

  getCacheStats: async (): Promise<ApiResponse<Record<string, any>>> => {
    return makeSystemRequest<Record<string, any>>('/api/admin/system/cache/stats/');
  },

  // Database Management
  optimizeDatabase: async (): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>('/api/admin/system/database/optimize/', {
      method: 'POST'
    });
  },

  rebuildIndexes: async (): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>('/api/admin/system/database/rebuild-indexes/', {
      method: 'POST'
    });
  },

  updateStatistics: async (): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>('/api/admin/system/database/update-stats/', {
      method: 'POST'
    });
  },

  cleanupData: async (olderThanDays: number): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>('/api/admin/system/database/cleanup/', {
      method: 'POST',
      body: JSON.stringify({ older_than_days: olderThanDays })
    });
  },

  // Log Management
  archiveLogs: async (): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>('/api/admin/system/logs/archive/', {
      method: 'POST'
    });
  },

  analyzeLogs: async (logLevel: 'error' | 'warning' | 'info', hours?: number): Promise<ApiResponse<any>> => {
    return makeSystemRequest<any>('/api/admin/system/logs/analyze/', {
      method: 'POST',
      body: JSON.stringify({ log_level: logLevel, hours: hours || 24 })
    });
  },

  deleteOldLogs: async (olderThanDays: number): Promise<ApiResponse<{ deleted_count: number }>> => {
    return makeSystemRequest<{ deleted_count: number }>('/api/admin/system/logs/cleanup/', {
      method: 'POST',
      body: JSON.stringify({ older_than_days: olderThanDays })
    });
  },

  compressLogs: async (): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>('/api/admin/system/logs/compress/', {
      method: 'POST'
    });
  },

  // System Updates
  checkForUpdates: async (): Promise<ApiResponse<SystemUpdate[]>> => {
    return makeSystemRequest<SystemUpdate[]>('/api/admin/system/updates/check/', {
      method: 'POST'
    });
  },

  downloadUpdate: async (version: string): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>('/api/admin/system/updates/download/', {
      method: 'POST',
      body: JSON.stringify({ version })
    });
  },

  installUpdate: async (version: string): Promise<ApiResponse<{ task_id: string }>> => {
    return makeSystemRequest<{ task_id: string }>('/api/admin/system/updates/install/', {
      method: 'POST',
      body: JSON.stringify({ version })
    });
  },

  getUpdateHistory: async (): Promise<ApiResponse<SystemUpdate[]>> => {
    return makeSystemRequest<SystemUpdate[]>('/api/admin/system/updates/history/');
  },

  // Task Status Monitoring
  getTaskStatus: async (taskId: string): Promise<ApiResponse<{
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    message?: string;
    result?: any;
    started_at?: string;
    completed_at?: string;
  }>> => {
    return makeSystemRequest(`/api/admin/system/tasks/${taskId}/status/`);
  },

  // System Information
  getSystemInfo: async (): Promise<ApiResponse<{
    version: string;
    database_version: string;
    python_version: string;
    django_version: string;
    server_time: string;
    uptime: string;
    environment: string;
  }>> => {
    return makeSystemRequest('/api/admin/system/info/');
  },

  // Export System Configuration
  exportConfiguration: async (): Promise<ApiResponse<Blob>> => {
    return makeSystemRequest('/api/admin/system/config/export/', {
      method: 'GET'
    });
  },

  // Import System Configuration
  importConfiguration: async (configFile: File): Promise<ApiResponse<{ imported_count: number }>> => {
    const formData = new FormData();
    formData.append('config_file', configFile);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/system/config/import/`, {
      method: 'POST',
      headers: getSystemHeaders(),
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.message || 'Configuration import failed');
    }
    
    return {
      success: true,
      data,
      message: data.message
    };
  }
};

// Utility functions for system management
export const systemUtils = {
  // Format file sizes
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format duration
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  },

  // Validate configuration value
  validateConfigValue: (config: SystemConfiguration, value: string): { valid: boolean; error?: string } => {
    if (config.type === 'number') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return { valid: false, error: '유효한 숫자를 입력하세요.' };
      }
    }
    
    if (config.type === 'boolean') {
      if (value !== 'true' && value !== 'false') {
        return { valid: false, error: 'true 또는 false 값이어야 합니다.' };
      }
    }
    
    if (config.validation_regex) {
      const regex = new RegExp(config.validation_regex);
      if (!regex.test(value)) {
        return { valid: false, error: '입력 형식이 올바르지 않습니다.' };
      }
    }
    
    return { valid: true };
  },

  // Get configuration category display name
  getCategoryDisplayName: (category: SystemConfiguration['category']): string => {
    const names = {
      general: '일반',
      security: '보안',
      performance: '성능',
      notification: '알림',
      backup: '백업'
    };
    return names[category] || category;
  },

  // Get backup type display name
  getBackupTypeDisplayName: (type: BackupStatus['type']): string => {
    const names = {
      full: '전체 백업',
      incremental: '증분 백업',
      differential: '차등 백업'
    };
    return names[type] || type;
  },

  // Get status color for UI
  getStatusColor: (status: string): string => {
    const colors = {
      completed: 'green',
      running: 'yellow',
      failed: 'red',
      scheduled: 'blue',
      pending: 'gray',
      good: 'green',
      warning: 'yellow',
      error: 'red',
      connected: 'green',
      disconnected: 'red',
      slow: 'yellow',
      active: 'green',
      inactive: 'gray',
      online: 'green',
      offline: 'red',
      degraded: 'yellow'
    };
    return colors[status as keyof typeof colors] || 'gray';
  }
};

export default systemManagementService;