/**
 * Django 관리자 페이지 연동 컴포넌트
 * Backend Django Admin 인터페이스와 연결
 */

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/api';
import { User } from '../../types';

interface DjangoAdminIntegrationProps {
  user: User;
}

const DjangoAdminIntegration: React.FC<DjangoAdminIntegrationProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [adminStatus, setAdminStatus] = useState<{
    isAccessible: boolean;
    message: string;
  }>({ isAccessible: false, message: 'Django 관리자 접근 상태 확인 중...' });

  useEffect(() => {
    checkDjangoAdminAccess();
  }, []);

  const checkDjangoAdminAccess = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/`, {
        method: 'HEAD',
        credentials: 'include'
      });

      if (response.ok || response.status === 302) {
        setAdminStatus({
          isAccessible: true,
          message: 'Django 관리자 페이지에 접근할 수 있습니다.'
        });
      } else {
        setAdminStatus({
          isAccessible: false,
          message: 'Django 관리자 페이지 접근 권한이 없습니다.'
        });
      }
    } catch (error) {
      setAdminStatus({
        isAccessible: false,
        message: 'Django 관리자 페이지 연결에 실패했습니다.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDjangoAdmin = () => {
    window.open(`${API_BASE_URL}/admin/`, '_blank');
  };

  const adminFeatures = [
    {
      title: '사용자 관리',
      description: 'User 모델 직접 편집 및 권한 설정',
      url: '/admin/auth/user/',
      icon: '👥'
    },
    {
      title: '프로젝트 관리',
      description: 'Project 모델 데이터베이스 직접 관리',
      url: '/admin/projects/project/',
      icon: '📋'
    },
    {
      title: '평가 데이터',
      description: 'Evaluation 및 PairwiseComparison 관리',
      url: '/admin/evaluations/',
      icon: '⚖️'
    },
    {
      title: '시스템 로그',
      description: 'Django admin logs 및 시스템 활동',
      url: '/admin/admin/logentry/',
      icon: '📝'
    },
    {
      title: '그룹 & 권한',
      description: 'Django Groups 및 Permissions 관리',
      url: '/admin/auth/group/',
      icon: '🔐'
    },
    {
      title: '세션 관리',
      description: '활성 사용자 세션 모니터링',
      url: '/admin/sessions/session/',
      icon: '🔑'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Django 관리자 연동 헤더 */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
               style={{ backgroundColor: 'var(--accent-quaternary)', color: 'white' }}>
            🔧
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Django 관리자 페이지 연동
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              백엔드 데이터베이스를 직접 관리하고 모니터링하세요
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>🌐 Backend URL: {API_BASE_URL}</span>
              <span>👤 {user.username}</span>
              <span>🛡️ {user.role === 'super_admin' ? '슈퍼 관리자' : '관리자'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 연결 상태 */}
      <div className="p-6 rounded-xl" style={{ 
        backgroundColor: adminStatus.isAccessible ? 'var(--bg-success)' : 'var(--bg-error)',
        border: `1px solid ${adminStatus.isAccessible ? 'var(--border-success)' : 'var(--border-error)'}`
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {isLoading ? '🔄' : adminStatus.isAccessible ? '✅' : '❌'}
            </span>
            <div>
              <h3 className="font-bold text-lg">Django 관리자 연결 상태</h3>
              <p className="text-sm">{adminStatus.message}</p>
            </div>
          </div>
          {adminStatus.isAccessible && (
            <button
              onClick={openDjangoAdmin}
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: 'var(--accent-quaternary)', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Django 관리자 열기 →
            </button>
          )}
        </div>
      </div>

      {/* 권한 안내 */}
      {user.role !== 'super_admin' && user.role !== 'service_admin' && (
        <div className="p-6 rounded-xl" style={{ 
          backgroundColor: 'var(--accent-warning-pastel)', 
          border: '1px solid var(--accent-warning)' 
        }}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold" style={{ color: 'var(--accent-warning-dark)' }}>
                권한 제한 안내
              </h3>
              <p className="text-sm" style={{ color: 'var(--accent-warning-dark)' }}>
                Django 관리자 페이지는 super_admin 또는 service_admin 권한이 필요합니다.
                현재 권한: {user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Django 관리자 기능 목록 */}
      <div>
        <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Django 관리자 주요 기능
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <button
              key={index}
              onClick={() => window.open(`${API_BASE_URL}/admin${feature.url}`, '_blank')}
              disabled={!adminStatus.isAccessible}
              className="p-6 rounded-xl text-left transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                border: '1px solid var(--border-light)' 
              }}
              onMouseEnter={(e) => {
                if (adminStatus.isAccessible) {
                  e.currentTarget.style.borderColor = 'var(--accent-quaternary)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex items-start space-x-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'var(--accent-quaternary)', color: 'white' }}
                >
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Django 관리자 사용 가이드 */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Django 관리자 사용 가이드
        </h3>
        
        <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div>
            <strong>1. 사용자 관리:</strong><br/>
            User 모델에서 직접 사용자 권한, 역할, 개인정보를 수정할 수 있습니다.
          </div>
          
          <div>
            <strong>2. 프로젝트 데이터:</strong><br/>
            Project, Criteria, Alternative 모델의 데이터를 직접 편집하고 관리할 수 있습니다.
          </div>
          
          <div>
            <strong>3. 평가 결과:</strong><br/>
            PairwiseComparison, Evaluation 데이터를 확인하고 문제가 있는 데이터를 수정할 수 있습니다.
          </div>
          
          <div>
            <strong>4. 시스템 모니터링:</strong><br/>
            Django admin logs를 통해 시스템 활동을 추적하고 모니터링할 수 있습니다.
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-warning-pastel)' }}>
            <strong style={{ color: 'var(--accent-warning-dark)' }}>⚠️ 주의사항:</strong><br/>
            <span style={{ color: 'var(--accent-warning-dark)' }}>
              Django 관리자에서의 데이터 수정은 직접적으로 데이터베이스에 영향을 미칩니다. 
              중요한 데이터를 수정하기 전에 반드시 백업을 생성하세요.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DjangoAdminIntegration;