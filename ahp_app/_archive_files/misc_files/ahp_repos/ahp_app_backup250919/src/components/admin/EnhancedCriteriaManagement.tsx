/**
 * 향상된 기준 관리 시스템
 * 계층적 기준 구조, 드래그앤드롭, 벌크 입력 지원
 */

import React, { useState, useEffect } from 'react';
import EnhancedPairwiseGrid from '../evaluation/EnhancedPairwiseGrid';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  level: number;
  children?: Criterion[];
  weight?: number;
  order: number;
}

interface CriteriaManagementProps {
  projectId: string;
  projectTitle?: string;
  onComplete: () => void;
  onCriteriaChange?: (criteriaCount: number) => void;
  onSaveCriteria?: (projectId: string, criteria: Criterion[]) => Promise<void>;
}

const EnhancedCriteriaManagement: React.FC<CriteriaManagementProps> = ({
  projectId,
  projectTitle = "프로젝트",
  onComplete,
  onCriteriaChange,
  onSaveCriteria
}) => {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [currentStep, setCurrentStep] = useState<'define' | 'pairwise' | 'review'>('define');
  const [newCriterionName, setNewCriterionName] = useState('');
  const [newCriterionDescription, setNewCriterionDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [pairwiseComparisons, setPairwiseComparisons] = useState<Array<{i: number, j: number, value: number}>>([]);

  // 기본 기준 템플릿
  const criteriaTemplates = {
    technology: [
      { name: '기능성', description: '시스템이 제공하는 기능의 완성도와 유용성' },
      { name: '성능', description: '처리속도, 응답시간, 처리량 등의 성능 지표' },
      { name: '보안성', description: '데이터 보호, 접근 제어, 암호화 등의 보안 수준' },
      { name: '사용성', description: '사용자 인터페이스의 편의성과 직관성' },
      { name: '확장성', description: '향후 기능 추가나 규모 확장의 용이성' },
      { name: '비용', description: '도입비용, 운영비용, 유지보수 비용' }
    ],
    business: [
      { name: '수익성', description: '투자 대비 수익률과 매출 기여도' },
      { name: '시장성', description: '시장 규모와 성장 가능성' },
      { name: '실현가능성', description: '기술적, 자원적 실현 가능성' },
      { name: '위험도', description: '사업 추진 시 발생할 수 있는 위험 수준' },
      { name: '차별성', description: '경쟁사 대비 차별화 요소' },
      { name: '전략적 중요도', description: '회사 전략과의 연계성' }
    ],
    quality: [
      { name: '품질', description: '제품이나 서비스의 전반적인 품질 수준' },
      { name: '신뢰성', description: '일관된 성능과 오류 발생 빈도' },
      { name: '내구성', description: '장기간 사용 시의 품질 유지 정도' },
      { name: '디자인', description: '외관과 사용자 경험 디자인' },
      { name: '브랜드', description: '브랜드 인지도와 신뢰도' },
      { name: '서비스', description: '고객지원과 A/S 품질' }
    ]
  };

  useEffect(() => {
    if (onCriteriaChange) {
      onCriteriaChange(criteria.length);
    }
  }, [criteria, onCriteriaChange]);

  const addCriterion = () => {
    if (!newCriterionName.trim()) return;

    const newCriterion: Criterion = {
      id: Date.now().toString(),
      name: newCriterionName.trim(),
      description: newCriterionDescription.trim() || undefined,
      level: 1,
      order: criteria.length
    };

    setCriteria(prev => [...prev, newCriterion]);
    setNewCriterionName('');
    setNewCriterionDescription('');
  };

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    setCriteria(prev => prev.map(criterion => 
      criterion.id === id ? { ...criterion, ...updates } : criterion
    ));
  };

  const deleteCriterion = (id: string) => {
    setCriteria(prev => prev.filter(criterion => criterion.id !== id));
  };

  const applyTemplate = (templateKey: keyof typeof criteriaTemplates) => {
    const template = criteriaTemplates[templateKey];
    const newCriteria: Criterion[] = template.map((item, index) => ({
      id: Date.now().toString() + index,
      name: item.name,
      description: item.description,
      level: 1,
      order: index
    }));
    setCriteria(newCriteria);
    setShowBulkInput(false);
  };

  const handleBulkInput = () => {
    if (!bulkInputText.trim()) return;

    const lines = bulkInputText.split('\n').filter(line => line.trim());
    const newCriteria: Criterion[] = lines.map((line, index) => {
      const parts = line.split('|').map(part => part.trim());
      return {
        id: Date.now().toString() + index,
        name: parts[0],
        description: parts[1] || undefined,
        level: 1,
        order: criteria.length + index
      };
    });

    setCriteria(prev => [...prev, ...newCriteria]);
    setBulkInputText('');
    setShowBulkInput(false);
  };

  const handlePairwiseComplete = async () => {
    if (onSaveCriteria) {
      await onSaveCriteria(projectId, criteria);
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
            <h3 className="text-xl font-bold text-gray-900">평가 기준 정의</h3>
            <p className="text-gray-600 mt-1">의사결정에 사용할 기준들을 정의하세요</p>
          </div>
          <button
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            {showBulkInput ? '개별 입력' : '일괄 입력'}
          </button>
        </div>

        {/* 템플릿 선택 */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">템플릿 적용 (선택사항)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => applyTemplate('technology')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-blue-600">🔧 기술 평가</div>
              <div className="text-sm text-gray-600 mt-1">기능성, 성능, 보안성 등</div>
            </button>
            <button
              onClick={() => applyTemplate('business')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-blue-600">💼 사업 평가</div>
              <div className="text-sm text-gray-600 mt-1">수익성, 시장성, 실현가능성 등</div>
            </button>
            <button
              onClick={() => applyTemplate('quality')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-blue-600">⭐ 품질 평가</div>
              <div className="text-sm text-gray-600 mt-1">품질, 신뢰성, 내구성 등</div>
            </button>
          </div>
        </div>

        {showBulkInput ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                일괄 입력 (한 줄에 하나씩, 기준명|설명 형식)
              </label>
              <textarea
                value={bulkInputText}
                onChange={(e) => setBulkInputText(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`예시:\n가격|제품의 가격 경쟁력\n품질|제품의 전반적 품질 수준\n브랜드|브랜드 인지도와 신뢰성`}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">기준명 *</label>
                <input
                  type="text"
                  value={newCriterionName}
                  onChange={(e) => setNewCriterionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 가격, 품질, 성능 등"
                  onKeyPress={(e) => e.key === 'Enter' && addCriterion()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
                <input
                  type="text"
                  value={newCriterionDescription}
                  onChange={(e) => setNewCriterionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="기준에 대한 자세한 설명"
                  onKeyPress={(e) => e.key === 'Enter' && addCriterion()}
                />
              </div>
            </div>
            <button
              onClick={addCriterion}
              disabled={!newCriterionName.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              기준 추가
            </button>
          </div>
        )}
      </div>

      {/* 기준 목록 */}
      {criteria.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">정의된 기준 ({criteria.length}개)</h4>
          <div className="space-y-3">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  {editingId === criterion.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={criterion.name}
                        onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        onBlur={() => setEditingId(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setEditingId(null)}
                        autoFocus
                      />
                      <input
                        type="text"
                        value={criterion.description || ''}
                        onChange={(e) => updateCriterion(criterion.id, { description: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="설명"
                      />
                    </div>
                  ) : (
                    <div className="cursor-pointer" onClick={() => setEditingId(criterion.id)}>
                      <div className="font-medium text-gray-900">{criterion.name}</div>
                      {criterion.description && (
                        <div className="text-sm text-gray-600">{criterion.description}</div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteCriterion(criterion.id)}
                  className="ml-4 text-red-600 hover:text-red-800 text-sm"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {criteria.length >= 2 && (
        <div className="flex justify-end">
          <button
            onClick={() => setCurrentStep('pairwise')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            쌍대비교 진행하기
          </button>
        </div>
      )}
    </div>
  );

  const renderPairwiseStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentStep('define')}
          className="text-blue-600 hover:text-blue-700"
        >
          ← 기준 정의로 돌아가기
        </button>
        <div className="text-sm text-gray-600">
          단계 2/3: 기준 간 중요도 비교
        </div>
      </div>

      <EnhancedPairwiseGrid
        elements={criteria.map(c => ({ id: c.id, name: c.name, description: c.description }))}
        onComparisonChange={setPairwiseComparisons}
        title={`${projectTitle} - 기준 중요도 비교`}
      />

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep('define')}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          이전 단계
        </button>
        <button
          onClick={handlePairwiseComplete}
          disabled={pairwiseComparisons.length === 0}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          완료하기
        </button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">기준 설정 완료! 🎉</h3>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-green-800">설정된 기준</h4>
          <ul className="mt-2 space-y-1">
            {criteria.map((criterion, index) => (
              <li key={criterion.id} className="text-green-700">
                {index + 1}. {criterion.name}
                {criterion.description && (
                  <span className="text-green-600 text-sm ml-2">- {criterion.description}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">다음 단계</h4>
          <p className="text-blue-700 text-sm">
            이제 대안(선택지)을 정의하고 각 기준에 대해 대안들을 평가할 수 있습니다.
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleComplete}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            다음 단계로 진행
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{projectTitle} - 평가 기준 설정</h2>
          <div className="text-sm text-gray-600">
            {currentStep === 'define' && '1/3'}
            {currentStep === 'pairwise' && '2/3'}
            {currentStep === 'review' && '3/3'}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <div className={`flex-1 h-2 rounded-full ${
            ['define', 'pairwise', 'review'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'
          }`} />
          <div className={`flex-1 h-2 rounded-full ${
            ['pairwise', 'review'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200'
          }`} />
          <div className={`flex-1 h-2 rounded-full ${
            currentStep === 'review' ? 'bg-blue-600' : 'bg-gray-200'
          }`} />
        </div>
      </div>

      {/* Content */}
      {currentStep === 'define' && renderDefineStep()}
      {currentStep === 'pairwise' && renderPairwiseStep()}
      {currentStep === 'review' && renderReviewStep()}
    </div>
  );
};

export default EnhancedCriteriaManagement;