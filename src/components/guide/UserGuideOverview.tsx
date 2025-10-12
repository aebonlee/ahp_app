import React, { useState } from 'react';
import Card from '../common/Card';
import Tooltip from '../common/Tooltip';
import LayerPopup from '../common/LayerPopup';
import UnifiedButton from '../common/UnifiedButton';
import HierarchyTreeVisualization from '../common/HierarchyTreeVisualization';
import { DEMO_CRITERIA, DEMO_SUB_CRITERIA, DEMO_ALTERNATIVES, DEMO_PROJECTS } from '../../data/demoData';

interface UserGuideOverviewProps {
  onNavigateToService: () => void;
}

const UserGuideOverview: React.FC<UserGuideOverviewProps> = ({ onNavigateToService }) => {
  const [activeGuide, setActiveGuide] = useState<'basic' | 'advanced'>('basic');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>('vertical');

  // 데모 데이터 조합
  const demoCriteria = [
    ...DEMO_CRITERIA.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      parent_id: c.parent_id,
      level: c.level,
      weight: c.weight
    })),
    ...DEMO_SUB_CRITERIA.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      parent_id: c.parent_id,
      level: c.level,
      weight: c.weight
    }))
  ];

  // 기초 가이드 섹션들
  const basicSections = [
    { id: 'overview', title: '시작하기', icon: '🚀' },
    { id: 'project-creation', title: '프로젝트 생성', icon: '📋' },
    { id: 'criteria-setup', title: '기준 설정', icon: '🎯' },
    { id: 'alternatives-setup', title: '대안 설정', icon: '🔀' },
    { id: 'evaluation', title: '평가 수행', icon: '⚖️' },
    { id: 'results', title: '결과 확인', icon: '📊' }
  ];

  // 고급 가이드 섹션들
  const advancedSections = [
    { id: 'overview', title: '고급 기능 개요', icon: '🎓' },
    { id: 'collaboration', title: '실시간 협업', icon: '👥' },
    { id: 'sensitivity', title: '민감도 분석', icon: '📈' },
    { id: 'export', title: '보고서 내보내기', icon: '📤' },
    { id: 'automation', title: '자동화 기능', icon: '🤖' },
    { id: 'integration', title: '외부 연동', icon: '🔗' }
  ];

  const getCurrentSections = () => {
    return activeGuide === 'basic' ? basicSections : advancedSections;
  };

  const renderBasicContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🚀 AHP 플랫폼 시작하기
              </h2>
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                이 기초 가이드는 AHP 플랫폼을 처음 사용하는 분들을 위한 <strong>단계별 입문 가이드</strong>입니다. 
                프로젝트 생성부터 결과 분석까지 전체 과정을 차근차근 따라하며 AHP 의사결정 분석을 
                쉽게 배워보세요.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🎯 학습 목표</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• AHP 프로젝트 생성 방법</li>
                    <li>• 평가 기준과 대안 설정</li>
                    <li>• 쌍대비교 평가 수행</li>
                    <li>• 결과 해석 및 활용</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>⏱️ 소요 시간</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 전체 가이드: 약 30분</li>
                    <li>• 각 단계별: 5-10분</li>
                    <li>• 실습 포함: 1시간</li>
                    <li>• 자유롭게 건너뛰기 가능</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>📋 준비사항</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 의사결정 문제 정의</li>
                    <li>• 비교할 대안들 목록</li>
                    <li>• 평가 기준 아이디어</li>
                    <li>• 약간의 집중력 😊</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'project-creation':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📋 1단계: 프로젝트 생성하기
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    🎯 프로젝트 기본 정보 입력
                  </h3>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          프로젝트명 *
                        </label>
                        <div className="p-2 border rounded" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-light)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>예: "신제품 출시 전략 선택"</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          프로젝트 설명
                        </label>
                        <div className="p-2 border rounded" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-light)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>예: "3가지 신제품 출시 전략 중 최적안 선택"</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                          평가 방식 선택
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center p-2 border rounded" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-light)' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>⚖️ 쌍대비교 (권장)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    💡 프로젝트 생성 팁
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                      <span className="text-green-500">✓</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>구체적인 프로젝트명</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>나중에 찾기 쉽도록 명확하게 작성하세요</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                      <span className="text-blue-500">ℹ️</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>쌍대비교 방식 권장</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>더 정확한 분석 결과를 얻을 수 있습니다</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
                      <span className="text-purple-500">🎯</span>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>명확한 목표 설정</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>무엇을 결정하려는지 구체적으로 명시하세요</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'criteria-setup':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎯 2단계: 평가 기준 설정하기
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📝 기준 설정 가이드
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>상위 기준 (주기준)</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 비용 효율성</li>
                        <li>• 기술적 성숙도</li>
                        <li>• 시장 적합성</li>
                        <li>• 리스크 수준</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>세부 기준 (하위기준)</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 초기 투자비용</li>
                        <li>• 운영 비용</li>
                        <li>• 기술 안정성</li>
                        <li>• 확장 가능성</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <HierarchyTreeVisualization
                    nodes={demoCriteria}
                    title="기준 계층구조 예시"
                    showWeights={true}
                    interactive={false}
                    layout={layoutMode}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'alternatives-setup':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🔀 3단계: 대안 설정하기
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎲 대안 설정 가이드
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {DEMO_ALTERNATIVES.slice(0, 3).map((alt, index) => (
                      <div key={alt.id} className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <div className="text-2xl mb-2">{index === 0 ? '🚀' : index === 1 ? '💡' : '🔧'}</div>
                        <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{alt.name}</h4>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{alt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📋 대안 설정 체크리스트
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>실현 가능한 대안들</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>상호 배타적인 선택</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>비교 가능한 수준</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <span className="text-blue-500">📊</span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>2-9개 대안 권장</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-purple-500">🎯</span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>명확한 특징 정의</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-orange-500">⚠️</span>
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>제약사항 고려</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'evaluation':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                ⚖️ 4단계: 쌍대비교 평가하기
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📊 평가 척도 가이드
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>AHP 9점 척도</h4>
                      <div className="space-y-2">
                        {[
                          { score: 9, desc: "극히 중요" },
                          { score: 7, desc: "매우 중요" },
                          { score: 5, desc: "중요" },
                          { score: 3, desc: "조금 중요" },
                          { score: 1, desc: "같음" }
                        ].map(item => (
                          <div key={item.score} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.score}</span>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>평가 예시</h4>
                      <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          <strong>질문:</strong> "비용 효율성"과 "기술 성숙도" 중 어느 것이 더 중요한가?
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <strong>답변:</strong> 비용 효율성이 조금 더 중요하다 → <span className="font-bold">3점</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    ✅ 일관성 검증
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">✅</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>CR &lt; 0.1</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>일관성 우수</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">⚠️</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>CR &lt; 0.2</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>일관성 양호</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">❌</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>CR &ge; 0.2</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>재평가 필요</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📊 5단계: 결과 확인 및 분석
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🏆 결과 해석 가이드
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-3xl mb-2">🥇</div>
                      <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>1순위</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>가중치: 0.45</p>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>최적 대안</p>
                    </div>
                    <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-3xl mb-2">🥈</div>
                      <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>2순위</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>가중치: 0.32</p>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>차선책</p>
                    </div>
                    <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-3xl mb-2">🥉</div>
                      <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>3순위</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>가중치: 0.23</p>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>대안책</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📈 추가 분석 도구
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📈</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>민감도 분석</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>가중치 변화 영향</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📊</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Excel 내보내기</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>상세 데이터</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📄</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>PDF 보고서</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>공유 및 발표</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>선택된 섹션의 내용을 준비 중입니다.</div>;
    }
  };

  const renderAdvancedContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🎓 고급 기능 활용 가이드
              </h2>
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                이 고급 가이드는 AHP 플랫폼의 <strong>전문 기능들을 심화 활용</strong>하고자 하는 분들을 위한 
                상세 매뉴얼입니다. 실시간 협업, 민감도 분석, 자동화 등 고급 기능들을 마스터하여 
                더욱 정교하고 효율적인 의사결정 분석을 수행해보세요.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🎯 고급 기능</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 실시간 다중 사용자 협업</li>
                    <li>• 민감도 및 시나리오 분석</li>
                    <li>• 고급 보고서 생성</li>
                    <li>• 자동화 및 외부 연동</li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>⏱️ 활용 수준</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 중급-고급 사용자 대상</li>
                    <li>• 대규모 프로젝트 최적화</li>
                    <li>• 조직 차원의 의사결정</li>
                    <li>• 전문 연구 및 분석</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🎁 추가 혜택</h3>
                  <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <li>• 업무 효율성 대폭 향상</li>
                    <li>• 전문 수준의 분석 역량</li>
                    <li>• 다양한 형태의 결과물</li>
                    <li>• 기업 및 연구 활용 가능</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'collaboration':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                👥 실시간 협업 기능
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🌐 다중 사용자 동시 작업
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>주요 기능</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 실시간 동기화</li>
                        <li>• 사용자 커서 추적</li>
                        <li>• 충돌 감지 및 해결</li>
                        <li>• 오프라인 모드 지원</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>활용 시나리오</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 팀 프로젝트 진행</li>
                        <li>• 원격 워크숍</li>
                        <li>• 전문가 그룹 평가</li>
                        <li>• 교육 및 실습</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    💬 협업 커뮤니케이션
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-2xl block mb-2">💬</span>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>실시간 채팅</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>즉시 소통</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-2xl block mb-2">📝</span>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>댓글 시스템</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>상세 피드백</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="text-2xl block mb-2">🔔</span>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>알림 센터</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>중요 업데이트</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'sensitivity':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📈 민감도 분석 및 시나리오 테스트
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎯 민감도 분석이란?
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    기준의 가중치가 변화할 때 최종 결과가 얼마나 민감하게 반응하는지 분석하는 기법입니다.
                    결과의 안정성과 신뢰성을 검증할 수 있습니다.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>분석 유형</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 단일 기준 가중치 변화</li>
                        <li>• 다중 기준 동시 변화</li>
                        <li>• 시나리오별 비교 분석</li>
                        <li>• 임계점 분석</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>활용 방법</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 결과의 안정성 확인</li>
                        <li>• 핵심 기준 식별</li>
                        <li>• 위험 요소 파악</li>
                        <li>• 의사결정 신뢰도 향상</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🔄 시나리오 분석 도구
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📊</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>What-If 분석</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>가상 시나리오 테스트</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📈</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>트렌드 분석</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>변화 패턴 추적</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">⚡</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>실시간 업데이트</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>즉시 결과 확인</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                📤 고급 보고서 내보내기
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📊 다양한 형식 지원
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-3xl mb-2">📊</div>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Excel</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>상세 데이터 분석</p>
                    </div>
                    <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-3xl mb-2">📄</div>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>PDF</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>전문 보고서</p>
                    </div>
                    <div className="text-center p-4 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-3xl mb-2">📺</div>
                      <p className="font-bold" style={{ color: 'var(--text-primary)' }}>PowerPoint</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>발표 자료</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🎨 맞춤형 보고서 생성
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>포함 옵션</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 프로젝트 개요 및 목적</li>
                        <li>• 방법론 설명</li>
                        <li>• 계층구조 시각화</li>
                        <li>• 결과 차트 및 그래프</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>고급 옵션</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 민감도 분석 결과</li>
                        <li>• 일관성 검증 데이터</li>
                        <li>• 평가자별 상세 분석</li>
                        <li>• 결론 및 권고사항</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'automation':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🤖 자동화 기능
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    ⚡ 워크플로우 자동화
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>자동 알림</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 평가 완료 알림</li>
                        <li>• 일관성 오류 경고</li>
                        <li>• 프로젝트 상태 업데이트</li>
                        <li>• 마감일 리마인더</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>자동 보고서</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• 정기 진행 보고서</li>
                        <li>• 완료 즉시 최종 보고서</li>
                        <li>• 맞춤형 리포트 스케줄링</li>
                        <li>• 이메일 자동 발송</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🔧 템플릿 관리
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📋</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>프로젝트 템플릿</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>재사용 가능한 구조</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">🎯</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>기준 라이브러리</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>표준 평가기준</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📊</div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>보고서 템플릿</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>일관된 형식</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integration':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                🔗 외부 시스템 연동
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    📡 API 연동
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>데이터 가져오기</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• ERP 시스템 연동</li>
                        <li>• 데이터베이스 직접 연결</li>
                        <li>• Excel/CSV 파일 임포트</li>
                        <li>• 실시간 데이터 동기화</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>결과 내보내기</h4>
                      <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <li>• BI 도구 연동</li>
                        <li>• 대시보드 자동 업데이트</li>
                        <li>• 클라우드 스토리지 저장</li>
                        <li>• 이메일 자동 발송</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🌐 클라우드 통합
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">☁️</div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Google Drive</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📁</div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>OneDrive</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">📦</div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Dropbox</p>
                    </div>
                    <div className="text-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <div className="text-2xl mb-2">🔗</div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Slack/Teams</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>선택된 섹션의 내용을 준비 중입니다.</div>;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center space-y-6 py-8">
          <div className="space-y-3">
            <h1 
              className="text-4xl lg:text-5xl font-light tracking-wide"
              style={{ 
                color: 'var(--text-primary)',
                fontFamily: "'Inter', 'Pretendard', system-ui, sans-serif"
              }}
            >
              AHP 플랫폼 
              <span 
                className="font-semibold ml-2"
                style={{ color: 'var(--accent-primary)' }}
              >
                사용자 가이드
              </span>
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <div 
                className="w-12 h-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              ></div>
              <span 
                className="text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full border"
                style={{ 
                  color: 'var(--accent-primary)',
                  borderColor: 'var(--accent-light)',
                  backgroundColor: 'var(--accent-light)'
                }}
              >
                User Guide
              </span>
              <div 
                className="w-12 h-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              ></div>
            </div>
            <p 
              className="text-lg font-light max-w-3xl mx-auto leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              기초부터 고급 기능까지, 체계적인 가이드로 AHP 전문가가 되어보세요
            </p>
          </div>
        </div>

        {/* Guide Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div 
            onClick={() => {setActiveGuide('basic'); setActiveSection('overview');}}
            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
              activeGuide === 'basic' 
                ? 'border-blue-500 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ 
              backgroundColor: activeGuide === 'basic' ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-primary)',
            }}
          >
            <div className="text-center space-y-4">
              <div className="text-6xl">🚀</div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                기초 가이드
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                AHP 플랫폼을 처음 사용하는 분들을 위한 단계별 입문 가이드
              </p>
              <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>• 프로젝트 생성부터 결과 분석까지</li>
                <li>• 실제 예제와 함께 학습</li>
                <li>• 초보자도 쉽게 따라할 수 있는 설명</li>
              </ul>
            </div>
          </div>

          <div 
            onClick={() => {setActiveGuide('advanced'); setActiveSection('overview');}}
            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
              activeGuide === 'advanced' 
                ? 'border-purple-500 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ 
              backgroundColor: activeGuide === 'advanced' ? 'rgba(147, 51, 234, 0.05)' : 'var(--bg-primary)',
            }}
          >
            <div className="text-center space-y-4">
              <div className="text-6xl">🎓</div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                고급 가이드
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                전문 기능들을 활용한 고급 분석 및 협업 기능 마스터
              </p>
              <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>• 실시간 협업 및 민감도 분석</li>
                <li>• 고급 보고서 생성 및 자동화</li>
                <li>• 대규모 프로젝트 관리 노하우</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div 
                className="p-6 rounded-xl border"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-light)'
                }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  {activeGuide === 'basic' ? '🚀 기초 가이드' : '🎓 고급 가이드'}
                </h3>
                <nav className="space-y-2">
                  {getCurrentSections().map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg flex items-center space-x-3 transition-all duration-200 ${
                        activeSection === section.id
                          ? activeGuide === 'basic'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span className="font-medium">{section.title}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <button
                    onClick={onNavigateToService}
                    className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    🚀 실제 서비스 시작하기
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div 
              className="p-8 rounded-xl border shadow-sm"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)'
              }}
            >
              {activeGuide === 'basic' ? renderBasicContent() : renderAdvancedContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuideOverview;