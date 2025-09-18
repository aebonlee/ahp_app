// =============================================================================
// AHP Enterprise Platform - Sidebar Component (3차 개발)
// =============================================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  FolderIcon, 
  PlusIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  Cog6ToothIcon,
  DocumentTextIcon,
  CalculatorIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarCollapsed } = useUIStore();
  const { user } = useAuthStore();

  const navigation: NavigationItem[] = [
    { name: '대시보드', href: '/dashboard', icon: HomeIcon },
    { name: '프로젝트', href: '/projects', icon: FolderIcon },
    { name: '새 프로젝트', href: '/projects/create', icon: PlusIcon },
    { name: 'AHP 분석', href: '/analysis', icon: CalculatorIcon },
    { name: '결과 리포트', href: '/reports', icon: ChartBarIcon },
    { name: '평가자 관리', href: '/evaluators', icon: UserGroupIcon },
    { name: '가이드', href: '/guide', icon: DocumentTextIcon },
    { name: '설정', href: '/settings', icon: Cog6ToothIcon },
  ];

  // Set current navigation item based on location
  const navigationWithCurrent = navigation.map(item => ({
    ...item,
    current: location.pathname === item.href || location.pathname.startsWith(item.href + '/')
  }));

  const classNames = (...classes: (string | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className={classNames(
      'fixed inset-y-0 left-0 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )} style={{ top: '4rem' }}>
      {/* Header */}
      {!sidebarCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            메뉴
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.name || '사용자'}님 환영합니다
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navigationWithCurrent.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={classNames(
                item.current
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-200'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
                'group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors duration-200'
              )}
            >
              <Icon
                className={classNames(
                  item.current
                    ? 'text-blue-500 dark:text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
                  'flex-shrink-0 h-5 w-5 transition-colors duration-200',
                  sidebarCollapsed ? '' : 'mr-3'
                )}
              />
              {!sidebarCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center space-y-2">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              AHP Enterprise Platform
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              3차 개발 버전 v3.0.0
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              © 2024 AHP Platform
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;