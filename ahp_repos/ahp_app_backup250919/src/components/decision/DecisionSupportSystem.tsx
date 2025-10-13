import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface DecisionProblem {
  id: string;
  title: string;
  description: string;
  objective: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  stakeholders: Stakeholder[];
  constraints: Constraint[];
  riskFactors: RiskFactor[];
  timeframe: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

interface Criterion {
  id: string;
  name: string;
  description: string;
  type: 'quantitative' | 'qualitative';
  unit?: string;
  weight?: number;
  subcriteria?: Criterion[];
}

interface Alternative {
  id: string;
  name: string;
  description: string;
  feasibility: number; // 0-1
  cost: number;
  riskLevel: 'low' | 'medium' | 'high';
  implementationTime: number; // 월
  expectedBenefit: number; // 0-1
}

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  influence: number; // 0-1
  interest: number; // 0-1
  expertise: string[];
}

interface Constraint {
  id: string;
  type: 'budget' | 'time' | 'resource' | 'regulatory' | 'technical';
  description: string;
  impact: 'low' | 'medium' | 'high';
  mitigation?: string;
}

interface RiskFactor {
  id: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 0-1
  mitigation: string;
  owner: string;
}

interface DecisionSupportSystemProps {
  className?: string;
}

const DecisionSupportSystem: React.FC<DecisionSupportSystemProps> = ({ className = '' }) => {
  const [currentProblem, setCurrentProblem] = useState<DecisionProblem | null>(null);
  const [activeStep, setActiveStep] = useState<'definition' | 'structuring' | 'evaluation' | 'analysis' | 'validation'>('definition');
  const [problemFormData, setProblemFormData] = useState({
    title: '',
    description: '',
    objective: '',
    timeframe: '',
    importance: 'medium' as const
  });

  useEffect(() => {
    // 샘플 의사결정 문제 로드
    const sampleProblem: DecisionProblem = {
      id: 'dp1',
      title: '신기술 도입 우선순위 결정',
      description: '회사의 디지털 전환을 위한 신기술 도입 우선순위를 결정합니다.',
      objective: '제한된 예산 내에서 최대 효과를 얻을 수 있는 기술을 선택',
      criteria: [
        {
          id: 'c1',
          name: '비용 효율성',
          description: '투자 대비 기대 수익',
          type: 'quantitative',
          unit: 'ROI (%)'
        },
        {
          id: 'c2',
          name: '기술 성숙도',
          description: '기술의 안정성과 검증 수준',
          type: 'qualitative'
        },
        {
          id: 'c3',
          name: '구현 복잡도',
          description: '도입 및 구현의 어려움 정도',
          type: 'qualitative'
        },
        {
          id: 'c4',
          name: '전략적 중요성',
          description: '회사 전략과의 일치도',
          type: 'qualitative'
        }
      ],
      alternatives: [
        {
          id: 'a1',
          name: 'AI/머신러닝',
          description: '인공지능 및 머신러닝 기술 도입',
          feasibility: 0.7,
          cost: 50000000,
          riskLevel: 'medium',
          implementationTime: 12,
          expectedBenefit: 0.8
        },
        {
          id: 'a2',
          name: '클라우드 컴퓨팅',
          description: '클라우드 인프라로 전환',
          feasibility: 0.9,
          cost: 30000000,
          riskLevel: 'low',
          implementationTime: 6,
          expectedBenefit: 0.7
        },
        {
          id: 'a3',
          name: 'IoT 시스템',
          description: '사물인터넷 기반 모니터링 시스템',
          feasibility: 0.6,
          cost: 40000000,
          riskLevel: 'high',
          implementationTime: 18,
          expectedBenefit: 0.6
        }
      ],
      stakeholders: [
        {
          id: 'sh1',
          name: 'CTO',
          role: '기술 책임자',
          influence: 0.9,
          interest: 0.8,
          expertise: ['기술전략', 'IT아키텍처']
        },
        {
          id: 'sh2',
          name: 'CFO',
          role: '재무 책임자',
          influence: 0.8,
          interest: 0.9,
          expertise: ['재무관리', '예산계획']
        }
      ],
      constraints: [
        {
          id: 'con1',
          type: 'budget',
          description: '연간 IT 예산 1억원 한도',
          impact: 'high'
        },
        {
          id: 'con2',
          type: 'time',
          description: '프로젝트 완료 기한 18개월',
          impact: 'medium'
        }
      ],
      riskFactors: [
        {
          id: 'r1',
          description: '기술 도입 후 직원 적응 지연',
          probability: 0.6,
          impact: 0.7,
          mitigation: '충분한 교육 훈련 프로그램 제공',
          owner: 'HR팀'
        }
      ],
      timeframe: '18개월',
      importance: 'high'
    };

    setCurrentProblem(sampleProblem);
  }, []);

  const renderProblemDefinition = () => (
    <div className="space-y-6">
      <Card title="의사결정 문제 정의">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">문제 제목</label>
            <input
              type="text"
              value={problemFormData.title}
              onChange={(e) => setProblemFormData({...problemFormData, title: e.target.value})}
              className="w-full border rounded px-3 py-2"
              placeholder="의사결정이 필요한 문제를 간단히 설명하세요"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">상세 설명</label>
            <textarea
              value={problemFormData.description}
              onChange={(e) => setProblemFormData({...problemFormData, description: e.target.value})}
              className="w-full border rounded px-3 py-2 h-24"
              placeholder="문제의 배경과 현재 상황을 자세히 설명하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">의사결정 목표</label>
            <textarea
              value={problemFormData.objective}
              onChange={(e) => setProblemFormData({...problemFormData, objective: e.target.value})}
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="이 의사결정을 통해 달성하고자 하는 목표를 명시하세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">결정 기한</label>
              <input
                type="text"
                value={problemFormData.timeframe}
                onChange={(e) => setProblemFormData({...problemFormData, timeframe: e.target.value})}
                className="w-full border rounded px-3 py-2"
                placeholder="예: 3개월, 2024년 12월"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">중요도</label>
              <select
                value={problemFormData.importance}
                onChange={(e) => setProblemFormData({...problemFormData, importance: e.target.value as any})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="low">낮음</option>
                <option value="medium">보통</option>
                <option value="high">높음</option>
                <option value="critical">매우 중요</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* 문제 정의 가이드 */}
      <Card title="🎯 효과적인 문제 정의를 위한 가이드">
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 rounded">
            <strong>SMART 원칙 적용:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Specific</strong>: 구체적이고 명확한 문제 정의</li>
              <li><strong>Measurable</strong>: 측정 가능한 결과 기준 설정</li>
              <li><strong>Achievable</strong>: 달성 가능한 목표 설정</li>
              <li><strong>Relevant</strong>: 조직 목표와 연관성 확보</li>
              <li><strong>Time-bound</strong>: 명확한 시간 제약 설정</li>
            </ul>
          </div>
          
          <div className="p-3 bg-green-50 rounded">
            <strong>고려사항 체크리스트:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>모든 이해관계자가 문제를 동일하게 이해하는가?</li>
              <li>문제의 범위가 명확하게 정의되었는가?</li>
              <li>현재 상황과 원하는 상황이 구분되는가?</li>
              <li>의사결정의 제약조건이 식별되었는가?</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderProblemStructuring = () => (
    <div className="space-y-6">
      {currentProblem && (
        <>
          {/* 계층구조 시각화 */}
          <Card title="AHP 계층구조">
            <div className="space-y-8">
              {/* 목표 레벨 */}
              <div className="text-center">
                <div className="inline-block bg-blue-100 border-2 border-blue-500 rounded-lg p-4">
                  <div className="font-bold text-blue-800">목표</div>
                  <div className="text-sm mt-1">{currentProblem.objective}</div>
                </div>
              </div>

              {/* 기준 레벨 */}
              <div className="flex justify-center">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentProblem.criteria.map((criterion, index) => (
                    <div key={criterion.id} className="text-center">
                      <div className="bg-green-100 border-2 border-green-500 rounded-lg p-3">
                        <div className="font-medium text-green-800 text-sm">{criterion.name}</div>
                        <div className="text-xs mt-1 text-green-600">{criterion.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 대안 레벨 */}
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentProblem.alternatives.map((alternative) => (
                    <div key={alternative.id} className="text-center">
                      <div className="bg-purple-100 border-2 border-purple-500 rounded-lg p-3">
                        <div className="font-medium text-purple-800 text-sm">{alternative.name}</div>
                        <div className="text-xs mt-1 text-purple-600">
                          위험도: {alternative.riskLevel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 이해관계자 분석 */}
          <Card title="이해관계자 분석">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentProblem.stakeholders.map((stakeholder) => (
                <div key={stakeholder.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{stakeholder.name}</h4>
                      <p className="text-sm text-gray-600">{stakeholder.role}</p>
                    </div>
                    <div className="text-right text-xs">
                      <div>영향력: {(stakeholder.influence * 100).toFixed(0)}%</div>
                      <div>관심도: {(stakeholder.interest * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">영향력</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${stakeholder.influence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">관심도</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${stakeholder.interest * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="text-xs text-gray-600 mb-1">전문분야</div>
                    <div className="flex flex-wrap gap-1">
                      {stakeholder.expertise.map((exp, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 제약조건 및 위험요인 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="제약조건">
              <div className="space-y-3">
                {currentProblem.constraints.map((constraint) => (
                  <div key={constraint.id} className="border rounded p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className={`inline-block px-2 py-1 rounded text-xs mb-2 ${
                          constraint.type === 'budget' ? 'bg-red-100 text-red-800' :
                          constraint.type === 'time' ? 'bg-blue-100 text-blue-800' :
                          constraint.type === 'resource' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {constraint.type}
                        </div>
                        <div className="text-sm">{constraint.description}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        constraint.impact === 'high' ? 'bg-red-100 text-red-800' :
                        constraint.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {constraint.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="위험요인">
              <div className="space-y-3">
                {currentProblem.riskFactors.map((risk) => (
                  <div key={risk.id} className="border rounded p-3">
                    <div className="text-sm font-medium mb-2">{risk.description}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gray-600">확률: </span>
                        <span className="font-medium">{(risk.probability * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">영향: </span>
                        <span className="font-medium">{(risk.impact * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-600 mb-1">대응방안:</div>
                      <div>{risk.mitigation}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      담당자: {risk.owner}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  const renderEvaluation = () => (
    <Card title="평가 진행">
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">
          구조화된 문제에 대한 AHP 평가를 시작합니다
        </div>
        <Button variant="primary">쌍대비교 평가 시작</Button>
      </div>
    </Card>
  );

  const renderAnalysis = () => (
    <Card title="결과 분석">
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">
          평가 결과를 분석하고 민감도 분석을 수행합니다
        </div>
        <Button variant="primary">분석 결과 보기</Button>
      </div>
    </Card>
  );

  const renderValidation = () => (
    <Card title="결과 검증">
      <div className="text-center py-8">
        <div className="text-gray-600 mb-4">
          의사결정 결과의 타당성을 검증합니다
        </div>
        <Button variant="primary">검증 보고서 생성</Button>
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 프로세스 단계 */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {[
            { id: 'definition', name: '문제정의', icon: '🎯', desc: '의사결정 문제 정의 및 목표 설정' },
            { id: 'structuring', name: '구조화', icon: '🏗️', desc: '계층구조 및 이해관계자 분석' },
            { id: 'evaluation', name: '평가', icon: '⚖️', desc: 'AHP 쌍대비교 평가 수행' },
            { id: 'analysis', name: '분석', icon: '📊', desc: '결과 분석 및 민감도 검토' },
            { id: 'validation', name: '검증', icon: '✅', desc: '의사결정 결과 타당성 검증' }
          ].map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setActiveStep(step.id as any)}
                className={`flex-1 min-w-0 flex flex-col items-center py-6 px-4 rounded-lg transition-all duration-200 ${
                  activeStep === step.id 
                    ? 'bg-blue-50 text-blue-700 shadow-md border-2 border-blue-300' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 border-2 border-transparent'
                }`}
              >
                <div className="text-3xl mb-2">{step.icon}</div>
                <div className="text-base font-semibold mb-1">{step.name}</div>
                <div className="text-xs text-center leading-tight px-1">{step.desc}</div>
              </button>
              {index < 4 && (
                <div className="hidden lg:block flex-shrink-0 w-8 h-px bg-gray-300"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 단계별 콘텐츠 */}
      {activeStep === 'definition' && renderProblemDefinition()}
      {activeStep === 'structuring' && renderProblemStructuring()}
      {activeStep === 'evaluation' && renderEvaluation()}
      {activeStep === 'analysis' && renderAnalysis()}
      {activeStep === 'validation' && renderValidation()}

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between">
        <Button 
          variant="secondary" 
          disabled={activeStep === 'definition'}
          onClick={() => {
            const steps = ['definition', 'structuring', 'evaluation', 'analysis', 'validation'];
            const currentIndex = steps.indexOf(activeStep);
            if (currentIndex > 0) {
              setActiveStep(steps[currentIndex - 1] as any);
            }
          }}
        >
          이전 단계
        </Button>
        
        <Button 
          variant="primary"
          disabled={activeStep === 'validation'}
          onClick={() => {
            const steps = ['definition', 'structuring', 'evaluation', 'analysis', 'validation'];
            const currentIndex = steps.indexOf(activeStep);
            if (currentIndex < steps.length - 1) {
              setActiveStep(steps[currentIndex + 1] as any);
            }
          }}
        >
          다음 단계
        </Button>
      </div>
    </div>
  );
};

export default DecisionSupportSystem;