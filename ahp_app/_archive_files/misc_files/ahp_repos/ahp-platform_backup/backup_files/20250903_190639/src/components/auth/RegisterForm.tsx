import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

interface RegisterFormProps {
  onRegister: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => Promise<void>;
  onBackToLogin: () => void;
  loading?: boolean;
  error?: string;
  mode: 'service' | 'admin';
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onRegister, 
  onBackToLogin, 
  loading = false, 
  error,
  mode 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = '이름을 입력해주세요';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = '성을 입력해주세요';
    }

    if (!formData.email) {
      errors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요';
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      errors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      const role = mode === 'service' ? 'evaluator' : 'admin';
      await onRegister({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role
      });
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            로그인으로 돌아가기
          </button>
          
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'service' ? (
              <>
                <span className="text-blue-600">서비스</span> 회원가입
              </>
            ) : (
              <>
                <span className="text-purple-600">관리자</span> 회원가입
              </>
            )}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'service' 
              ? 'AHP 의사결정 분석 서비스에 가입하세요'
              : '시스템 관리자 계정을 생성하세요'
            }
          </p>
        </div>
        
        {/* 회원가입 폼 */}
        <Card className="shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="firstName"
                type="text"
                label="이름"
                placeholder="이름"
                value={formData.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
                error={validationErrors.firstName}
                required
              />

              <Input
                id="lastName"
                type="text"
                label="성"
                placeholder="성"
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                error={validationErrors.lastName}
                required
              />
            </div>

            <Input
              id="email"
              type="email"
              label="이메일 주소"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              error={validationErrors.email}
              required
            />

            <Input
              id="password"
              type="password"
              label="비밀번호"
              placeholder="비밀번호를 입력하세요 (최소 6자)"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              error={validationErrors.password}
              required
            />

            <Input
              id="confirmPassword"
              type="password"
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              error={validationErrors.confirmPassword}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              className={`w-full ${
                mode === 'service' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {loading ? '계정 생성 중...' : '회원가입'}
            </Button>
          </form>

          {/* 서비스 안내 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {mode === 'service' ? '서비스 혜택' : '관리자 권한'}
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              {mode === 'service' ? (
                <div className="text-sm text-gray-700 leading-relaxed">
                  <div className="flex items-center mb-2">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="font-medium">회원 가입 후 무료 체험은 1일간 1개 프로젝트에 3명의 평가자를 초대하여 이용해 보고 전문 분석 리포트까지 확인할 수 있습니다.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <span className="text-purple-500 mr-2">✓</span>
                    사용자 및 권한 관리
                  </div>
                  <div className="flex items-center">
                    <span className="text-purple-500 mr-2">✓</span>
                    구독 서비스 운영
                  </div>
                  <div className="flex items-center">
                    <span className="text-purple-500 mr-2">✓</span>
                    시스템 모니터링
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm;