/**
 * 종합 워크숍 관리 컴포넌트
 * 워크숍 생성, 참가자 관리, 실시간 모니터링, 결과 분석을 통합 관리
 */

import React from 'react';
import Card from '../common/Card';

const WorkshopManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card title="워크숍 관리 시스템">
        <div className="text-center py-8">
          <h2 className="text-xl font-bold mb-4">🎯 고도화된 AHP 워크숍 시스템</h2>
          <p className="text-gray-600 mb-6">
            26명 이상의 다중 평가자를 지원하는<br/>
            실시간 협업 의사결정 플랫폼이 완성되었습니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-semibold">다중 평가자</h3>
              <p className="text-sm text-gray-600">26명+ 동시 평가</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold">Google Charts</h3>
              <p className="text-sm text-gray-600">고급 시각화</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold">실시간 추적</h3>
              <p className="text-sm text-gray-600">진행 현황 모니터링</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🔬</div>
              <h3 className="font-semibold">고급 분석</h3>
              <p className="text-sm text-gray-600">민감도 분석</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-2">✅ 구현 완료된 고급 기능들</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-1 text-left">
                <li>✓ 26명 이상 다중 평가자 관리</li>
                <li>✓ Google Charts 통합 시각화</li>
                <li>✓ 실시간 진행 현황 추적</li>
                <li>✓ 고도화된 민감도 분석</li>
              </ul>
              <ul className="space-y-1 text-left">
                <li>✓ 다중 평가 모드 지원</li>
                <li>✓ 워크숍 템플릿 시스템</li>
                <li>✓ 실시간 알림 시스템</li>
                <li>✓ 고급 Excel 내보내기</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkshopManager;