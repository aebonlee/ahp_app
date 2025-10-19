import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { aiDevelopmentCriteria, aiDevelopmentAlternatives, ahpAnalysisResult } from '../../data/ai-development-example';

const ExampleGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'criteria' | 'alternatives' | 'analysis'>('overview');

  return (
    <div className="py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            💡 AHP 의사결정 분석 예시
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI 개발 도구 선택을 위한 실제 AHP 분석 사례를 통해 
            의사결정 과정을 체험해보세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
            {[
              { id: 'overview', label: '개요', icon: '📋' },
              { id: 'criteria', label: '평가 기준', icon: '🎯' },
              { id: 'alternatives', label: '대안 비교', icon: '⚖️' },
              { id: 'analysis', label: '분석 결과', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="🎯 의사결정 목표">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    최적의 AI 개발 도구 선택
                  </h4>
                  <p className="text-gray-600">
                    개발 팀의 생산성을 극대화하고 코드 품질을 향상시킬 수 있는 
                    AI 코딩 어시스턴트 도구를 선택하기 위한 체계적인 분석
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">주요 고려사항</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 개발 속도 향상</li>
                      <li>• 코드 품질 개선</li>
                      <li>• 학습 곡선</li>
                      <li>• 팀 협업 지원</li>
                      <li>• 비용 대비 효과</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card title="📊 AHP 방법론">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">
                    계층적 분석 과정 (AHP)
                  </h4>
                  <p className="text-gray-600">
                    복잡한 의사결정을 체계적으로 분해하여 정량적으로 평가하는 
                    과학적 의사결정 방법론
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 rounded-full p-2 text-blue-600 font-bold text-sm">1</div>
                      <div>
                        <h5 className="font-medium">계층 구조 설정</h5>
                        <p className="text-sm text-gray-600">목표, 기준, 대안으로 구조화</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 rounded-full p-2 text-blue-600 font-bold text-sm">2</div>
                      <div>
                        <h5 className="font-medium">쌍대 비교</h5>
                        <p className="text-sm text-gray-600">요소들을 1:1로 비교 평가</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 rounded-full p-2 text-blue-600 font-bold text-sm">3</div>
                      <div>
                        <h5 className="font-medium">종합 분석</h5>
                        <p className="text-sm text-gray-600">가중치 계산 및 우선순위 도출</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="space-y-6">
              <Card title="평가 기준 및 가중치">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          카테고리
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          평가 기준
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          설명
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          가중치
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {aiDevelopmentCriteria.map((criterion) => (
                        <tr key={criterion.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {criterion.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {criterion.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {criterion.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {((criterion.weight || 0) * 100).toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="📊 가중치 분포">
                  <div className="space-y-3">
                    {aiDevelopmentCriteria.map((criterion) => (
                      <div key={criterion.id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{criterion.name}</span>
                          <span className="text-sm text-gray-600">
                            {((criterion.weight || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(criterion.weight || 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="✅ 일관성 검증">
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      CR = 0.058
                    </div>
                    <p className="text-gray-600 mb-4">일관성 비율</p>
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                      <span className="mr-2">✅</span>
                      <span className="font-medium">우수 (CR &lt; 0.1)</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      일관성 비율이 0.1 미만으로 평가의 논리적 일관성이 확보되었습니다
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'alternatives' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {aiDevelopmentAlternatives.map((alt) => (
                  <Card key={alt.id} title={alt.name}>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">{alt.company}</div>
                      <p className="text-sm">{alt.description}</p>
                      <div className="pt-3 border-t">
                        <h5 className="font-medium text-sm mb-2">주요 기능</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {alt.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-3 border-t">
                        <span className="text-sm font-medium text-blue-600">
                          {alt.pricing}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card title="📊 대안별 평가 점수">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AI 도구
                        </th>
                        {aiDevelopmentCriteria.map((criterion) => (
                          <th key={criterion.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {criterion.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {aiDevelopmentAlternatives.map((alt) => (
                        <tr key={alt.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {alt.name}
                          </td>
                          {aiDevelopmentCriteria.map((criterion) => (
                            <td key={criterion.id} className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="relative">
                                <div className="w-16 h-16 mx-auto">
                                  <svg className="transform -rotate-90 w-16 h-16">
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="28"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      fill="none"
                                      className="text-gray-200"
                                    />
                                    <circle
                                      cx="32"
                                      cy="32"
                                      r="28"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      fill="none"
                                      strokeDasharray={`${(alt.scores?.[criterion.id] || 0) * 176} 176`}
                                      className="text-blue-600"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-semibold">
                                      {((alt.scores?.[criterion.id] || 0) * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="🏆 최종 순위">
                  <div className="space-y-3">
                    {ahpAnalysisResult.finalScores.map((item) => (
                      <div key={item.rank} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            item.rank === 1 ? 'bg-yellow-500' :
                            item.rank === 2 ? 'bg-gray-400' :
                            item.rank === 3 ? 'bg-orange-500' :
                            'bg-blue-500'
                          }`}>
                            {item.rank}
                          </div>
                          <div>
                            <div className="font-semibold">{item.name}</div>
                            <div className="text-sm text-gray-600">종합 점수</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {(item.score * 100).toFixed(1)}%
                          </div>
                          <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${item.score * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="💡 분석 인사이트">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">1위: Claude Code</h5>
                      <p className="text-sm text-gray-700">
                        파일 시스템 직접 접근과 프로젝트 전체 이해 능력으로 
                        코딩 작성 속도와 코드 품질 개선에서 최고 점수
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">2위: GitHub Copilot</h5>
                      <p className="text-sm text-gray-700">
                        IDE 실시간 통합과 우수한 자동 완성 기능으로 
                        균형잡힌 성능 제공
                      </p>
                    </div>
                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-2">주요 차별화 요소</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 파일 시스템 접근 권한</li>
                        <li>• 프로젝트 컨텍스트 이해도</li>
                        <li>• 가격 대비 기능성</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>

              <Card title="📈 민감도 분석">
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">안정적인 결과:</span> 
                    평가 기준 가중치를 ±20% 변경해도 상위 2개 도구의 순위는 변하지 않아 
                    의사결정의 안정성이 확보되었습니다.
                  </p>
                </div>
                <div className="text-center py-4">
                  <Button variant="primary">
                    📥 전체 분석 보고서 다운로드
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* CTA 섹션 */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              지금 바로 여러분의 의사결정을 시작하세요!
            </h3>
            <p className="mb-6 text-blue-100">
              복잡한 의사결정도 AHP 방법론으로 체계적이고 과학적으로 해결할 수 있습니다
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="secondary" size="lg">
                무료 체험하기
              </Button>
              <Button variant="primary" size="lg">
                서비스 시작하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleGuide;