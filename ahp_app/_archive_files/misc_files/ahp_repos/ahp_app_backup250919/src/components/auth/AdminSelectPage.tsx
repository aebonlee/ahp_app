import React, { useState, useEffect } from 'react';
// import Card from '../common/Card'; // 임시 비활성화
import apiService from '../../services/apiService';

interface AdminSelectPageProps {
  onAdminSelect: () => void;
  onUserSelect: () => void;
  onBackToLogin: () => void;
}

const AdminSelectPage: React.FC<AdminSelectPageProps> = ({ 
  onAdminSelect, 
  onUserSelect,
  onBackToLogin 
}) => {
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // Django 백엔드 서비스 상태 확인
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
  // 서비스 상태 확인 중 화면
  if (serviceStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'var(--gradient-subtle)'
      }}>
        <div className="card p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{
              borderColor: 'var(--accent-primary)'
            }}></div>
            <h2 className="text-xl font-semibold mb-2" style={{
              color: 'var(--text-primary)'
            }}>
              서비스 연결 확인 중...
            </h2>
            <p className="text-sm" style={{
              color: 'var(--text-secondary)'
            }}>
              Django 백엔드 서비스에 연결하고 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 서비스 사용 불가 화면
  if (serviceStatus === 'unavailable') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'var(--gradient-subtle)'
      }}>
        <div className="card p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4" style={{
              color: 'var(--semantic-danger)'
            }}>⚠️</div>
            <h2 className="text-xl font-semibold mb-2" style={{
              color: 'var(--text-primary)'
            }}>
              서비스에 연결할 수 없습니다
            </h2>
            <p className="text-sm mb-4" style={{
              color: 'var(--text-secondary)'
            }}>
              Django 백엔드 서비스가 일시적으로 사용할 수 없습니다.
            </p>
            <button
              onClick={checkServiceStatus}
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--semantic-danger)',
                borderColor: 'var(--semantic-danger)'
              }}
            >
              다시 연결 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
      backgroundColor: 'var(--bg-base)'
    }}>
      {/* Modern gradient background */}
      <div className="absolute inset-0" style={{
        background: 'var(--gradient-accent-subtle)'
      }}></div>
      
      {/* Elegant geometric patterns */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{
          backgroundColor: 'var(--accent-focus)'
        }}></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{
          backgroundColor: 'rgba(var(--accent-rgb), 0.15)'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl" style={{
          backgroundColor: 'rgba(var(--accent-rgb), 0.1)'
        }}></div>
      </div>

      <div className="max-w-4xl w-full space-y-6 relative z-10">
        {/* 개선된 헤더 */}
        <div className="text-center">
          <button
            onClick={onBackToLogin}
            className="btn btn-ghost inline-flex items-center mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            로그인으로 돌아가기
          </button>
          
          <h2 className="text-3xl font-bold mb-3" style={{
            color: 'var(--text-primary)'
          }}>
            AHP Platform - 계정 유형 선택
          </h2>
          
          <p className="mt-2 text-base font-normal" style={{
            color: 'var(--text-secondary)'
          }}>
            Django 백엔드 연동 - 관리자 권한 또는 일반 사용자로 접속하세요
            <br />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>시스템에서 PostgreSQL을 통해 자동으로 권한을 확인합니다</span>
          </p>
          <div className="mt-2">
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{
              backgroundColor: 'var(--status-success-bg)',
              color: 'var(--status-success-text)'
            }}>
              <div className="w-2 h-2 rounded-full mr-1" style={{
                backgroundColor: 'var(--semantic-success)'
              }}></div>
              Django 서비스 연결됨
            </div>
          </div>
        </div>
        
        {/* 관리자/사용자 선택 카드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto px-6">
          {/* 관리자 선택 카드 */}
          <div className="card card-hover-lift cursor-pointer">
            <div 
              className="text-center p-6 sm:p-8"
              onClick={onAdminSelect}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{
                color: '#1f2937',
                fontWeight: '800'
              }}>
                관리자 계정
              </h3>
              
              <p className="mb-6 leading-normal font-medium text-base sm:text-lg" style={{
                color: '#4b5563',
                lineHeight: '1.4'
              }}>
                시스템 관리 및 모든 기능에 대한
                완전한 권한으로 접속
              </p>
              
              <div className="space-y-3 text-sm sm:text-base mb-6" style={{
                color: '#374151'
              }}>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#10b981' }}>✓</span>
                  <span className="font-medium">모든 프로젝트 관리</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#10b981' }}>✓</span>
                  <span className="font-medium">사용자 권한 관리</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#10b981' }}>✓</span>
                  <span className="font-medium">시스템 설정 변경</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: '#10b981' }}>✓</span>
                  <span className="font-medium">전체 데이터 접근</span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <button 
                  className="relative w-full py-4 px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  onClick={onAdminSelect}
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    관리자로 접속
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 일반 사용자 선택 카드 */}
          <div className="card card-hover-lift cursor-pointer" onClick={onUserSelect}>
            <div className="text-center p-6 sm:p-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center rounded-2xl shadow-lg" style={{
                background: 'linear-gradient(135deg, var(--semantic-info), var(--accent-primary))'
              }}>
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{
                color: 'var(--text-primary)'
              }}>
                일반 사용자
              </h3>
              
              <p className="mb-6 leading-normal font-medium text-base sm:text-lg" style={{
                color: 'var(--text-secondary)'
              }}>
                기본 사용자 권한으로
                AHP 분석 서비스 이용
              </p>
              
              <div className="space-y-3 text-sm sm:text-base mb-6" style={{
                color: 'var(--text-tertiary)'
              }}>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: 'var(--semantic-info)' }}>✓</span>
                  <span className="font-medium">개인 프로젝트 생성</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: 'var(--semantic-info)' }}>✓</span>
                  <span className="font-medium">평가 및 분석 수행</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: 'var(--semantic-info)' }}>✓</span>
                  <span className="font-medium">결과 리포트 생성</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="mr-3 text-lg font-bold" style={{ color: 'var(--semantic-info)' }}>✓</span>
                  <span className="font-medium">개인 데이터 관리</span>
                </div>
              </div>

              <button 
                className="btn btn-primary w-full py-4 text-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--semantic-info), var(--accent-primary))'
                }}
                onClick={onUserSelect}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  일반 사용자로 접속
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="text-center text-sm">
          <p className="font-normal" style={{
            color: 'var(--text-secondary)'
          }}>
            권한은 Django 백엔드에서 PostgreSQL을 통해 자동으로 확인됩니다
          </p>
          <p className="font-normal mt-1 text-xs" style={{
            color: 'var(--text-muted)'
          }}>
            Powered by Django + React + PostgreSQL
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSelectPage;