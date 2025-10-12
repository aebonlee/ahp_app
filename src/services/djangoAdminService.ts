import { API_BASE_URL } from '../config/api';
import { ApiResponse } from './api';

// Django Admin Integration Interfaces
export interface DjangoAdminStatus {
  is_accessible: boolean;
  admin_url: string;
  user_permissions: string[];
  available_models: DjangoModel[];
  django_version: string;
  database_status: 'connected' | 'disconnected' | 'error';
  last_login?: string;
}

export interface DjangoModel {
  app_label: string;
  model_name: string;
  verbose_name: string;
  verbose_name_plural: string;
  permissions: string[];
  admin_url: string;
  count?: number;
  last_modified?: string;
}

export interface DjangoLogEntry {
  id: number;
  action_time: string;
  user: string;
  content_type: string;
  object_id: string;
  object_repr: string;
  action_flag: 'ADDITION' | 'CHANGE' | 'DELETION';
  change_message: string;
}

export interface DjangoUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login?: string;
  groups: string[];
  user_permissions: string[];
}

export interface DjangoSession {
  session_key: string;
  session_data: any;
  expire_date: string;
  user_id?: number;
  ip_address?: string;
  user_agent?: string;
}

export interface ModelStatistics {
  model: string;
  total_count: number;
  active_count?: number;
  deleted_count?: number;
  created_today: number;
  modified_today: number;
  last_activity?: string;
}

// HTTP Headers for Django admin requests
const getDjangoAdminHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Django-Admin': 'true',
  };
  
  const accessToken = localStorage.getItem('ahp_access_token') || sessionStorage.getItem('ahp_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
};

// Make Django admin API request
const makeDjangoAdminRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`🔧 Django Admin API: ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        ...getDjangoAdminHeaders(),
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
      console.error(`Django Admin API: Expected JSON, got ${contentType}`, text.substring(0, 200));
    }

    if (!response.ok) {
      console.error(`Django Admin API Error [${endpoint}]:`, {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: Django Admin API 요청 실패`);
    }

    return {
      success: true,
      data: data?.data || data,
      message: data?.message
    };
  } catch (error: any) {
    console.error(`Django Admin API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'Unknown Django admin error occurred'
    };
  }
};

// Django Admin Service
export const djangoAdminService = {
  // Admin Status and Access
  getAdminStatus: async (): Promise<ApiResponse<DjangoAdminStatus>> => {
    return makeDjangoAdminRequest<DjangoAdminStatus>('/api/admin/status/');
  },

  checkAdminAccess: async (): Promise<ApiResponse<{ accessible: boolean; redirect_url?: string }>> => {
    return makeDjangoAdminRequest<{ accessible: boolean; redirect_url?: string }>('/api/admin/check-access/', {
      method: 'POST'
    });
  },

  // Model Management
  getAvailableModels: async (): Promise<ApiResponse<DjangoModel[]>> => {
    return makeDjangoAdminRequest<DjangoModel[]>('/api/admin/models/');
  },

  getModelStatistics: async (): Promise<ApiResponse<ModelStatistics[]>> => {
    return makeDjangoAdminRequest<ModelStatistics[]>('/api/admin/models/statistics/');
  },

  getModelData: async (appLabel: string, modelName: string, page: number = 1, pageSize: number = 25): Promise<ApiResponse<{
    results: any[];
    count: number;
    next?: string;
    previous?: string;
  }>> => {
    return makeDjangoAdminRequest(`/api/admin/models/${appLabel}/${modelName}/?page=${page}&page_size=${pageSize}`);
  },

  // User Management via Django Admin
  getDjangoUsers: async (page: number = 1, search?: string): Promise<ApiResponse<{
    results: DjangoUser[];
    count: number;
    next?: string;
    previous?: string;
  }>> => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
    return makeDjangoAdminRequest(`/api/admin/auth/user/?page=${page}${searchParam}`);
  },

  createDjangoUser: async (userData: Partial<DjangoUser>): Promise<ApiResponse<DjangoUser>> => {
    return makeDjangoAdminRequest<DjangoUser>('/api/admin/auth/user/', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateDjangoUser: async (userId: number, userData: Partial<DjangoUser>): Promise<ApiResponse<DjangoUser>> => {
    return makeDjangoAdminRequest<DjangoUser>(`/api/admin/auth/user/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(userData)
    });
  },

  deleteDjangoUser: async (userId: number): Promise<ApiResponse<void>> => {
    return makeDjangoAdminRequest<void>(`/api/admin/auth/user/${userId}/`, {
      method: 'DELETE'
    });
  },

  // Session Management
  getActiveSessions: async (): Promise<ApiResponse<DjangoSession[]>> => {
    return makeDjangoAdminRequest<DjangoSession[]>('/api/admin/sessions/');
  },

  deleteSession: async (sessionKey: string): Promise<ApiResponse<void>> => {
    return makeDjangoAdminRequest<void>(`/api/admin/sessions/${sessionKey}/`, {
      method: 'DELETE'
    });
  },

  deleteExpiredSessions: async (): Promise<ApiResponse<{ deleted_count: number }>> => {
    return makeDjangoAdminRequest<{ deleted_count: number }>('/api/admin/sessions/cleanup/', {
      method: 'POST'
    });
  },

  // Log Management
  getAdminLogs: async (page: number = 1, userId?: number, actionFlag?: string): Promise<ApiResponse<{
    results: DjangoLogEntry[];
    count: number;
    next?: string;
    previous?: string;
  }>> => {
    let params = `?page=${page}`;
    if (userId) params += `&user=${userId}`;
    if (actionFlag) params += `&action_flag=${actionFlag}`;
    
    return makeDjangoAdminRequest(`/api/admin/admin/logentry/${params}`);
  },

  // Group and Permission Management
  getGroups: async (): Promise<ApiResponse<{
    id: number;
    name: string;
    permissions: string[];
    user_count: number;
  }[]>> => {
    return makeDjangoAdminRequest('/api/admin/auth/group/');
  },

  getPermissions: async (): Promise<ApiResponse<{
    id: number;
    name: string;
    content_type: string;
    codename: string;
  }[]>> => {
    return makeDjangoAdminRequest('/api/admin/auth/permission/');
  },

  createGroup: async (groupData: { name: string; permissions: number[] }): Promise<ApiResponse<any>> => {
    return makeDjangoAdminRequest('/api/admin/auth/group/', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  },

  updateGroup: async (groupId: number, groupData: { name?: string; permissions?: number[] }): Promise<ApiResponse<any>> => {
    return makeDjangoAdminRequest(`/api/admin/auth/group/${groupId}/`, {
      method: 'PATCH',
      body: JSON.stringify(groupData)
    });
  },

  // Database Operations
  runDatabaseQuery: async (query: string): Promise<ApiResponse<{
    columns: string[];
    rows: any[][];
    row_count: number;
    execution_time: number;
  }>> => {
    return makeDjangoAdminRequest('/api/admin/database/query/', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  },

  getDatabaseInfo: async (): Promise<ApiResponse<{
    engine: string;
    name: string;
    version: string;
    size: string;
    tables: { name: string; rows: number; size: string }[];
  }>> => {
    return makeDjangoAdminRequest('/api/admin/database/info/');
  },

  // Model Content Management
  createModelInstance: async (appLabel: string, modelName: string, data: any): Promise<ApiResponse<any>> => {
    return makeDjangoAdminRequest(`/api/admin/models/${appLabel}/${modelName}/`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateModelInstance: async (appLabel: string, modelName: string, instanceId: string, data: any): Promise<ApiResponse<any>> => {
    return makeDjangoAdminRequest(`/api/admin/models/${appLabel}/${modelName}/${instanceId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  deleteModelInstance: async (appLabel: string, modelName: string, instanceId: string): Promise<ApiResponse<void>> => {
    return makeDjangoAdminRequest(`/api/admin/models/${appLabel}/${modelName}/${instanceId}/`, {
      method: 'DELETE'
    });
  },

  // Bulk Operations
  bulkDeleteInstances: async (appLabel: string, modelName: string, instanceIds: string[]): Promise<ApiResponse<{ deleted_count: number }>> => {
    return makeDjangoAdminRequest(`/api/admin/models/${appLabel}/${modelName}/bulk-delete/`, {
      method: 'POST',
      body: JSON.stringify({ ids: instanceIds })
    });
  },

  bulkUpdateInstances: async (appLabel: string, modelName: string, updates: { id: string; data: any }[]): Promise<ApiResponse<{ updated_count: number }>> => {
    return makeDjangoAdminRequest(`/api/admin/models/${appLabel}/${modelName}/bulk-update/`, {
      method: 'POST',
      body: JSON.stringify({ updates })
    });
  },

  // Data Export/Import
  exportModelData: async (appLabel: string, modelName: string, format: 'csv' | 'json' | 'xlsx'): Promise<ApiResponse<Blob>> => {
    const response = await makeDjangoAdminRequest(`/api/admin/models/${appLabel}/${modelName}/export/?format=${format}`, {
      method: 'GET'
    });
    
    if (response.success) {
      // Handle blob response for file download
      return response as ApiResponse<Blob>;
    }
    return response as ApiResponse<Blob>;
  },

  importModelData: async (appLabel: string, modelName: string, file: File, format: 'csv' | 'json' | 'xlsx'): Promise<ApiResponse<{
    imported_count: number;
    errors: string[];
  }>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    
    const response = await fetch(`${API_BASE_URL}/api/admin/models/${appLabel}/${modelName}/import/`, {
      method: 'POST',
      headers: getDjangoAdminHeaders(),
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.message || 'Data import failed');
    }
    
    return {
      success: true,
      data,
      message: data.message
    };
  },

  // Django Admin URL Generation
  getDjangoAdminUrl: (path: string = ''): string => {
    return `${API_BASE_URL}/admin/${path}`;
  },

  getModelAdminUrl: (appLabel: string, modelName: string, action: 'changelist' | 'add' | 'change' = 'changelist', objectId?: string): string => {
    let url = `${API_BASE_URL}/admin/${appLabel}/${modelName}/`;
    
    if (action === 'add') {
      url += 'add/';
    } else if (action === 'change' && objectId) {
      url += `${objectId}/change/`;
    }
    
    return url;
  }
};

// Utility functions for Django admin
export const djangoAdminUtils = {
  // Format action flag for display
  formatActionFlag: (actionFlag: string): string => {
    const flags = {
      'ADDITION': '추가',
      'CHANGE': '수정',
      'DELETION': '삭제'
    };
    return flags[actionFlag as keyof typeof flags] || actionFlag;
  },

  // Get action flag color
  getActionFlagColor: (actionFlag: string): string => {
    const colors = {
      'ADDITION': 'green',
      'CHANGE': 'blue',
      'DELETION': 'red'
    };
    return colors[actionFlag as keyof typeof colors] || 'gray';
  },

  // Format model name for display
  formatModelName: (appLabel: string, modelName: string): string => {
    return `${appLabel}.${modelName}`;
  },

  // Check if user has permission
  hasPermission: (userPermissions: string[], requiredPermission: string): boolean => {
    return userPermissions.includes(requiredPermission) || userPermissions.includes('auth.change_user');
  },

  // Generate permission name
  getPermissionName: (appLabel: string, modelName: string, action: 'add' | 'change' | 'delete' | 'view'): string => {
    return `${appLabel}.${action}_${modelName}`;
  },

  // Validate Django model data
  validateModelData: (model: DjangoModel, data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Basic validation (would be enhanced based on actual model fields)
    if (!data || typeof data !== 'object') {
      errors.push('데이터가 올바른 객체 형식이 아닙니다.');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format date for Django admin
  formatAdminDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
};

export default djangoAdminService;