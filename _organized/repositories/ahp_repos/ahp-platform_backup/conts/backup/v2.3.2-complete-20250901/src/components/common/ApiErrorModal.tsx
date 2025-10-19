import React from 'react';

interface ApiErrorModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const ApiErrorModal: React.FC<ApiErrorModalProps> = ({
  isVisible,
  onClose,
  onRetry
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">백엔드 API 연결 실패</h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            백엔드 서버에 연결할 수 없습니다. 서버 상태를 확인하고 다시 시도해주세요.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">🚀 백엔드 API 서버</h4>
            <div className="text-xs text-blue-600 space-y-1">
              <div>
                <strong>서버 주소:</strong> 
                <a href="https://ahp-platform.onrender.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                  https://ahp-platform.onrender.com
                </a>
              </div>
              <div><strong>기능:</strong> PostgreSQL 데이터베이스, JWT 인증, 실시간 CRUD</div>
              <div><strong>상태:</strong> 서버가 깨어나는 중일 수 있습니다 (약 30초 소요)</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            🔄 API 연결 재시도
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiErrorModal;