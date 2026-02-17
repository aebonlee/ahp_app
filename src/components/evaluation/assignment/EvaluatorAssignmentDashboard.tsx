/**
 * EvaluatorAssignmentDashboard - 평가자 배정 관리 대시보드 (Phase 2a 업데이트)
 * - react-router-dom 제거 (projectId prop으로 대체)
 * - EvaluatorInvitationManager 탭 추가
 * - 실시간 stats 연동
 */

import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import {
  UsersIcon,
  EnvelopeIcon,
  ChartBarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import api from '../../../services/api';
import InviteEvaluators from './InviteEvaluators';
import ProgressTracker from './ProgressTracker';
import EmailTemplateManager from './EmailTemplateManager';
import InvitationHistory from './InvitationHistory';
import EvaluatorInvitationManager from './EvaluatorInvitationManager';
import { useEvaluatorInvite } from '../../../hooks/useEvaluatorInvite';

interface Project {
  id: number;
  title: string;
  description: string;
  deadline?: string;
}

interface EvaluatorAssignmentDashboardProps {
  projectId?: string | number;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const EvaluatorAssignmentDashboard: React.FC<EvaluatorAssignmentDashboardProps> = ({
  projectId: projectIdProp,
}) => {
  const resolvedProjectId = String(projectIdProp || '');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const { stats, fetchInvitations } = useEvaluatorInvite();

  const tabs = [
    { name: '평가자 초대', icon: EnvelopeIcon },
    { name: '초대 관리', icon: ClipboardDocumentListIcon },
    { name: '진행 현황', icon: ChartBarIcon },
    { name: '이메일 템플릿', icon: UsersIcon },
    { name: '초대 기록', icon: ArrowPathIcon },
  ];

  useEffect(() => {
    if (resolvedProjectId) {
      loadProject();
      fetchInvitations(resolvedProjectId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedProjectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${resolvedProjectId}/`);
      setProject(response.data);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchInvitations(resolvedProjectId);
  };

  if (!resolvedProjectId) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">프로젝트를 선택하세요.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">평가자 배정 관리</h1>
              {project && (
                <p className="mt-2 text-gray-600">{project.title}</p>
              )}
              {project?.deadline && (
                <p className="text-sm text-gray-500 mt-1">
                  마감일: {new Date(project.deadline).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
              새로고침
            </button>
          </div>
        </div>

        {/* Stats Summary - 실시간 데이터 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">총 초대</p>
                <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">수락됨</p>
                <p className="text-2xl font-bold text-green-600">{stats?.accepted ?? 0}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">대기중</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pending ?? 0}</p>
              </div>
              <ArrowPathIcon className="h-8 w-8 text-yellow-400 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">거절/만료</p>
                <p className="text-2xl font-bold text-red-600">
                  {(stats?.declined ?? 0) + (stats?.expired ?? 0)}
                </p>
              </div>
              <ExclamationCircleIcon className="h-8 w-8 text-red-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-2xl bg-white p-1 shadow-sm border border-gray-100 mb-6">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-xl py-3 text-sm font-medium leading-5',
                    'focus:outline-none transition-all duration-200',
                    selected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </div>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {/* 탭 0: 평가자 초대 */}
            <Tab.Panel>
              <InviteEvaluators
                projectId={resolvedProjectId}
                onSuccess={handleRefresh}
              />
            </Tab.Panel>

            {/* 탭 1: 초대 관리 (Phase 2a 신규) */}
            <Tab.Panel>
              <EvaluatorInvitationManager projectId={resolvedProjectId} />
            </Tab.Panel>

            {/* 탭 2: 진행 현황 */}
            <Tab.Panel>
              <ProgressTracker
                projectId={parseInt(resolvedProjectId)}
                refreshKey={refreshKey}
              />
            </Tab.Panel>

            {/* 탭 3: 이메일 템플릿 */}
            <Tab.Panel>
              <EmailTemplateManager projectId={parseInt(resolvedProjectId)} />
            </Tab.Panel>

            {/* 탭 4: 초대 기록 */}
            <Tab.Panel>
              <InvitationHistory
                projectId={parseInt(resolvedProjectId)}
                refreshKey={refreshKey}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default EvaluatorAssignmentDashboard;
