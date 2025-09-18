// =============================================================================
// AHP Enterprise Platform - Header Component (3차 개발)
// =============================================================================

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bars3Icon, BellIcon, UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, darkMode, toggleDarkMode, showToast } = useUIStore();

  const handleLogout = async () => {
    try {
      await logout();
      showToast('로그아웃되었습니다.', 'success');
      navigate('/');
    } catch (error) {
      showToast('로그아웃 중 오류가 발생했습니다.', 'error');
    }
  };


  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={sidebarCollapsed ? '사이드바 확장' : '사이드바 축소'}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          {/* Logo & Title */}
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AHP</span>
              </div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                AHP Enterprise Platform
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                3차 개발 버전
              </p>
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <UserCircleIcon className="w-6 h-6" />
              <span className="hidden md:block text-sm font-medium">
                {user?.name || user?.email || '사용자'}
              </span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || '사용자'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserCircleIcon className="w-4 h-4 mr-2" />
                프로필 설정
              </Link>
              
              <Link
                to="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Cog6ToothIcon className="w-4 h-4 mr-2" />
                설정
              </Link>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;