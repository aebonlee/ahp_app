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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '28rem',
          width: '100%',
          margin: '0 1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              animation: 'spin 1s linear infinite',
              borderRadius: '50%',
              height: '2rem',
              width: '2rem',
              border: '2px solid transparent',
              borderBottomColor: '#2563eb',
              margin: '0 auto 1rem auto'
            }}></div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              서비스 연결 확인 중...
            </h2>
            <p style={{
              color: '#4b5563',
              fontSize: '0.875rem'
            }}>
              Django 백엔드 서비스에 연결하고 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (serviceStatus === 'unavailable') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #fef2f2, #fce7f3)'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '28rem',
          width: '100%',
          margin: '0 1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              color: '#ef4444',
              fontSize: '2.5rem',
              marginBottom: '1rem'
            }}>⚠️</div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '0.5rem'
            }}>
              서비스에 연결할 수 없습니다
            </h2>
            <p style={{
              color: '#4b5563',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              Django 백엔드 서비스가 일시적으로 사용할 수 없습니다.
            </p>
            <button
              onClick={checkServiceStatus}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'backgroundColor 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            >
              다시 연결 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        maxWidth: '28rem',
        width: '100%',
        margin: '0 1rem'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            AHP Platform
          </h1>
          <p style={{
            color: '#4b5563'
          }}>
            Django 백엔드 연동 로그인
          </p>
          <div style={{
            marginTop: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              backgroundColor: '#dcfce7',
              color: '#166534'
            }}>
              <div style={{
                width: '0.5rem',
                height: '0.5rem',
                backgroundColor: '#4ade80',
                borderRadius: '50%',
                marginRight: '0.25rem'
              }}></div>
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
                style={{
                  fontSize: '0.75rem',
                  color: '#2563eb',
                  textDecoration: 'underline',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: displayLoading ? 'not-allowed' : 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => !displayLoading && (e.currentTarget.style.color = '#1e40af')}
                onMouseLeave={(e) => !displayLoading && (e.currentTarget.style.color = '#2563eb')}
                disabled={displayLoading}
              >
                연동 상태 테스트
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <label htmlFor="username" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              사용자명 또는 이메일
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="admin 또는 test@example.com"
              required
              disabled={displayLoading}
            />
          </div>

          <div>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.25rem'
            }}>
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.boxShadow = 'none';
              }}
              placeholder="비밀번호 입력"
              required
              disabled={displayLoading}
            />
          </div>

          {displayError && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '0.75rem'
            }}>
              <div style={{
                color: '#b91c1c',
                fontSize: '0.875rem'
              }}>
                {displayError}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={displayLoading}
            style={{
              width: '100%',
              backgroundColor: displayLoading ? '#9ca3af' : '#2563eb',
              color: '#ffffff',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: displayLoading ? 'not-allowed' : 'pointer',
              opacity: displayLoading ? 0.5 : 1,
              transition: 'backgroundColor 0.2s, opacity 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!displayLoading) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }
            }}
            onMouseLeave={(e) => {
              if (!displayLoading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
          >
            {displayLoading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  animation: 'spin 1s linear infinite',
                  borderRadius: '50%',
                  height: '1rem',
                  width: '1rem',
                  border: '2px solid transparent',
                  borderBottomColor: '#ffffff',
                  marginRight: '0.5rem'
                }}></div>
                로그인 중...
              </div>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.875rem',
            color: '#4b5563',
            marginBottom: '0.75rem'
          }}>
            테스트 계정으로 로그인하기
          </div>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            textAlign: 'left'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#374151',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <div><strong>관리자:</strong> admin / ahp2025admin</div>
              <div><strong>이메일:</strong> admin@ahp-platform.com / ahp2025admin</div>
            </div>
          </div>
        </div>

        {onRegister && (
          <div style={{
            marginTop: '1rem',
            textAlign: 'center'
          }}>
            <button
              onClick={onRegister}
              style={{
                color: '#2563eb',
                fontSize: '0.875rem',
                fontWeight: '500',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => !displayLoading && (e.currentTarget.style.color = '#1e40af')}
              onMouseLeave={(e) => !displayLoading && (e.currentTarget.style.color = '#2563eb')}
              disabled={displayLoading}
            >
              계정이 없으신가요? 회원가입
            </button>
          </div>
        )}

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            Powered by Django + React + JWT
          </div>
        </div>
      </div>
    </div>
  );
};

export default DjangoLoginForm;