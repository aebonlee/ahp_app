/**
 * PSDResultsAnalysisTab - 결과 분석 탭 컴포넌트
 * PersonalServiceDashboard에서 분리됨
 */
import React from 'react';
import Card from '../common/Card';

const PSDResultsAnalysisTab: React.FC = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold">결과 분석</h3>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="최종 순위">
        <div className="space-y-3">
          {[
            { rank: 1, name: '코딩 작성 속도 향상', weight: 16.959, color: 'text-yellow-600' },
            { rank: 2, name: '코드 품질 개선 및 최적화', weight: 15.672, color: 'text-gray-500' },
            { rank: 3, name: '반복 작업 최소화', weight: 13.382, color: 'text-orange-600' },
            { rank: 4, name: '형상관리 및 배포 지원', weight: 11.591, color: 'text-blue-600' },
            { rank: 5, name: '디버깅 시간 단축', weight: 10.044, color: 'text-green-600' }
          ].map((item) => (
            <div key={item.rank} className="flex justify-between items-center p-3 border rounded">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                  item.rank === 1 ? 'bg-yellow-500' :
                  item.rank === 2 ? 'bg-gray-500' :
                  item.rank === 3 ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  {item.rank}
                </div>
                <div className="font-medium">{item.name}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">{item.weight}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="일관성 분석">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">0.00192</div>
            <div className="text-sm text-gray-500">통합 일관성 비율</div>
            <div className="text-xs text-green-600 mt-1">🟢 매우 우수 (&lt; 0.1)</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">기준 일관성</span>
              <span className="text-sm font-medium text-green-600">0.001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">대안 일관성 (평균)</span>
              <span className="text-sm font-medium text-green-600">0.003</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">전체 평가자</span>
              <span className="text-sm font-medium">26명</span>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <Card title="민감도 분석">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">기준 가중치 변화 시뮬레이션</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">개발 생산성 효율화</span>
              <input type="range" min="0" max="100" defaultValue="40" className="w-24" />
              <span className="text-sm font-medium w-12 text-right">40%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">코딩 실무 품질 적합화</span>
              <input type="range" min="0" max="100" defaultValue="30" className="w-24" />
              <span className="text-sm font-medium w-12 text-right">30%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">개발 프로세스 자동화</span>
              <input type="range" min="0" max="100" defaultValue="30" className="w-24" />
              <span className="text-sm font-medium w-12 text-right">30%</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-3">예상 순위 변화</h4>
          <div className="text-sm text-gray-600">
            <p>• 현재 설정에서는 순위 변화 없음</p>
            <p>• 생산성 가중치 20% 감소 시: 2위↔3위 변동 가능</p>
            <p>• 품질 가중치 50% 증가 시: 1위↔2위 변동 가능</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

export default React.memo(PSDResultsAnalysisTab);
