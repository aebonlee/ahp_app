import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

// 도움말 컨텐츠 타입 정의
export interface HelpContent {
  id: string;
  title: string;
  category: 'basic' | 'advanced' | 'tips' | 'tutorial';
  content: string | React.ReactNode;
  relatedFeatures?: string[];
  videoUrl?: string;
  examples?: {
    title: string;
    description: string;
    code?: string;
  }[];
}

// 기능별 도움말 데이터베이스
export const helpDatabase: Record<string, HelpContent> = {
  'project-creation': {
    id: 'project-creation',
    title: '📝 프로젝트 생성하기',
    category: 'basic',
    content: (
      <div className="space-y-4">
        <p>AHP 프로젝트를 생성하는 방법을 안내합니다.</p>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">필수 입력 사항:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>프로젝트명: 연구 주제를 명확히 표현</li>
            <li>설명: 연구 목적과 범위 기술</li>
            <li>평가 방법: 쌍대비교 또는 직접입력</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">💡 Pro Tip:</h4>
          <p className="text-sm">템플릿을 활용하면 빠르게 시작할 수 있습니다. 
          'AI 도입 평가', '공급업체 선정' 등 다양한 템플릿이 준비되어 있습니다.</p>
        </div>
      </div>
    ),
    relatedFeatures: ['model-builder', 'evaluator-management'],
    examples: [
      {
        title: 'AI 도입 효과성 평가',
        description: '기업의 AI 도입 우선순위를 결정하기 위한 프로젝트',
      },
      {
        title: '신제품 개발 우선순위',
        description: '한정된 자원으로 최적의 제품 포트폴리오 구성',
      }
    ]
  },
  
  'model-builder': {
    id: 'model-builder',
    title: '🏗️ AHP 모델 구축',
    category: 'advanced',
    content: (
      <div className="space-y-4">
        <p>계층구조 모델을 설계하고 구축하는 방법입니다.</p>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">계층 구조:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>목표 (Goal): 최상위 의사결정 목표</li>
            <li>기준 (Criteria): 평가 기준</li>
            <li>하위기준 (Sub-criteria): 세부 평가 항목</li>
            <li>대안 (Alternatives): 선택 가능한 옵션</li>
          </ul>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">✅ 체크리스트:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>각 계층은 2-7개 요소 권장</li>
            <li>기준 간 독립성 확보</li>
            <li>측정 가능한 기준 설정</li>
            <li>완전성과 비중복성 검증</li>
          </ul>
        </div>
      </div>
    ),
    relatedFeatures: ['project-creation', 'pairwise-comparison'],
    videoUrl: 'https://example.com/model-builder-tutorial',
  },

  'pairwise-comparison': {
    id: 'pairwise-comparison',
    title: '⚖️ 쌍대비교 평가',
    category: 'basic',
    content: (
      <div className="space-y-4">
        <p>두 요소를 쌍으로 비교하여 상대적 중요도를 평가합니다.</p>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">9점 척도 의미:</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b">
                <td className="py-1 font-medium">1</td>
                <td className="py-1">동등하게 중요</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 font-medium">3</td>
                <td className="py-1">약간 더 중요</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 font-medium">5</td>
                <td className="py-1">상당히 더 중요</td>
              </tr>
              <tr className="border-b">
                <td className="py-1 font-medium">7</td>
                <td className="py-1">매우 더 중요</td>
              </tr>
              <tr>
                <td className="py-1 font-medium">9</td>
                <td className="py-1">극히 더 중요</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs mt-2 text-gray-600">2, 4, 6, 8은 중간값</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">⚠️ 일관성 비율(CR):</h4>
          <p className="text-sm">CR {'<'} 0.1이 되도록 평가해야 합니다. 
          0.1을 초과하면 평가를 재검토하세요.</p>
        </div>
      </div>
    ),
    relatedFeatures: ['direct-input', 'consistency-check'],
  },

  'demographic-survey': {
    id: 'demographic-survey',
    title: '📊 인구통계학적 설문조사',
    category: 'advanced',
    content: (
      <div className="space-y-4">
        <p>평가자의 배경 정보를 수집하여 분석의 깊이를 더합니다.</p>
        
        <div className="bg-teal-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">설문 구성 요소:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>기본 정보: 소속, 직위, 경력</li>
            <li>전문성: 관련 분야 경험</li>
            <li>선호도: 의사결정 스타일</li>
            <li>추가 의견: 자유 텍스트</li>
          </ul>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">🔗 설문 링크 생성:</h4>
          <p className="text-sm mb-2">각 평가자별 고유 링크를 생성합니다:</p>
          <code className="text-xs bg-gray-100 p-1 rounded">
            /survey/eval/survey-001-token-abc123
          </code>
        </div>
      </div>
    ),
    relatedFeatures: ['evaluator-management', 'survey-links'],
    examples: [
      {
        title: '전문가 그룹 설문',
        description: '5년 이상 경력자 대상 심층 설문',
      },
      {
        title: '이해관계자 설문',
        description: '프로젝트 관련 모든 부서 의견 수렴',
      }
    ]
  },

  'results-analysis': {
    id: 'results-analysis',
    title: '📈 결과 분석',
    category: 'advanced',
    content: (
      <div className="space-y-4">
        <p>AHP 분석 결과를 해석하고 활용하는 방법입니다.</p>
        
        <div className="bg-cyan-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">주요 분석 지표:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>최종 가중치: 각 대안의 종합 점수</li>
            <li>일관성 비율: 평가의 논리적 일관성</li>
            <li>민감도 분석: 가중치 변화 영향</li>
            <li>그룹 통합: 다수 평가자 의견 종합</li>
          </ul>
        </div>

        <div className="bg-pink-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">📊 시각화 옵션:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>막대 차트: 가중치 비교</li>
            <li>레이더 차트: 다차원 비교</li>
            <li>히트맵: 쌍대비교 매트릭스</li>
            <li>민감도 그래프: What-if 분석</li>
          </ul>
        </div>
      </div>
    ),
    relatedFeatures: ['export-reports', 'decision-support'],
  }
};

interface HelpSystemProps {
  featureId?: string;
  onClose?: () => void;
  compact?: boolean;
}

const HelpSystem: React.FC<HelpSystemProps> = ({ 
  featureId, 
  onClose,
  compact = false 
}) => {
  const [currentHelp, setCurrentHelp] = useState<HelpContent | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (featureId && helpDatabase[featureId]) {
      setCurrentHelp(helpDatabase[featureId]);
      setShowPopup(true);
    }
  }, [featureId]);

  const handleSearch = () => {
    // 검색 로직 구현
    const results = Object.values(helpDatabase).filter(help =>
      help.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof help.content === 'string' && help.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    if (results.length > 0) {
      setCurrentHelp(results[0]);
      setShowPopup(true);
    }
  };

  const HelpButton = () => (
    <button
      onClick={() => setShowPopup(true)}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
      title="도움말"
    >
      <span className="text-2xl">?</span>
    </button>
  );

  if (compact) {
    return (
      <button
        onClick={() => setShowPopup(true)}
        className="text-blue-500 hover:text-blue-700 transition-colors"
        title="도움말 보기"
      >
        <span className="text-sm">ℹ️ 도움말</span>
      </button>
    );
  }

  return (
    <>
      {!showPopup && <HelpButton />}
      
      {showPopup && currentHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {currentHelp.title}
              </h3>
              <button
                onClick={() => {
                  setShowPopup(false);
                  onClose?.();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {currentHelp.content}
              
              {currentHelp.examples && currentHelp.examples.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-3">📝 예시:</h4>
                  <div className="space-y-3">
                    {currentHelp.examples.map((example, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <h5 className="font-medium text-sm mb-1">{example.title}</h5>
                        <p className="text-xs text-gray-600">{example.description}</p>
                        {example.code && (
                          <code className="text-xs bg-gray-200 p-1 rounded mt-2 block">
                            {example.code}
                          </code>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentHelp.relatedFeatures && currentHelp.relatedFeatures.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-2">🔗 관련 기능:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentHelp.relatedFeatures.map(feature => (
                      <button
                        key={feature}
                        onClick={() => {
                          if (helpDatabase[feature]) {
                            setCurrentHelp(helpDatabase[feature]);
                          }
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
                      >
                        {helpDatabase[feature]?.title || feature}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentHelp.videoUrl && (
                <div className="mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => window.open(currentHelp.videoUrl, '_blank')}
                    className="w-full"
                  >
                    🎥 동영상 튜토리얼 보기
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpSystem;