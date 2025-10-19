import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import {
  ChartBarIcon,
  BeakerIcon,
  UsersIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../../../services/api';
import SensitivityAnalysisPanel from './SensitivityAnalysisPanel';
import GroupConsensusPanel from './GroupConsensusPanel';
import MonteCarloSimulation from './MonteCarloSimulation';
import ComprehensiveReport from './ComprehensiveReport';

interface Project {
  id: number;
  title: string;
  description: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const AdvancedAnalysisDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const tabs = [
    { name: '민감도 분석', icon: ChartBarIcon, description: '가중치 변화에 대한 결과 안정성 분석' },
    { name: '그룹 합의 분석', icon: UsersIcon, description: '평가자 간 의견 일치도 및 통합' },
    { name: '몬테카를로 시뮬레이션', icon: BeakerIcon, description: '불확실성 하의 신뢰도 검증' },
    { name: '종합 보고서', icon: DocumentTextIcon, description: '전체 분석 결과 종합' },
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
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
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
                고급 분석 보고서
              </h1>
              <p className="mt-2 text-gray-600">{project.title}</p>
              <p className="mt-1 text-sm text-gray-500">
                통계적 분석과 시뮬레이션을 통한 의사결정 신뢰도 검증
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gradient-to-r from-primary/10 to-tertiary/10 
                             text-primary text-sm font-medium rounded-full">
                Advanced Analysis
              </span>
            </div>
          </div>
        </div>

        {/* Analysis Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {tabs.map((tab, index) => (
            <div
              key={tab.name}
              className={classNames(
                "bg-white rounded-xl p-4 cursor-pointer transition-all duration-200",
                selectedTab === index
                  ? "shadow-lg ring-2 ring-primary ring-opacity-50 transform scale-105"
                  : "shadow-card hover:shadow-md"
              )}
              onClick={() => setSelectedTab(index)}
            >
              <div className="flex items-center justify-between mb-2">
                <tab.icon className={classNames(
                  "h-8 w-8",
                  selectedTab === index ? "text-primary" : "text-gray-400"
                )} />
                <span className={classNames(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  selectedTab === index 
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-100 text-gray-600"
                )}>
                  {index === 0 && "Sensitivity"}
                  {index === 1 && "Consensus"}
                  {index === 2 && "Monte Carlo"}
                  {index === 3 && "Report"}
                </span>
              </div>
              <h3 className={classNames(
                "font-semibold text-sm mb-1",
                selectedTab === index ? "text-gray-900" : "text-gray-700"
              )}>
                {tab.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                {tab.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="hidden">
            {tabs.map((tab) => (
              <Tab key={tab.name}>{tab.name}</Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <SensitivityAnalysisPanel projectId={parseInt(projectId!)} />
            </Tab.Panel>

            <Tab.Panel>
              <GroupConsensusPanel projectId={parseInt(projectId!)} />
            </Tab.Panel>

            <Tab.Panel>
              <MonteCarloSimulation projectId={parseInt(projectId!)} />
            </Tab.Panel>

            <Tab.Panel>
              <ComprehensiveReport projectId={parseInt(projectId!)} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Analysis Status */}
        <div className="mt-6 bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">분석 상태</h3>
            <button
              onClick={loadProject}
              className="btn btn-ghost"
            >
              <ArrowPathIcon className="h-5 w-5" />
              새로고침
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-sm text-green-700">데이터 신뢰도</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0.08</div>
              <div className="text-sm text-blue-700">일관성 비율</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">12</div>
              <div className="text-sm text-purple-700">평가자 수</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">높음</div>
              <div className="text-sm text-orange-700">전체 안정성</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-tertiary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">분석 준비 완료</p>
                <p className="text-xs text-gray-600 mt-1">
                  모든 평가 데이터가 수집되었으며, 고급 분석을 수행할 준비가 되었습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalysisDashboard;