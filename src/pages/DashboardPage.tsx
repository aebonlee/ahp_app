// =============================================================================
// AHP Enterprise Platform - Dashboard Page (3차 개발)
// =============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  FolderIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';
import useProjectStore from '../store/projectStore';
import useUIStore from '../store/uiStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { projects, isLoading, fetchProjects } = useProjectStore();
  const { showToast } = useUIStore();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingEvaluations: 0
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (projects) {
      setStats({
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        pendingEvaluations: projects.filter(p => p.status === 'pending').length
      });
    }
  }, [projects]);

  if (isLoading) {
    return <LoadingSpinner message="대시보드 로딩 중..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm">
        <div className="px-6 py-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            안녕하세요, {user?.name || user?.email}님! 👋
          </h1>
          <p className="text-blue-100">
            AHP Enterprise Platform 3차 개발 버전 대시보드입니다.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <FolderIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">전체 프로젝트</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">완료된 프로젝트</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completedProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">진행 중</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">대기 중</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pendingEvaluations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">빠른 작업</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/projects/create"
              className="group relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    새 프로젝트
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    AHP 프로젝트를 생성하여 의사결정을 시작하세요
                  </p>
                </div>
                <PlusIcon className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
            </Link>

            <Link
              to="/projects"
              className="group relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    프로젝트 관리
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    기존 프로젝트를 확인하고 관리하세요
                  </p>
                </div>
                <FolderIcon className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
              </div>
            </Link>

            <Link
              to="/analysis"
              className="group relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    AHP 분석
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    쌍대비교를 통한 계층분석법 수행
                  </p>
                </div>
                <CalculatorIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
            </Link>

            <Link
              to="/reports"
              className="group relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    결과 리포트
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    분석 결과를 확인하고 내보내기
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">최근 프로젝트</h2>
            <Link
              to="/projects"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              모두 보기 →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {projects && projects.length > 0 ? (
            <div className="space-y-4">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <FolderIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {project.description || '설명 없음'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : project.status === 'active'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {project.status === 'completed' ? '완료' : project.status === 'active' ? '진행중' : '대기'}
                    </span>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      보기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">프로젝트가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                새 프로젝트를 만들어 AHP 분석을 시작해보세요.
              </p>
              <div className="mt-6">
                <Link
                  to="/projects/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  새 프로젝트 만들기
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;