import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserType, BaseUser } from '../../types/userTypes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: UserType;
  requiredPermission?: string;
  allowedUserTypes?: UserType[];
  requireAuth?: boolean;
  fallbackPath?: string;
  currentUser?: BaseUser | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredUserType,
  requiredPermission,
  allowedUserTypes,
  requireAuth = true,
  fallbackPath = '/login',
  currentUser
}) => {
  // Helper function to get default dashboard path
  const getDefaultDashboardPath = (user: BaseUser | null): string => {
    if (!user) return '/login';
    
    switch (user.user_type) {
      case 'admin':
        // 관리자도 개인서비스 대시보드를 사용 (모든 기능 접근 가능)
        return '/personal';
      case 'personal_service_user':
        return '/personal';
      case 'evaluator':
        return '/evaluator';
      default:
        return '/personal';
    }
  };

  // 더 엄격한 인증 검증
  const isAuthenticated = !!(currentUser && 
    currentUser.username && 
    currentUser.user_type && 
    currentUser.id);
  const currentUserType = currentUser?.user_type;
  const isSuperAdmin = currentUser?.user_type === 'admin';

  // 인증 확인 (로그인 후에는 세션 유지)
  console.log('🛡️ ProtectedRoute 접근 시도:', { 
    requireAuth, 
    isAuthenticated, 
    currentUserType,
    requiredUserType,
    userId: currentUser?.id,
    username: currentUser?.username
  });
  
  if (requireAuth && !isAuthenticated) {
    console.log('🚫 인증되지 않은 접근 - 로그인 페이지로 리다이렉트');
    return <Navigate to="/login" replace />;
  }

  // 최고관리자는 모든 대시보드에 접근 가능
  if (isSuperAdmin) {
    console.log('✅ 관리자 권한으로 모든 페이지 접근 허용');
    return <>{children}</>;
  }

  // 특정 사용자 유형 필요한 경우
  if (requiredUserType && currentUserType !== requiredUserType) {
    console.log(`🚫 권한 불일치 - 필요: ${requiredUserType}, 현재: ${currentUserType}`);
    // 적절한 대시보드로 리다이렉트
    const defaultPath = getDefaultDashboardPath(currentUser || null);
    console.log(`🔄 권한에 맞는 대시보드로 리다이렉트: ${defaultPath}`);
    return <Navigate to={defaultPath} replace />;
  }

  // 여러 사용자 유형 중 하나 필요한 경우
  if (allowedUserTypes && currentUserType && !allowedUserTypes.includes(currentUserType)) {
    const defaultPath = getDefaultDashboardPath(currentUser || null);
    return <Navigate to={defaultPath} replace />;
  }

  // 모든 조건 통과시 렌더링
  console.log('✅ 모든 권한 검사 통과 - 페이지 렌더링 허용');
  return <>{children}</>;
};

export default ProtectedRoute;