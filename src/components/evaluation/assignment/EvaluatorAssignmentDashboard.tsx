import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { 
  UsersIcon, 
  EnvelopeIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../../services/api';
import InviteEvaluators from './InviteEvaluators';
import ProgressTracker from './ProgressTracker';
import EmailTemplateManager from './EmailTemplateManager';
import InvitationHistory from './InvitationHistory';

interface Project {
  id: number;
  title: string;
  description: string;
  deadline: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const EvaluatorAssignmentDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const tabs = [
    { name: '평가자 초대', icon: EnvelopeIcon },
    { name: '진행 현황', icon: ChartBarIcon },
    { name: '이메일 템플릿', icon: UsersIcon },
    { name: '초대 기록', icon: ArrowPathIcon },
  ];

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${projectId}/`);
      setProject(response.data);
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-500">프로젝트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
                평가자 배정 관리
              </h1>
              <p className="mt-2 text-gray-600">{project.title}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-sm text-gray-500">
                  마감일: {new Date(project.deadline).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="btn btn-ghost"
            >
              <ArrowPathIcon className="h-5 w-5" />
              새로고침
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-2xl bg-white p-1 shadow-card mb-6">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-xl py-3 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary/10 focus:outline-none focus:ring-2',
                    'transition-all duration-200',
                    selected
                      ? 'bg-gradient-to-r from-primary to-tertiary text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <tab.icon className="h-5 w-5" />
                  {tab.name}
                </div>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <InviteEvaluators 
                projectId={parseInt(projectId!)} 
                onSuccess={handleRefresh}
              />
            </Tab.Panel>

            <Tab.Panel>
              <ProgressTracker 
                projectId={parseInt(projectId!)} 
                refreshKey={refreshKey}
              />
            </Tab.Panel>

            <Tab.Panel>
              <EmailTemplateManager 
                projectId={parseInt(projectId!)}
              />
            </Tab.Panel>

            <Tab.Panel>
              <InvitationHistory 
                projectId={parseInt(projectId!)} 
                refreshKey={refreshKey}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">총 평가자</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <UsersIcon className="h-8 w-8 text-primary opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">완료</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">진행중</p>
                <p className="text-2xl font-bold text-yellow-600">0</p>
              </div>
              <ArrowPathIcon className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">대기중</p>
                <p className="text-2xl font-bold text-gray-600">0</p>
              </div>
              <ExclamationCircleIcon className="h-8 w-8 text-gray-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluatorAssignmentDashboard;