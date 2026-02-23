/**
 * PSDProgressMonitoringTab - 진행률 모니터링 탭 컴포넌트
 * PersonalServiceDashboard에서 분리됨
 */
import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface PSDProgressMonitoringTabProps {
  onTabChange: (tab: string) => void;
}

const PSDProgressMonitoringTab: React.FC<PSDProgressMonitoringTabProps> = ({ onTabChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold">진행률 모니터링</h3>

    {/* 3개 카드를 인라인 가로 배열 */}
    <div style={{ display: 'flex', gap: '24px', alignItems: 'stretch', width: '100%' }}>
      <div style={{ flex: '1 1 33.333%' }}>
        <Card title="전체 진행률">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">-</div>
            <div className="text-sm text-gray-500 mt-1">등록된 평가자 없음</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-gray-300 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ flex: '1 1 33.333%' }}>
        <Card title="평균 소요 시간">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">-</div>
            <div className="text-sm text-gray-500 mt-1">데이터 없음</div>
            <div className="text-xs text-gray-500 mt-2">평가 진행 후 확인 가능</div>
          </div>
        </Card>
      </div>

      <div style={{ flex: '1 1 33.333%' }}>
        <Card title="일관성 품질">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">-</div>
            <div className="text-sm text-gray-500 mt-1">데이터 없음</div>
            <div className="text-xs text-gray-500 mt-2">평가 완료 후 확인 가능</div>
          </div>
        </Card>
      </div>
    </div>

    <Card title="평가자별 진행 현황">
      {/* 빈 상태 메시지 */}
      <div className="text-center py-12">
        <div className="text-4xl mb-4">👥</div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">등록된 평가자가 없습니다</h4>
        <p className="text-gray-500 mb-6">프로젝트에 평가자를 추가하여 진행률을 모니터링하세요</p>
        <Button
          variant="primary"
          onClick={() => onTabChange('evaluators')}
        >
          평가자 추가하기
        </Button>
      </div>
    </Card>
  </div>
);

export default React.memo(PSDProgressMonitoringTab);
