import React, { useState, useRef, useCallback } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  TrashIcon, 
  EyeIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Button from './Button';
import Modal from './Modal';
import { 
  fileUploadService, 
  fileUploadUtils, 
  FileUploadInfo, 
  UploadProgress, 
  FileValidationResult 
} from '../../services/fileUploadService';

interface FileUploadProps {
  onFileUploaded?: (fileInfo: FileUploadInfo) => void;
  onFileDeleted?: (fileId: string) => void;
  allowMultiple?: boolean;
  accept?: string;
  maxFileSize?: number; // in bytes
  category?: FileUploadInfo['category'];
  projectId?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  allowDownload?: boolean;
}

interface FileUploadState {
  files: FileUploadInfo[];
  uploadProgress: Record<string, UploadProgress>;
  dragActive: boolean;
  previewFile: FileUploadInfo | null;
  showDeleteConfirm: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileDeleted,
  allowMultiple = false,
  accept = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv",
  maxFileSize = 50 * 1024 * 1024, // 50MB
  category = 'document',
  projectId,
  className = '',
  disabled = false,
  showPreview = true,
  allowDownload = true
}) => {
  const [state, setState] = useState<FileUploadState>({
    files: [],
    uploadProgress: {},
    dragActive: false,
    previewFile: null,
    showDeleteConfirm: null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Load existing files on mount
  React.useEffect(() => {
    loadExistingFiles();
  }, [projectId, category]);

  const loadExistingFiles = async () => {
    try {
      const response = await fileUploadService.getFiles(1, category, projectId);
      if (response.success && response.data) {
        setState(prev => ({ ...prev, files: response.data?.results || [] }));
      }
    } catch (error) {
      console.error('Failed to load existing files:', error);
    }
  };

  const validateFile = async (file: File): Promise<FileValidationResult> => {
    const validation = await fileUploadUtils.validateFileBeforeUpload(file);
    
    // Additional size check against props
    if (file.size > maxFileSize) {
      validation.file_size_valid = false;
      validation.is_valid = false;
      validation.issues.push(`파일 크기가 제한을 초과합니다. (최대: ${fileUploadUtils.formatFileSize(maxFileSize)})`);
    }
    
    return validation;
  };

  const handleFileUpload = async (files: FileList) => {
    if (disabled) return;
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    const fileArray = Array.from(files);
    
    // Validate multiple file upload
    if (!allowMultiple && fileArray.length > 1) {
      setError('한 번에 하나의 파일만 업로드할 수 있습니다.');
      setLoading(false);
      return;
    }
    
    // Validate and upload each file
    for (const file of fileArray) {
      const validation = await validateFile(file);
      
      if (!validation.is_valid) {
        setError(`파일 업로드 실패 (${file.name}): ${validation.issues.join(', ')}`);
        continue;
      }
      
      const metadata = {
        description: `Uploaded ${file.name}`,
        tags: [category],
        public: false
      };
      
      try {
        const response = await fileUploadService.uploadFile(
          file,
          category,
          metadata,
          projectId,
          (progress) => {
            setState(prev => ({
              ...prev,
              uploadProgress: {
                ...prev.uploadProgress,
                [progress.file_id]: progress
              }
            }));
            
            // Store progress locally
            fileUploadUtils.storeUploadProgress(progress.file_id, progress);
          }
        );
        
        if (response.success && response.data) {
          // Add to file list
          setState(prev => ({
            ...prev,
            files: [...prev.files, response.data!],
            uploadProgress: {
              ...prev.uploadProgress,
              [response.data!.id]: {
                file_id: response.data!.id,
                progress_percentage: 100,
                bytes_uploaded: response.data!.file_size,
                total_bytes: response.data!.file_size,
                status: 'completed'
              }
            }
          }));
          
          // Clean up progress
          setTimeout(() => {
            setState(prev => {
              const newProgress = { ...prev.uploadProgress };
              delete newProgress[response.data!.id];
              return { ...prev, uploadProgress: newProgress };
            });
            fileUploadUtils.clearUploadProgress(response.data!.id);
          }, 2000);
          
          setSuccess(`파일 업로드 완료: ${file.name}`);
          onFileUploaded?.(response.data!);
          
          console.log('✅ 파일 업로드 완료:', response.data);
        } else {
          throw new Error(response.error || '파일 업로드에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('파일 업로드 오류:', error);
        setError(`파일 업로드 실패 (${file.name}): ${error.message}`);
        
        // Update progress to failed
        setState(prev => ({
          ...prev,
          uploadProgress: {
            ...prev.uploadProgress,
            [file.name]: {
              file_id: file.name,
              progress_percentage: 0,
              bytes_uploaded: 0,
              total_bytes: file.size,
              status: 'failed',
              error_message: error.message
            }
          }
        }));
      }
    }
    
    setLoading(false);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, dragActive: false }));
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setState(prev => ({ ...prev, dragActive: true }));
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, dragActive: false }));
  }, []);

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fileUploadService.deleteFile(fileId);
      if (response.success) {
        setState(prev => ({
          ...prev,
          files: prev.files.filter(f => f.id !== fileId),
          showDeleteConfirm: null
        }));
        setSuccess('파일이 삭제되었습니다.');
        onFileDeleted?.(fileId);
        console.log('✅ 파일 삭제 완료:', fileId);
      } else {
        throw new Error(response.error || '파일 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('파일 삭제 오류:', error);
      setError(`파일 삭제 실패: ${error.message}`);
    }
  };

  const handleDownloadFile = async (file: FileUploadInfo) => {
    try {
      const response = await fileUploadService.downloadFile(file.id);
      if (response.success && response.data) {
        // Open download URL in new tab
        window.open(response.data.download_url, '_blank');
        console.log('✅ 파일 다운로드 시작:', file.original_name);
      } else {
        throw new Error(response.error || '파일 다운로드에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('파일 다운로드 오류:', error);
      setError(`파일 다운로드 실패: ${error.message}`);
    }
  };

  const getUploadProgressBar = (progress: UploadProgress) => {
    const getStatusColor = () => {
      switch (progress.status) {
        case 'completed': return 'bg-green-500';
        case 'failed': return 'bg-red-500';
        case 'paused': return 'bg-yellow-500';
        default: return 'bg-blue-500';
      }
    };
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{progress.status === 'completed' ? '완료' : `${progress.progress_percentage}%`}</span>
          {progress.upload_speed && (
            <span>{fileUploadUtils.formatFileSize(progress.upload_speed)}/s</span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
            style={{ width: `${progress.progress_percentage}%` }}
          />
        </div>
        {progress.error_message && (
          <p className="text-xs text-red-600 mt-1">{progress.error_message}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : state.dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CloudArrowUpIcon className={`h-12 w-12 mx-auto mb-4 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
        
        <div className="space-y-2">
          <p className={`text-lg font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {allowMultiple ? '파일들을 드래그하거나 클릭하여 업로드' : '파일을 드래그하거나 클릭하여 업로드'}
          </p>
          <p className={`text-sm ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
            지원 형식: {accept.split(',').join(', ')}
          </p>
          <p className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
            최대 파일 크기: {fileUploadUtils.formatFileSize(maxFileSize)}
          </p>
        </div>
        
        {loading && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={allowMultiple}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Progress */}
      {Object.keys(state.uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">업로드 진행 상황</h4>
          {Object.values(state.uploadProgress).map((progress) => (
            <div key={progress.file_id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  파일 업로드 중...
                </span>
                {progress.status === 'uploading' && (
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                )}
              </div>
              {getUploadProgressBar(progress)}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {state.files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">업로드된 파일</h4>
          <div className="grid grid-cols-1 gap-3">
            {state.files.map((file) => (
              <div key={file.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {fileUploadUtils.getFileTypeIcon(file.mime_type)}
                    </span>
                    <div>
                      <h5 className="font-medium text-gray-900">{file.original_name}</h5>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{fileUploadUtils.formatFileSize(file.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(file.upload_date).toLocaleDateString('ko-KR')}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          file.status === 'completed' ? 'bg-green-100 text-green-800' :
                          file.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          file.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {file.status === 'completed' ? '완료' :
                           file.status === 'processing' ? '처리 중' :
                           file.status === 'failed' ? '실패' : file.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {showPreview && fileUploadUtils.isImageFile(file.mime_type) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setState(prev => ({ ...prev, previewFile: file }))}
                        className="flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        미리보기
                      </Button>
                    )}
                    
                    {allowDownload && file.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadFile(file)}
                        className="flex items-center"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        다운로드
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: file.id }))}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
                
                {file.metadata?.description && (
                  <p className="mt-2 text-sm text-gray-600">{file.metadata.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={!!state.previewFile}
        onClose={() => setState(prev => ({ ...prev, previewFile: null }))}
        title="파일 미리보기"
        size="lg"
      >
        {state.previewFile && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium text-gray-900">{state.previewFile.original_name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {fileUploadUtils.formatFileSize(state.previewFile.file_size)} • 
                {new Date(state.previewFile.upload_date).toLocaleDateString('ko-KR')}
              </p>
            </div>
            
            {fileUploadUtils.isImageFile(state.previewFile.mime_type) && (
              <div className="flex justify-center">
                <img
                  src={`${state.previewFile.file_path}`}
                  alt={state.previewFile.original_name}
                  className="max-w-full max-h-96 rounded-lg"
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, previewFile: null }))}
              >
                닫기
              </Button>
              <Button
                variant="primary"
                onClick={() => state.previewFile && handleDownloadFile(state.previewFile)}
              >
                다운로드
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!state.showDeleteConfirm}
        onClose={() => setState(prev => ({ ...prev, showDeleteConfirm: null }))}
        title="파일 삭제 확인"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            정말로 이 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </p>
          
          {state.showDeleteConfirm && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900">
                {state.files.find(f => f.id === state.showDeleteConfirm)?.original_name}
              </p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: null }))}
            >
              취소
            </Button>
            <Button
              variant="primary"
              onClick={() => state.showDeleteConfirm && handleDeleteFile(state.showDeleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FileUpload;