import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  error?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = '사용자명을 입력해주세요.';
    }

    if (!formData.password) {
      errors.password = '비밀번호를 입력해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await onLogin(formData.username, formData.password);
      if (result.success) {
        // 로그인 성공 시 자동으로 대시보드로 리디렉션됩니다
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 그라디언트 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        opacity: 0.1
      }} />
      
      {/* 기하학적 패턴 */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '20rem',
          height: '20rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
          filter: 'blur(3rem)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '16rem',
          height: '16rem',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(118, 75, 162, 0.15) 0%, transparent 70%)',
          filter: 'blur(3rem)'
        }} />
      </div>

      <div style={{ 
        maxWidth: '28rem',
        width: '100%',
        padding: '2rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              marginBottom: '2rem',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로 돌아가기
          </Link>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            ⚡ AHP 시스템 로그인
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)'
          }}>
            계정에 로그인하여 대시보드에 접속하세요
          </p>
        </div>

        <Card variant="elevated" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <Input
                id="username"
                label="사용자명"
                type="text"
                placeholder="사용자명을 입력하세요"
                value={formData.username}
                onChange={(value) => setFormData(prev => ({ ...prev, username: value }))}
                error={validationErrors.username}
                required
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <Input
                id="password"
                label="비밀번호"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
                error={validationErrors.password}
                required
              />
            </div>

            {/* 테스트 계정 정보 */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <h4 style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#0369a1',
                marginBottom: '0.5rem'
              }}>
                🧪 테스트 계정
              </h4>
              <div style={{ fontSize: '0.75rem', color: '#0c4a6e', lineHeight: '1.4' }}>
                <div><strong>관리자 계정:</strong> admin / ahp2025admin</div>
                <div><strong>이메일 로그인:</strong> admin@ahp-platform.com / ahp2025admin</div>
                <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#0369a1' }}>
                  * Django 백엔드에 실제 존재하는 계정입니다
                </div>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: 'var(--status-danger-bg)',
                border: '1px solid var(--status-danger-border)',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--status-danger-text)'
                }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* 로그인 버튼 */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              style={{ width: '100%', marginBottom: '1.5rem' }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </Button>

            {/* 구분선 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0'
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                backgroundColor: 'var(--border-subtle)'
              }} />
              <span style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                padding: '0 1rem'
              }}>
                계정이 없으신가요?
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                backgroundColor: 'var(--border-subtle)'
              }} />
            </div>

            {/* 회원가입 링크들 */}
            <div style={{ 
              display: 'grid', 
              gap: '0.75rem',
              fontSize: '0.875rem'
            }}>
              <Link
                to="/register/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: '#dc2626',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                }}
              >
                <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>🛡️</span>
                <div>
                  <div style={{ fontWeight: '600' }}>관리자 계정 신청</div>
                  <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>승인 후 이용 가능</div>
                </div>
              </Link>

              <Link
                to="/register/personal"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: '#2563eb',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dbeafe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
              >
                <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>💼</span>
                <div>
                  <div style={{ fontWeight: '600' }}>개인서비스 이용자 가입</div>
                  <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>14일 무료 체험 가능</div>
                </div>
              </Link>

              <Link
                to="/register/evaluator"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: '#059669',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dcfce7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                }}
              >
                <span style={{ fontSize: '1.25rem', marginRight: '0.75rem' }}>📝</span>
                <div>
                  <div style={{ fontWeight: '600' }}>평가자 가입</div>
                  <div style={{ fontSize: '0.75rem', color: '#047857' }}>초대 코드 필요</div>
                </div>
              </Link>
            </div>
          </form>
        </Card>

        {/* 테스트 계정 안내 */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}>
          <div style={{
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            📋 테스트 계정 정보
          </div>
          <div style={{
            display: 'grid',
            gap: '0.25rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <div>• <strong>슈퍼 관리자:</strong> aebon / AebonAdmin2024!</div>
            <div>• <strong>시스템 관리자:</strong> system_admin / SystemAdmin2024!</div>
            <div>• <strong>개인서비스:</strong> business_user / BusinessUser2024!</div>
            <div>• <strong>평가자:</strong> evaluator01 / Evaluator2024!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;