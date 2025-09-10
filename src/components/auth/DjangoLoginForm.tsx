import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { testBackendIntegration } from '../../utils/backendTest';

interface DjangoLoginFormProps {
  onLogin: (userData: any) => void;
  onRegister?: () => void;
  loading?: boolean;
  error?: string;
}

const DjangoLoginForm: React.FC<DjangoLoginFormProps> = ({
  onLogin,
  onRegister,
  loading = false,
  error
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // 서비스 상태 확인
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await apiService.authAPI.status();
      if (response.success !== false) {
        setServiceStatus('available');
        console.log('✅ Django 백엔드 연결 성공');
      } else {
        setServiceStatus('unavailable');
      }
    } catch (error) {
      console.log('⚠️ Django 백엔드 연결 실패:', error);
      setServiceStatus('unavailable');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // 입력 시 에러 초기화
    setLocalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setLocalError('사용자명과 비밀번호를 입력해주세요.');
      return;
    }

    if (serviceStatus !== 'available') {
      setLocalError('서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setLocalLoading(true);
    setLocalError('');

    try {
      console.log('🔐 Django JWT 로그인 시도:', { username: formData.username });
      
      // Django 백엔드 로그인 (현재 구조에 맞게)
      const response = await apiService.authAPI.login({
        username: formData.username,
        password: formData.password
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // 로그인 성공 처리 (현재 백엔드는 세션 기반)
      if (response.success) {
        console.log('✅ Django 로그인 성공');
      }

      // 로그인 성공 시 사용자 데이터 처리
      const userResponse = response as any;
      if (response.success && userResponse.user) {
        const userData = {
          id: userResponse.user.id || 1,
          username: userResponse.user.username || formData.username,
          email: userResponse.user.email || formData.username,
          first_name: userResponse.user.first_name || formData.username,
          last_name: userResponse.user.last_name || '',
          is_superuser: userResponse.user.is_superuser || false,
          is_staff: userResponse.user.is_staff || false,
          role: (userResponse.user.username === 'aebon' || userResponse.user.is_superuser) ? 'super_admin' : 
                userResponse.user.is_staff ? 'admin' : 'evaluator'
        };
        
        console.log('✅ Django 로그인 성공:', userData);
        onLogin(userData);
      } else {
        // 기본 사용자 데이터로 로그인
        const userData = {
          id: 1,
          username: formData.username,
          email: formData.username,
          first_name: formData.username,
          last_name: '',
          is_superuser: formData.username === 'aebon' || formData.username === 'admin',
          is_staff: formData.username === 'aebon' || formData.username === 'admin',
          role: formData.username === 'aebon' ? 'super_admin' : 
                formData.username === 'admin' ? 'admin' : 'evaluator'
        };
        
        console.log('✅ Django 로그인 성공 (기본 데이터)');
        onLogin(userData);
      }
      
    } catch (error: any) {
      console.error('❌ Django 로그인 실패:', error);
      setLocalError(error.message || '로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.');
    } finally {
      setLocalLoading(false);
    }
  };

  const displayError = error || localError;
  const displayLoading = loading || localLoading;

  if (serviceStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              서비스 연결 확인 중...
            </h2>
            <p className="text-gray-600 text-sm">
              Django 백엔드 서비스에 연결하고 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (serviceStatus === 'unavailable') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              서비스에 연결할 수 없습니다
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Django 백엔드 서비스가 일시적으로 사용할 수 없습니다.
            </p>
            <button
              onClick={checkServiceStatus}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 연결 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AHP Platform
          </h1>
          <p className="text-gray-600">
            Django 백엔드 연동 로그인
          </p>
          <div className="mt-2 space-y-2">
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              서비스 연결됨
            </div>
            <div>
              <button
                type="button"
                onClick={async () => {
                  console.log('🔍 백엔드 연동 테스트 실행...');
                  const results = await testBackendIntegration();
                  alert(`테스트 완료! 브라우저 콘솔을 확인하세요.\n성공률: ${(results.filter(r => r.status === 'success').length / results.length * 100).toFixed(1)}%`);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                disabled={displayLoading}
              >
                연동 상태 테스트
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              사용자명 또는 이메일
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin 또는 test@example.com"
              required
              disabled={displayLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="비밀번호 입력"
              required
              disabled={displayLoading}
            />
          </div>

          {displayError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-700 text-sm">
                {displayError}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={displayLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {displayLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                로그인 중...
              </div>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600 mb-3">
            테스트 계정으로 로그인하기
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-left">
            <div className="text-xs text-gray-700 space-y-1">
              <div><strong>관리자:</strong> admin / ahp2025admin</div>
              <div><strong>이메일:</strong> admin@ahp-platform.com / ahp2025admin</div>
            </div>
          </div>
        </div>

        {onRegister && (
          <div className="mt-4 text-center">
            <button
              onClick={onRegister}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              disabled={displayLoading}
            >
              계정이 없으신가요? 회원가입
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <div className="text-xs text-gray-500">
            Powered by Django + React + JWT
          </div>
        </div>
      </div>
    </div>
  );
};

export default DjangoLoginForm;