import { API_BASE_URL } from '../config/api';
import { ApiResponse } from './api';

// File Upload Service Interfaces
export interface FileUploadInfo {
  id: string;
  original_name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  upload_date: string;
  uploaded_by?: string;
  project_id?: string;
  category: 'document' | 'image' | 'data' | 'template' | 'other';
  status: 'uploading' | 'completed' | 'failed' | 'processing';
  metadata?: {
    description?: string;
    tags?: string[];
    public?: boolean;
    expires_at?: string;
  };
  file_hash: string;
  download_count: number;
  is_public: boolean;
  storage_type: 'local' | 's3' | 'database';
}

export interface UploadProgress {
  file_id: string;
  progress_percentage: number;
  bytes_uploaded: number;
  total_bytes: number;
  upload_speed?: number;
  estimated_time_remaining?: number;
  status: 'uploading' | 'completed' | 'failed' | 'paused';
  error_message?: string;
}

export interface FileDownloadInfo {
  id: string;
  download_url: string;
  expires_at: string;
  download_token: string;
}

export interface FileValidationResult {
  is_valid: boolean;
  file_size_valid: boolean;
  file_type_valid: boolean;
  virus_scan_clean?: boolean;
  issues: string[];
  warnings: string[];
}

// HTTP Headers for file upload requests
const getFileUploadHeaders = (includeContentType: boolean = false): HeadersInit => {
  const headers: HeadersInit = {};
  
  // Don't set Content-Type for FormData - browser will set it with boundary
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  const accessToken = localStorage.getItem('ahp_access_token') || sessionStorage.getItem('ahp_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
};

// Make file upload API request
const makeFileUploadRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`📁 File Upload API: ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        ...getFileUploadHeaders(false),
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
      console.error(`File Upload API: Expected JSON, got ${contentType}`, text.substring(0, 200));
    }

    if (!response.ok) {
      console.error(`File Upload API Error [${endpoint}]:`, {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      throw new Error(data?.message || data?.error || `HTTP ${response.status}: File upload API 요청 실패`);
    }

    return {
      success: true,
      data: data?.data || data,
      message: data?.message
    };
  } catch (error: any) {
    console.error(`File Upload API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'Unknown file upload error occurred'
    };
  }
};

// File Upload Service
export const fileUploadService = {
  // File Upload
  uploadFile: async (
    file: File, 
    category: FileUploadInfo['category'] = 'document',
    metadata?: FileUploadInfo['metadata'],
    projectId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ApiResponse<FileUploadInfo>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    if (projectId) {
      formData.append('project_id', projectId);
    }
    
    // Generate file hash for deduplication
    const fileHash = await generateFileHash(file);
    formData.append('file_hash', fileHash);
    
    try {
      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const fileId = generateUniqueId();
        
        // Progress tracking
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress: UploadProgress = {
              file_id: fileId,
              progress_percentage: Math.round((event.loaded / event.total) * 100),
              bytes_uploaded: event.loaded,
              total_bytes: event.total,
              status: 'uploading'
            };
            onProgress(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              
              // Store file info locally for immediate access
              if (data.data) {
                storeFileInfoLocally(data.data);
              }
              
              resolve({
                success: true,
                data: data.data || data,
                message: data.message
              });
            } catch (error) {
              reject(new Error('Failed to parse upload response'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });
        
        const headers = getFileUploadHeaders(false);
        xhr.open('POST', `${API_BASE_URL}/api/files/upload/`);
        
        // Set authorization header if available
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value as string);
        });
        
        xhr.send(formData);
      });
    } catch (error: any) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error.message || 'File upload failed'
      };
    }
  },

  // Get file info
  getFileInfo: async (fileId: string): Promise<ApiResponse<FileUploadInfo>> => {
    return makeFileUploadRequest<FileUploadInfo>(`/api/files/${fileId}/`);
  },

  // List files
  getFiles: async (
    page: number = 1, 
    category?: FileUploadInfo['category'],
    projectId?: string,
    search?: string
  ): Promise<ApiResponse<{
    results: FileUploadInfo[];
    count: number;
    next?: string;
    previous?: string;
  }>> => {
    let params = `?page=${page}`;
    if (category) params += `&category=${category}`;
    if (projectId) params += `&project_id=${projectId}`;
    if (search) params += `&search=${encodeURIComponent(search)}`;
    
    return makeFileUploadRequest(`/api/files/${params}`);
  },

  // Download file
  downloadFile: async (fileId: string): Promise<ApiResponse<FileDownloadInfo>> => {
    const response = await makeFileUploadRequest<FileDownloadInfo>(`/api/files/${fileId}/download/`, {
      method: 'POST'
    });
    
    // Track download
    if (response.success && response.data) {
      await fileUploadService.incrementDownloadCount(fileId);
    }
    
    return response as ApiResponse<FileDownloadInfo>;
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<ApiResponse<void>> => {
    const response = await makeFileUploadRequest<void>(`/api/files/${fileId}/`, {
      method: 'DELETE'
    });
    
    // Remove from local storage
    if (response.success) {
      removeFileInfoLocally(fileId);
    }
    
    return response;
  },

  // Update file metadata
  updateFileMetadata: async (
    fileId: string, 
    metadata: Partial<FileUploadInfo['metadata']>
  ): Promise<ApiResponse<FileUploadInfo>> => {
    return makeFileUploadRequest<FileUploadInfo>(`/api/files/${fileId}/metadata/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata })
    });
  },

  // Validate file
  validateFile: async (file: File): Promise<FileValidationResult> => {
    const validation: FileValidationResult = {
      is_valid: true,
      file_size_valid: true,
      file_type_valid: true,
      issues: [],
      warnings: []
    };
    
    // File size validation (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      validation.file_size_valid = false;
      validation.is_valid = false;
      validation.issues.push(`파일 크기가 50MB를 초과합니다. (현재: ${formatFileSize(file.size)})`);
    }
    
    // File type validation
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      validation.file_type_valid = false;
      validation.is_valid = false;
      validation.issues.push(`지원되지 않는 파일 형식입니다: ${file.type}`);
    }
    
    // File name validation
    if (file.name.length > 255) {
      validation.is_valid = false;
      validation.issues.push('파일명이 너무 깁니다 (최대 255자)');
    }
    
    // Security checks for file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (dangerousExtensions.includes(fileExtension)) {
      validation.file_type_valid = false;
      validation.is_valid = false;
      validation.issues.push(`보안상 위험한 파일 확장자입니다: ${fileExtension}`);
    }
    
    return validation;
  },

  // Bulk file operations
  bulkDeleteFiles: async (fileIds: string[]): Promise<ApiResponse<{ deleted_count: number }>> => {
    const response = await makeFileUploadRequest<{ deleted_count: number }>('/api/files/bulk-delete/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_ids: fileIds })
    });
    
    // Remove from local storage
    if (response.success) {
      fileIds.forEach(id => removeFileInfoLocally(id));
    }
    
    return response;
  },

  // File sharing
  createShareLink: async (
    fileId: string, 
    expiresIn: number = 24, 
    isPublic: boolean = false
  ): Promise<ApiResponse<{ share_url: string; expires_at: string }>> => {
    return makeFileUploadRequest(`/api/files/${fileId}/share/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        expires_in_hours: expiresIn,
        is_public: isPublic
      })
    });
  },

  // File backup and recovery
  createFileBackup: async (fileId: string): Promise<ApiResponse<{ backup_id: string }>> => {
    return makeFileUploadRequest(`/api/files/${fileId}/backup/`, {
      method: 'POST'
    });
  },

  restoreFileFromBackup: async (backupId: string): Promise<ApiResponse<FileUploadInfo>> => {
    return makeFileUploadRequest(`/api/files/restore/${backupId}/`, {
      method: 'POST'
    });
  },

  // Statistics
  getUploadStatistics: async (): Promise<ApiResponse<{
    total_files: number;
    total_size: number;
    files_by_category: Record<string, number>;
    recent_uploads: FileUploadInfo[];
  }>> => {
    return makeFileUploadRequest('/api/files/statistics/');
  },

  // File cleanup
  cleanupExpiredFiles: async (): Promise<ApiResponse<{ cleaned_count: number }>> => {
    return makeFileUploadRequest('/api/files/cleanup/', {
      method: 'POST'
    });
  },

  // Increment download count
  incrementDownloadCount: async (fileId: string): Promise<ApiResponse<void>> => {
    return makeFileUploadRequest(`/api/files/${fileId}/download-count/`, {
      method: 'POST'
    });
  }
};

// Utility functions for file upload
export const fileUploadUtils = {
  // Validate file before upload
  validateFileBeforeUpload: async (file: File): Promise<FileValidationResult> => {
    return fileUploadService.validateFile(file);
  },

  // Format file size for display
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file type icon
  getFileTypeIcon: (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📺';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '📦';
    return '📁';
  },

  // Check if file is image
  isImageFile: (mimeType: string): boolean => {
    return mimeType.startsWith('image/');
  },

  // Check if file is document
  isDocumentFile: (mimeType: string): boolean => {
    return mimeType.includes('pdf') || 
           mimeType.includes('word') || 
           mimeType.includes('document') ||
           mimeType.includes('text');
  },

  // Generate thumbnail for image files
  generateImageThumbnail: async (file: File, maxSize: number = 200): Promise<string | null> => {
    if (!file.type.startsWith('image/')) return null;
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL());
      };
      
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  },

  // Auto-categorize file based on type
  categorizeFile: (file: File): FileUploadInfo['category'] => {
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('excel') || mimeType.includes('csv') || mimeType.includes('spreadsheet')) return 'data';
    
    return 'other';
  },

  // Store upload progress locally
  storeUploadProgress: (fileId: string, progress: UploadProgress): void => {
    try {
      const key = `upload_progress_${fileId}`;
      localStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to store upload progress:', error);
    }
  },

  // Get upload progress from local storage
  getUploadProgress: (fileId: string): UploadProgress | null => {
    try {
      const key = `upload_progress_${fileId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to get upload progress:', error);
    }
    return null;
  },

  // Clear upload progress
  clearUploadProgress: (fileId: string): void => {
    try {
      const key = `upload_progress_${fileId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear upload progress:', error);
    }
  }
};

// Helper functions
async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateUniqueId(): string {
  return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function storeFileInfoLocally(fileInfo: FileUploadInfo): void {
  try {
    const existing = getLocalFileInfos();
    existing[fileInfo.id] = fileInfo;
    localStorage.setItem('ahp_uploaded_files', JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to store file info locally:', error);
  }
}

function removeFileInfoLocally(fileId: string): void {
  try {
    const existing = getLocalFileInfos();
    delete existing[fileId];
    localStorage.setItem('ahp_uploaded_files', JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to remove file info locally:', error);
  }
}

function getLocalFileInfos(): Record<string, FileUploadInfo> {
  try {
    const stored = localStorage.getItem('ahp_uploaded_files');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to get local file infos:', error);
    return {};
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default fileUploadService;