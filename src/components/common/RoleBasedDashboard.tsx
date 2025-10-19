/**
 * 역할별 대시보드 라우터
 * 사용자 역할에 따라 적절한 대시보드 컴포넌트를 렌더링
 */

import React from 'react';
import { User, UserRole } from '../../types';
import PersonalUserDashboard from '../user/PersonalUserDashboard';
import EvaluatorOnlyDashboard from '../evaluator/EvaluatorOnlyDashboard';
import AdminOnlyDashboard from '../admin/AdminOnlyDashboard';
import PersonalServiceDashboard from '../admin/PersonalServiceDashboard';

interface RoleBasedDashboardProps {
  user: User;
  onTabChange: (tab: string) => void;
  viewMode?: 'service' | 'evaluator';
}

const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ 
  user, 
  onTabChange, 
  viewMode = 'service' 
}) => {
  
  // 역할별 대시보드 결정 로직
  const getDashboardComponent = () => {
    const role: UserRole = user.role;
    
    switch (role) {
      case 'super_admin':
        // 슈퍼 관리자는 관리자 대시보드
        return <AdminOnlyDashboard user={user} onTabChange={onTabChange} />;
        
      case 'service_admin':
        // 서비스 관리자는 관리자 대시보드
        return <AdminOnlyDashboard user={user} onTabChange={onTabChange} />;
        
      case 'service_user':
        // 서비스 사용자는 viewMode에 따라 결정
        if (viewMode === 'evaluator') {
          // 평가자 모드로 전환된 경우
          return <EvaluatorOnlyDashboard user={user} onTabChange={onTabChange} />;
        } else {
          // 기본 개인 서비스 대시보드
          return <PersonalUserDashboard user={user} onTabChange={onTabChange} />;
        }
        
      case 'evaluator':
        // 평가자 전용 대시보드
        return <EvaluatorOnlyDashboard user={user} onTabChange={onTabChange} />;
        
      default:
        // 기본값: 개인 서비스 대시보드
        return <PersonalUserDashboard user={user} onTabChange={onTabChange} />;
    }
  };

  // 대시보드 타이틀 결정
  const getDashboardTitle = () => {
    const role: UserRole = user.role;
    
    switch (role) {
      case 'super_admin':
        return '슈퍼 관리자 대시보드';
      case 'service_admin':
        return '서비스 관리자 대시보드';
      case 'service_user':
        return viewMode === 'evaluator' ? '평가자 모드 대시보드' : '개인 서비스 대시보드';
      case 'evaluator':
        return '평가자 전용 대시보드';
      default:
        return '사용자 대시보드';
    }
  };

  // 역할별 권한 체크
  const hasAdminAccess = () => {
    return user.role === 'super_admin' || user.role === 'service_admin';
  };

  const canSwitchModes = () => {
    return user.role === 'service_user';
  };

  const isEvaluatorRole = () => {
    return user.role === 'evaluator' || (user.role === 'service_user' && viewMode === 'evaluator');
  };

  return (
    <div className="space-y-6">
      {/* 대시보드 헤더 (디버그용, 나중에 제거 가능) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }}>
          <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-muted)' }}>
            <div>
              <strong>현재 대시보드:</strong> {getDashboardTitle()}
            </div>
            <div>
              <strong>사용자 역할:</strong> {user.role} 
              {viewMode && ` (${viewMode} 모드)`}
            </div>
            <div className="space-x-2">
              {hasAdminAccess() && (
                <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
                  관리자 권한
                </span>
              )}
              {canSwitchModes() && (
                <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--accent-secondary)', color: 'white' }}>
                  모드 전환 가능
                </span>
              )}
              {isEvaluatorRole() && (
                <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--accent-tertiary)', color: 'white' }}>
                  평가자 기능
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 실제 대시보드 컴포넌트 렌더링 */}
      {getDashboardComponent()}
    </div>
  );
};

export default RoleBasedDashboard;