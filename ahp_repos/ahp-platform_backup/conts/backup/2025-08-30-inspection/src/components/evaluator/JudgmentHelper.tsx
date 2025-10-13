import React, { useState } from 'react';
import Card from '../common/Card';

interface Matrix {
  id: string;
  name: string;
  items: string[];
  values: number[][];
  completed: boolean;
  consistencyRatio?: number;
}

interface JudgmentHelperProps {
  currentMatrix: Matrix;
  onClose: () => void;
}

const JudgmentHelper: React.FC<JudgmentHelperProps> = ({ currentMatrix, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'analysis' | 'tips'>('guide');

  const getInconsistentPairs = () => {
    const inconsistent: { row: number; col: number; suggestion: string }[] = [];
    const { items, values } = currentMatrix;
    
    // 간단한 일관성 체크 (실제로는 더 복잡한 알고리즘 필요)
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        for (let k = j + 1; k < items.length; k++) {
          const val_ij = values[i][j];
          const val_jk = values[j][k];
          const val_ik = values[i][k];
          
          // 전이성 체크: A > B, B > C이면 A > C여야 함
          if (val_ij > 1 && val_jk > 1 && val_ik < val_ij * val_jk * 0.5) {
            inconsistent.push({
              row: i,
              col: k,
              suggestion: `${items[i]}와 ${items[k]}의 비교 값을 재검토해보세요`
            });
          }
        }
      }
    }
    
    return inconsistent.slice(0, 3); // 최대 3개만 표시
  };

  const getComparisonSuggestions = () => {
    return [
      {
        criteria: '성능 vs 비용',
        questions: [
          '시스템의 빠른 처리속도가 추가 비용보다 얼마나 더 중요한가?',
          '예산 절약이 성능 향상보다 우선시되는가?',
          '장기적 관점에서 성능과 비용 중 어느 것이 더 중요한가?'
        ]
      },
      {
        criteria: '처리속도 vs 안정성',
        questions: [
          '빠른 응답시간이 시스템 안정성보다 중요한가?',
          '가끔 느려도 안정적인 시스템이 더 나은가?',
          '사용자 만족도 관점에서 어느 것이 더 중요한가?'
        ]
      }
    ];
  };

  const renderGuideTab = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">🎯 평가 기준</h4>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 p-2 rounded border">
              <div className="font-medium text-green-800">1 - 동등</div>
              <div className="text-green-600 text-xs">두 요소가 같은 중요도</div>
            </div>
            <div className="bg-blue-50 p-2 rounded border">
              <div className="font-medium text-blue-800">3 - 약간 중요</div>
              <div className="text-blue-600 text-xs">한쪽이 약간 더 중요</div>
            </div>
            <div className="bg-purple-50 p-2 rounded border">
              <div className="font-medium text-purple-800">5 - 중요</div>
              <div className="text-purple-600 text-xs">한쪽이 확실히 중요</div>
            </div>
            <div className="bg-red-50 p-2 rounded border">
              <div className="font-medium text-red-800">7 - 매우 중요</div>
              <div className="text-red-600 text-xs">한쪽이 매우 중요</div>
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded border">
            <div className="font-medium text-gray-800">9 - 절대적으로 중요</div>
            <div className="text-gray-600 text-xs">한쪽이 압도적으로 중요</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">💡 판단 요령</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 두 요소를 직접 비교하여 상대적 중요도를 평가하세요</li>
          <li>• 확신이 서지 않으면 낮은 숫자(1, 3)를 선택하세요</li>
          <li>• 전체 일관성을 고려하여 비슷한 패턴으로 평가하세요</li>
          <li>• 실제 업무 상황을 구체적으로 상상해보세요</li>
        </ul>
      </div>
    </div>
  );

  const renderAnalysisTab = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">📊 일관성 분석</h4>
        {currentMatrix.consistencyRatio !== undefined && (
          <div className={`p-3 rounded border ${
            currentMatrix.consistencyRatio <= 0.1 
              ? 'bg-green-50 border-green-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">현재 CR 값</span>
              <span className={`font-bold ${
                currentMatrix.consistencyRatio <= 0.1 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {currentMatrix.consistencyRatio.toFixed(3)}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              {currentMatrix.consistencyRatio <= 0.1 
                ? '✓ 일관성이 양호합니다' 
                : '⚠ 일관성 개선이 필요합니다 (기준: ≤ 0.1)'}
            </div>
          </div>
        )}
      </div>

      {currentMatrix.consistencyRatio && currentMatrix.consistencyRatio > 0.1 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">🔧 개선 제안</h4>
          <div className="space-y-2">
            {getInconsistentPairs().map((pair, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded p-2">
                <div className="text-sm text-yellow-800">{pair.suggestion}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-gray-900 mb-2">📈 판단 현황</h4>
        <div className="space-y-2 text-sm">
          {currentMatrix.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>{item}</span>
              <span className="text-xs text-gray-500">
                {currentMatrix.values[index].filter((v, i) => i !== index && v !== 1).length}개 비교 완료
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTipsTab = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">🤔 비교 질문 가이드</h4>
        <div className="space-y-3">
          {getComparisonSuggestions().map((suggestion, index) => (
            <div key={index} className="border border-gray-200 rounded p-3">
              <h5 className="font-medium text-gray-800 mb-2">{suggestion.criteria}</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {suggestion.questions.map((question, qIndex) => (
                  <li key={qIndex}>• {question}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2">⚡ 빠른 팁</h4>
        <div className="grid grid-cols-1 gap-2">
          <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-400">
            <div className="text-sm font-medium text-blue-800">우선순위 명확화</div>
            <div className="text-xs text-blue-600">가장 중요한 것부터 순서를 정해보세요</div>
          </div>
          <div className="bg-green-50 p-2 rounded border-l-4 border-green-400">
            <div className="text-sm font-medium text-green-800">실무 경험 활용</div>
            <div className="text-xs text-green-600">실제 업무에서 겪은 경험을 떠올려보세요</div>
          </div>
          <div className="bg-purple-50 p-2 rounded border-l-4 border-purple-400">
            <div className="text-sm font-medium text-purple-800">목표 중심 사고</div>
            <div className="text-xs text-purple-600">프로젝트 목표 달성에 도움되는 것을 우선하세요</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">판단 도우미</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'guide', label: '가이드', icon: '📖' },
            { id: 'analysis', label: '분석', icon: '📊' },
            { id: 'tips', label: '팁', icon: '💡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'guide' && renderGuideTab()}
          {activeTab === 'analysis' && renderAnalysisTab()}
          {activeTab === 'tips' && renderTipsTab()}
        </div>
      </div>
    </Card>
  );
};

export default JudgmentHelper;