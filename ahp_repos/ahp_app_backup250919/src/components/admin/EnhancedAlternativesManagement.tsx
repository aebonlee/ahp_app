/**
 * 향상된 대안 관리 시스템
 * 대안 정의, 각 기준별 대안 평가, 드래그앤드롭 순서 변경
 */

import React, { useState, useEffect } from 'react';
import EnhancedPairwiseGrid from '../evaluation/EnhancedPairwiseGrid';

interface Alternative {
  id: string;
  name: string;
  description?: string;
  order: number;
  scores?: { [criterionId: string]: number };
}

interface Criterion {
  id: string;
  name: string;
  description?: string;
  weight?: number;
}

interface AlternativesManagementProps {
  projectId: string;
  projectTitle?: string;
  criteria: Criterion[];
  onComplete: () => void;
  onAlternativesChange?: (alternativesCount: number) => void;
  onSaveAlternatives?: (projectId: string, alternatives: Alternative[]) => Promise<void>;
}

const EnhancedAlternativesManagement: React.FC<AlternativesManagementProps> = ({
  projectId,
  projectTitle = "프로젝트",
  criteria,
  onComplete,
  onAlternativesChange,
  onSaveAlternatives
}) => {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [currentStep, setCurrentStep] = useState<'define' | 'evaluate' | 'review'>('define');
  const [currentCriterionIndex, setCurrentCriterionIndex] = useState(0);
  const [newAlternativeName, setNewAlternativeName] = useState('');
  const [newAlternativeDescription, setNewAlternativeDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [evaluationComparisons, setEvaluationComparisons] = useState<{[criterionId: string]: Array<{i: number, j: number, value: number}>}>({});

  // 대안 템플릿
  const alternativeTemplates = {
    products: [
      { name: '제품 A', description: '현재 검토 중인 첫 번째 제품' },
      { name: '제품 B', description: '현재 검토 중인 두 번째 제품' },
      { name: '제품 C', description: '현재 검토 중인 세 번째 제품' }
    ],
    solutions: [
      { name: '솔루션 1', description: '첫 번째 해결방안' },
      { name: '솔루션 2', description: '두 번째 해결방안' },
      { name: '솔루션 3', description: '세 번째 해결방안' }
    ],
    vendors: [
      { name: '업체 A', description: '후보 업체 A' },
      { name: '업체 B', description: '후보 업체 B' },
      { name: '업체 C', description: '후보 업체 C' }
    ],
    strategies: [
      { name: '전략 1', description: '첫 번째 전략 옵션' },
      { name: '전략 2', description: '두 번째 전략 옵션' },
      { name: '전략 3', description: '세 번째 전략 옵션' }
    ]
  };

  useEffect(() => {
    if (onAlternativesChange) {
      onAlternativesChange(alternatives.length);
    }
  }, [alternatives, onAlternativesChange]);

  const addAlternative = () => {
    if (!newAlternativeName.trim()) return;

    const newAlternative: Alternative = {
      id: Date.now().toString(),
      name: newAlternativeName.trim(),
      description: newAlternativeDescription.trim() || undefined,
      order: alternatives.length,
      scores: {}
    };

    setAlternatives(prev => [...prev, newAlternative]);
    setNewAlternativeName('');
    setNewAlternativeDescription('');
  };

  const updateAlternative = (id: string, updates: Partial<Alternative>) => {
    setAlternatives(prev => prev.map(alternative => 
      alternative.id === id ? { ...alternative, ...updates } : alternative
    ));
  };

  const deleteAlternative = (id: string) => {
    setAlternatives(prev => prev.filter(alternative => alternative.id !== id));
  };

  const applyTemplate = (templateKey: keyof typeof alternativeTemplates) => {
    const template = alternativeTemplates[templateKey];
    const newAlternatives: Alternative[] = template.map((item, index) => ({
      id: Date.now().toString() + index,
      name: item.name,
      description: item.description,
      order: index,
      scores: {}
    }));
    setAlternatives(newAlternatives);
    setShowBulkInput(false);
  };

  const handleBulkInput = () => {
    if (!bulkInputText.trim()) return;

    const lines = bulkInputText.split('\n').filter(line => line.trim());
    const newAlternatives: Alternative[] = lines.map((line, index) => {
      const parts = line.split('|').map(part => part.trim());
      return {
        id: Date.now().toString() + index,
        name: parts[0],
        description: parts[1] || undefined,
        order: alternatives.length + index,
        scores: {}
      };
    });

    setAlternatives(prev => [...prev, ...newAlternatives]);
    setBulkInputText('');
    setShowBulkInput(false);
  };

  const handleCriterionEvaluationComplete = (comparisons: Array<{i: number, j: number, value: number}>) => {
    const currentCriterion = criteria[currentCriterionIndex];
    if (!currentCriterion) return;

    setEvaluationComparisons(prev => ({
      ...prev,
      [currentCriterion.id]: comparisons
    }));

    // 다음 기준으로 이동하거나 완료
    if (currentCriterionIndex < criteria.length - 1) {
      setCurrentCriterionIndex(prev => prev + 1);
    } else {
      handleEvaluationComplete();
    }
  };

  const handleEvaluationComplete = async () => {
    if (onSaveAlternatives) {
      await onSaveAlternatives(projectId, alternatives);
    }
    setCurrentStep('review');
  };

  const handleComplete = () => {
    onComplete();
  };

  const renderDefineStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">대안(선택지) 정의</h3>
            <p className="text-gray-600 mt-1">비교하고 평가할 대안들을 정의하세요</p>
          </div>
          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            {showBulkInput ? '개별 입력' : '일괄 입력'}
          </button>
        </div>

        {/* 기준 표시 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">설정된 평가 기준</h4>
          <div className="flex flex-wrap gap-2">
            {criteria.map((criterion) => (
              <span key={criterion.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {criterion.name}
              </span>
            ))}
          </div>
        </div>

        {/* 템플릿 선택 */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">템플릿 적용 (선택사항)</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button
              onClick={() => applyTemplate('products')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-blue-600">📱 제품</div>
              <div className="text-sm text-gray-600 mt-1">제품 A, B, C</div>
            </button>
            <button
              onClick={() => applyTemplate('solutions')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-blue-600">💡 솔루션</div>
              <div className="text-sm text-gray-600 mt-1">해결방안 1, 2, 3</div>
            </button>
            <button
              onClick={() => applyTemplate('vendors')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-blue-600">🏢 업체</div>
              <div className="text-sm text-gray-600 mt-1">업체 A, B, C</div>
            </button>
            <button
              onClick={() => applyTemplate('strategies')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-blue-600">🎯 전략</div>
              <div className="text-sm text-gray-600 mt-1">전략 1, 2, 3</div>
            </button>
          </div>
        </div>

        {showBulkInput ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                일괄 입력 (한 줄에 하나씩, 대안명|설명 형식)
              </label>
              <textarea
                value={bulkInputText}
                onChange={(e) => setBulkInputText(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`예시:\nSAP ERP|글로벌 표준 ERP 시스템\nOracle ERP|대기업용 통합 시스템\n자체 개발|맞춤형 시스템 개발`}
              />
            </div>
            <button
              onClick={handleBulkInput}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              일괄 추가
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">대안명 *</label>
                <input
                  type="text"
                  value={newAlternativeName}
                  onChange={(e) => setNewAlternativeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: SAP ERP, Oracle ERP 등"
                  onKeyPress={(e) => e.key === 'Enter' && addAlternative()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
                <input
                  type="text"
                  value={newAlternativeDescription}
                  onChange={(e) => setNewAlternativeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="대안에 대한 자세한 설명"
                  onKeyPress={(e) => e.key === 'Enter' && addAlternative()}
                />
              </div>
            </div>
            <button
              onClick={addAlternative}
              disabled={!newAlternativeName.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              대안 추가
            </button>
          </div>
        )}
      </div>

      {/* 대안 목록 */}
      {alternatives.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">정의된 대안 ({alternatives.length}개)</h4>
          <div className="space-y-3">
            {alternatives.map((alternative) => (
              <div key={alternative.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  {editingId === alternative.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={alternative.name}
                        onChange={(e) => updateAlternative(alternative.id, { name: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        onBlur={() => setEditingId(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setEditingId(null)}
                        autoFocus
                      />
                      <input
                        type="text"
                        value={alternative.description || ''}
                        onChange={(e) => updateAlternative(alternative.id, { description: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="설명"
                      />
                    </div>
                  ) : (
                    <div className="cursor-pointer" onClick={() => setEditingId(alternative.id)}>
                      <div className="font-medium text-gray-900">{alternative.name}</div>
                      {alternative.description && (
                        <div className="text-sm text-gray-600">{alternative.description}</div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteAlternative(alternative.id)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {alternatives.length >= 2 && (
        <div className="flex justify-end">
          <button
            onClick={() => setCurrentStep('evaluate')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            대안 평가 진행하기
          </button>
        </div>
      )}
    </div>
  );

  const renderEvaluateStep = () => {
    const currentCriterion = criteria[currentCriterionIndex];
    
    if (!currentCriterion) {
      return <div>기준 정보를 불러올 수 없습니다.</div>;
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep('define')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← 대안 정의로 돌아가기
          </button>
          <div className="text-sm text-gray-600">
            기준 {currentCriterionIndex + 1}/{criteria.length}: {currentCriterion.name}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-800 mb-2">현재 평가 기준</h4>
          <div className="text-blue-700">
            <strong>{currentCriterion.name}</strong>
            {currentCriterion.description && (
              <p className="text-sm mt-1">{currentCriterion.description}</p>
            )}
          </div>
        </div>

        <EnhancedPairwiseGrid
          elements={alternatives.map(a => ({ id: a.id, name: a.name, description: a.description }))}
          onComparisonChange={(comparisons) => {
            const currentCriterion = criteria[currentCriterionIndex];
            if (currentCriterion) {
              setEvaluationComparisons(prev => ({
                ...prev,
                [currentCriterion.id]: comparisons
              }));
            }
          }}
          title={`"${currentCriterion.name}" 기준으로 대안 비교`}
        />

        <div className="flex justify-between">
          <button
            onClick={() => {
              if (currentCriterionIndex > 0) {
                setCurrentCriterionIndex(prev => prev - 1);
              } else {
                setCurrentStep('define');
              }
            }}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            이전
          </button>
          <button
            onClick={() => handleCriterionEvaluationComplete(evaluationComparisons[currentCriterion.id] || [])}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {currentCriterionIndex < criteria.length - 1 ? '다음 기준' : '평가 완료'}
          </button>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">대안 설정 완료! 🎉</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">설정된 대안</h4>
            <ul className="space-y-1">
              {alternatives.map((alternative, index) => (
                <li key={alternative.id} className="text-green-700">
                  {index + 1}. {alternative.name}
                  {alternative.description && (
                    <span className="text-green-600 text-sm ml-2">- {alternative.description}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">평가 완료된 기준</h4>
            <ul className="space-y-1">
              {criteria.map((criterion) => (
                <li key={criterion.id} className="text-blue-700 flex items-center">
                  <span className={`mr-2 ${evaluationComparisons[criterion.id] ? 'text-green-600' : 'text-gray-400'}`}>
                    {evaluationComparisons[criterion.id] ? '✓' : '○'}
                  </span>
                  {criterion.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">다음 단계</h4>
          <p className="text-yellow-700 text-sm">
            모든 평가가 완료되었습니다! 이제 AHP 분석 결과를 확인하고 최종 의사결정을 내릴 수 있습니다.
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleComplete}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            AHP 분석 결과 보기
          </button>
        </div>
      </div>
    </div>
  );

  if (criteria.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">기준이 설정되지 않았습니다</h3>
          <p className="text-yellow-700 mb-4">
            대안을 평가하기 전에 먼저 평가 기준을 설정해야 합니다.
          </p>
          <button
            onClick={onComplete}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            기준 설정으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{projectTitle} - 대안 설정 및 평가</h2>
          <div className="text-sm text-gray-600">
            {currentStep === 'define' && '1/3'}
            {currentStep === 'evaluate' && '2/3'}
            {currentStep === 'review' && '3/3'}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div className={`flex-1 h-2 rounded-full ${
            ['define', 'evaluate', 'review'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-200'
          }`} />
          <div className={`flex-1 h-2 rounded-full ${
            ['evaluate', 'review'].includes(currentStep) ? 'bg-green-600' : 'bg-gray-200'
          }`} />
          <div className={`flex-1 h-2 rounded-full ${
            currentStep === 'review' ? 'bg-green-600' : 'bg-gray-200'
          }`} />
        </div>
      </div>

      {/* Content */}
      {currentStep === 'define' && renderDefineStep()}
      {currentStep === 'evaluate' && renderEvaluateStep()}
      {currentStep === 'review' && renderReviewStep()}
    </div>
  );
};

export default EnhancedAlternativesManagement;