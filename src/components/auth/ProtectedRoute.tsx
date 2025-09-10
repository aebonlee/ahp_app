import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { userManagementService } from '../../services/userManagementService';
import { UserType } from '../../types/userTypes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: UserType;
  requiredPermission?: string;
  allowedUserTypes?: UserType[];
  requireAuth?: boolean;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType,
  requiredPermission,
  allowedUserTypes,
  requireAuth = true,
  fallbackPath = '/login'
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await userManagementService.isAuthenticated();
      setIsAuthenticated(authStatus);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <div style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          인증 상태를 확인하고 있습니다...
        </div>
      </div>
    );
  }

  const currentUser = userManagementService.getCurrentUser();
  const currentUserType = userManagementService.getUserType();

  // 인증 필요한 경우 로그인 상태 확인
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // 특정 사용자 유형 필요한 경우
  if (requiredUserType && currentUserType !== requiredUserType) {
    // 적절한 대시보드로 리다이렉트
    const defaultPath = userManagementService.getDefaultDashboardPath();
    return <Navigate to={defaultPath} replace />;
  }

  // 여러 사용자 유형 중 하나 필요한 경우
  if (allowedUserTypes && currentUserType && !allowedUserTypes.includes(currentUserType)) {
    const defaultPath = userManagementService.getDefaultDashboardPath();
    return <Navigate to={defaultPath} replace />;
  }

  // 특정 권한 필요한 경우
  if (requiredPermission && !userManagementService.hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 모든 조건 통과시 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;