import React from 'react';

interface ApiErrorModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRetry: () => void;
  onUseDemoMode: () => void;
}

const ApiErrorModal: React.FC<ApiErrorModalProps> = ({
  isVisible,
  onClose,
  onRetry,
  onUseDemoMode
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
            실시간 데이터베이스 서버에 연결할 수 없습니다. 다음 중 하나를 선택하세요:
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-orange-800 mb-2">📋 데모 모드로 계속하기</h4>
            <div className="text-xs text-orange-600 space-y-1">
              <div><strong>서비스 계정:</strong> test@ahp.com / ahptester</div>
              <div><strong>기능:</strong> 완전한 AHP 기능 체험</div>
              <div><strong>샘플 데이터:</strong> "소프트웨어 개발자의 AI 활용 방안 중요도 분석"</div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">🚀 실제 API 서버</h4>
            <div className="text-xs text-blue-600 space-y-1">
              <div>
                <strong>백엔드 API:</strong> 
                <a href="https://ahp-forpaper.onrender.com" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                  https://ahp-forpaper.onrender.com
                </a>
              </div>
              <div><strong>기능:</strong> 실제 데이터베이스 연동, JWT 인증, CRUD 작업</div>
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
            onClick={onUseDemoMode}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            📋 데모 모드로 계속하기
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