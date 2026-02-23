/**
 * PSDExportFullPage - 보고서 내보내기 전체 화면 래퍼
 * PersonalServiceDashboard에서 분리됨
 */
import React from 'react';
import Button from '../common/Button';
import PSDExportTab from './PSDExportTab';
import type { UserProject } from '../../types';

interface ProjectDataState {
  criteria: unknown[];
  alternatives: unknown[];
  results: unknown[];
}

interface PSDExportFullPageProps {
  selectedProjectId: string;
  projects: UserProject[];
  projectData: ProjectDataState | null;
  onTabChange: (tab: string) => void;
  showActionMessage: (type: 'success' | 'error' | 'info', text: string) => void;
}

const PSDExportFullPage: React.FC<PSDExportFullPageProps> = (props) => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => props.onTabChange('dashboard')}
                className="mr-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl"
              >
                ←
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <span className="text-4xl mr-3">📤</span>
                  보고서 내보내기
                </h1>
                <p className="text-gray-600 mt-2">분석 결과를 다양한 형태로 내보냅니다</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={() => props.onTabChange('analysis')}>
                📊 결과 분석
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PSDExportTab {...props} />
    </div>
  </div>
);

export default React.memo(PSDExportFullPage);
