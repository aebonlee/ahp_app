import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

interface TestProject {
  id: string;
  name: string;
  description: string;
  criteria: {
    id: string;
    name: string;
    weight?: number;
    subCriteria?: {
      id: string;
      name: string;
      weight?: number;
    }[];
  }[];
  alternatives: {
    id: string;
    name: string;
    description?: string;
  }[];
  evaluationMethod: 'pairwise' | 'direct';
}

const EvaluationTest: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<TestProject | null>(null);
  const [currentStep, setCurrentStep] = useState<'select' | 'demographic' | 'evaluation' | 'result'>('select');
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [testMode, setTestMode] = useState<'preview' | 'simulate'>('preview');

  // 샘플 프로젝트 데이터
  const sampleProjects: TestProject[] = [
    {
      id: '1',
      name: 'AI 도입 우선순위 평가',
      description: '기업 내 AI 기술 도입을 위한 우선순위 결정',
      criteria: [
        {
          id: 'c1',
          name: '기술적 타당성',
          subCriteria: [
            { id: 'sc1', name: '기술 성숙도' },
            { id: 'sc2', name: '구현 난이도' }
          ]
        },
        {
          id: 'c2',
          name: '경제적 효과',
          subCriteria: [
            { id: 'sc3', name: 'ROI' },
            { id: 'sc4', name: '비용 절감' }
          ]
        },
        {
          id: 'c3',
          name: '전략적 중요도',
          subCriteria: [
            { id: 'sc5', name: '시장 경쟁력' },
            { id: 'sc6', name: '혁신성' }
          ]
        }
      ],
      alternatives: [
        { id: 'a1', name: 'ChatBot 시스템', description: '고객 서비스 자동화' },
        { id: 'a2', name: '예측 분석 시스템', description: '수요 예측 및 재고 최적화' },
        { id: 'a3', name: '프로세스 자동화', description: 'RPA 기반 업무 자동화' }
      ],
      evaluationMethod: 'pairwise'
    },
    {
      id: '2',
      name: '공급업체 선정',
      description: '신규 프로젝트를 위한 최적 공급업체 선정',
      criteria: [
        { id: 'c1', name: '품질' },
        { id: 'c2', name: '가격' },
        { id: 'c3', name: '납기' },
        { id: 'c4', name: '기술력' }
      ],
      alternatives: [
        { id: 'a1', name: '업체 A' },
        { id: 'a2', name: '업체 B' },
        { id: 'a3', name: '업체 C' }
      ],
      evaluationMethod: 'direct'
    }
  ];

  // 평가 시뮬레이션
  const simulateEvaluation = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setEvaluationProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setCurrentStep('result');
      }
    }, 300);
  };

  // 프로젝트 선택 화면
  const ProjectSelection = () => (
    <Card title="📋 프로젝트 선택">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          평가 테스트를 진행할 프로젝트를 선택하세요.
        </p>
        
        <div className="grid gap-4">
          {sampleProjects.map(project => (
            <div 
              key={project.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                setSelectedProject(project);
                setCurrentStep('demographic');
              }}
            >
              <h4 className="font-semibold text-lg mb-2">{project.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{project.description}</p>
              
              <div className="flex items-center gap-6 text-xs text-gray-500">
                <span>평가방법: {project.evaluationMethod === 'pairwise' ? '쌍대비교' : '직접입력'}</span>
                <span>기준: {project.criteria.length}개</span>
                <span>대안: {project.alternatives.length}개</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  // 인구통계학적 설문 화면
  const DemographicSurvey = () => (
    <Card title="📊 인구통계학적 설문조사">
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            평가자에게 표시되는 설문 화면입니다. 실제 평가 시 수집되는 정보를 미리 확인하세요.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이름</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">소속</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="○○기업 연구개발부"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">직위</label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              <option>선택하세요</option>
              <option>사원</option>
              <option>대리</option>
              <option>과장</option>
              <option>차장</option>
              <option>부장</option>
              <option>임원</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">경력</label>
            <select className="w-full p-2 border border-gray-300 rounded-md">
              <option>선택하세요</option>
              <option>1년 미만</option>
              <option>1-3년</option>
              <option>3-5년</option>
              <option>5-10년</option>
              <option>10년 이상</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">전문 분야</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="AI/ML, 데이터 분석"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            variant="secondary"
            onClick={() => setCurrentStep('select')}
          >
            이전
          </Button>
          <Button onClick={() => setCurrentStep('evaluation')}>
            다음 단계
          </Button>
        </div>
      </div>
    </Card>
  );

  // 평가 화면
  const EvaluationScreen = () => (
    <Card title="⚖️ 평가 진행">
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            실제 평가자가 보게 될 평가 인터페이스입니다.
          </p>
        </div>

        {selectedProject?.evaluationMethod === 'pairwise' ? (
          // 쌍대비교 평가
          <div className="space-y-4">
            <h4 className="font-semibold">기준 간 중요도 비교</h4>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">기술적 타당성</span>
                <span className="text-gray-500">vs</span>
                <span className="font-medium">경제적 효과</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">매우 중요</span>
                <div className="flex gap-1">
                  {[9, 7, 5, 3, 1, 3, 5, 7, 9].map((value, idx) => (
                    <button
                      key={idx}
                      className={`w-8 h-8 border rounded ${idx === 4 ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <span className="text-sm">매우 중요</span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              1/6 비교 완료
            </div>
          </div>
        ) : (
          // 직접입력 평가
          <div className="space-y-4">
            <h4 className="font-semibold">대안별 점수 입력</h4>
            
            <div className="space-y-3">
              {selectedProject?.alternatives.map(alt => (
                <div key={alt.id} className="flex items-center gap-4">
                  <span className="w-24 font-medium">{alt.name}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    className="flex-1"
                  />
                  <span className="w-12 text-right">50</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {testMode === 'simulate' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>진행률</span>
              <span>{evaluationProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${evaluationProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button 
            variant="secondary"
            onClick={() => setCurrentStep('demographic')}
          >
            이전
          </Button>
          <Button 
            onClick={() => {
              if (testMode === 'simulate') {
                simulateEvaluation();
              } else {
                setCurrentStep('result');
              }
            }}
          >
            {testMode === 'simulate' ? '평가 시뮬레이션' : '결과 미리보기'}
          </Button>
        </div>
      </div>
    </Card>
  );

  // 결과 화면
  const ResultScreen = () => (
    <Card title="📈 평가 결과 미리보기">
      <div className="space-y-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-purple-800">
            평가 완료 후 평가자에게 표시되는 결과 화면입니다.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">최종 우선순위</h4>
          
          {selectedProject?.alternatives.map((alt, idx) => (
            <div key={alt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                <div>
                  <div className="font-medium">{alt.name}</div>
                  {alt.description && (
                    <div className="text-xs text-gray-500">{alt.description}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{(0.35 - idx * 0.1).toFixed(3)}</div>
                <div className="text-xs text-gray-500">{((0.35 - idx * 0.1) * 100).toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span>일관성 비율 (CR)</span>
            <span className="font-medium text-green-600">0.087 (양호)</span>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={() => {
            setCurrentStep('select');
            setSelectedProject(null);
            setEvaluationProgress(0);
          }}>
            처음으로
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 평가 테스트
        </h1>
        <p className="text-gray-600">
          평가자 화면을 미리 확인하고 테스트해보세요
        </p>
      </div>

      {/* 테스트 모드 선택 */}
      <Card>
        <div className="flex items-center justify-center gap-4">
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              checked={testMode === 'preview'}
              onChange={() => setTestMode('preview')}
            />
            <span>미리보기 모드</span>
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio"
              checked={testMode === 'simulate'}
              onChange={() => setTestMode('simulate')}
            />
            <span>시뮬레이션 모드</span>
          </label>
        </div>
      </Card>

      {/* 진행 단계 표시 */}
      <div className="flex items-center justify-center gap-2">
        {['select', 'demographic', 'evaluation', 'result'].map((step, idx) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep === step 
                ? 'bg-blue-500 text-white' 
                : idx < ['select', 'demographic', 'evaluation', 'result'].indexOf(currentStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
            }`}>
              {idx + 1}
            </div>
            {idx < 3 && (
              <div className={`w-16 h-1 ${
                idx < ['select', 'demographic', 'evaluation', 'result'].indexOf(currentStep)
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 단계별 화면 */}
      {currentStep === 'select' && <ProjectSelection />}
      {currentStep === 'demographic' && <DemographicSurvey />}
      {currentStep === 'evaluation' && <EvaluationScreen />}
      {currentStep === 'result' && <ResultScreen />}

      {/* 도움말 */}
      <Card title="💡 평가 테스트 가이드">
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>미리보기 모드:</strong> 평가자가 보게 될 화면의 구성과 흐름을 확인합니다.
          </p>
          <p>
            <strong>시뮬레이션 모드:</strong> 실제 평가 과정을 시뮬레이션하여 동작을 테스트합니다.
          </p>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-yellow-800">
              💡 Tip: 실제 평가 링크는 '평가자 관리' 메뉴에서 생성할 수 있습니다.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EvaluationTest;