import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import HierarchyTreeVisualization from '../common/HierarchyTreeVisualization';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  level: number;
  children?: Criterion[];
  weight?: number;
}

interface ProductionCriteriaManagementProps {
  projectId: string;
  onComplete: () => void;
}

const ProductionCriteriaManagement: React.FC<ProductionCriteriaManagementProps> = ({ 
  projectId, 
  onComplete 
}) => {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [showHelp, setShowHelp] = useState(false);
  const [evaluationMethod, setEvaluationMethod] = useState<'pairwise' | 'direct'>('pairwise');
  const [newCriterion, setNewCriterion] = useState({ name: '', description: '', parentId: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 실제 서비스용 - 빈 상태로 시작
  useEffect(() => {
    setCriteria([]);
  }, [projectId]);

  const validateCriterion = (name: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '기준명을 입력해주세요.';
    } else if (name.length < 2) {
      newErrors.name = '기준명은 2자 이상이어야 합니다.';
    } else {
      const allCriteria = getAllCriteria(criteria);
      if (allCriteria.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        newErrors.name = '동일한 기준명이 이미 존재합니다.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAllCriteria = (criteriaList: Criterion[]): Criterion[] => {
    const all: Criterion[] = [];
    const traverse = (items: Criterion[]) => {
      items.forEach(item => {
        all.push(item);
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(criteriaList);
    return all;
  };

  const handleAddCriterion = () => {
    if (!validateCriterion(newCriterion.name)) {
      return;
    }

    const newId = Date.now().toString();
    const level = newCriterion.parentId ? 2 : 1;
    
    const criterion: Criterion = {
      id: newId,
      name: newCriterion.name,
      description: newCriterion.description,
      parent_id: newCriterion.parentId || null,
      level
    };

    if (newCriterion.parentId) {
      // Add as child
      setCriteria(prev => prev.map(c => {
        if (c.id === newCriterion.parentId) {
          return {
            ...c,
            children: [...(c.children || []), criterion]
          };
        }
        return c;
      }));
    } else {
      // Add as top-level criterion
      setCriteria(prev => [...prev, criterion]);
    }

    setNewCriterion({ name: '', description: '', parentId: '' });
    setErrors({});
  };

  const handleDeleteCriterion = (id: string) => {
    if (window.confirm('이 기준을 삭제하시겠습니까? 하위 기준도 함께 삭제됩니다.')) {
      setCriteria(prev => {
        const filter = (items: Criterion[]): Criterion[] => {
          return items.filter(item => {
            if (item.id === id) return false;
            if (item.children) {
              item.children = filter(item.children);
            }
            return true;
          });
        };
        return filter(prev);
      });
    }
  };

  const getTopLevelCriteria = () => criteria.filter(c => c.level === 1);

  const handleClearAllData = () => {
    if (window.confirm('⚠️ 모든 기준 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      setCriteria([]);
      setNewCriterion({ name: '', description: '', parentId: '' });
      setErrors({});
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-4xl mb-4">🌳</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">기준을 추가해주세요</h3>
      <p className="text-gray-600 mb-4">
        의사결정에 사용할 평가 기준들을 추가하여 계층구조를 만들어보세요.
      </p>
      <div className="space-y-2 text-sm text-gray-500">
        <p>💡 팁: 먼저 상위 기준(주요 평가 영역)을 추가한 후</p>
        <p>각 상위 기준의 세부 기준들을 추가하세요.</p>
      </div>
    </div>
  );

  const renderHelpModal = () => {
    if (!showHelp) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">📚 기준 설정 도움말</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">🎯 평가 기준이란?</h4>
              <p className="text-gray-700 leading-relaxed">
                의사결정에서 대안들을 비교 평가할 때 사용하는 척도입니다. 
                예: 비용, 성능, 사용성, 안정성 등
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-green-900 mb-2">📊 계층구조 구성법</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>1단계:</strong> 주요 평가 영역 정의 (3-7개 권장)</li>
                <li><strong>2단계:</strong> 각 영역의 세부 기준 추가</li>
                <li><strong>3단계:</strong> 필요시 더 세분화</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-purple-900 mb-2">💡 실용적인 예시</h4>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-medium mb-2">예: 직원 채용 시</p>
                <ul className="text-xs space-y-1">
                  <li>• 역량 → 기술력, 경험, 학습능력</li>
                  <li>• 적합성 → 팀워크, 문화적합성, 커뮤니케이션</li>
                  <li>• 조건 → 급여, 근무시간, 출퇴근</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-red-900 mb-2">⚠️ 주의사항</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>기준명은 명확하고 구체적으로 작성</li>
                <li>비슷한 의미의 기준은 통합 고려</li>
                <li>너무 많은 기준(9개 초과)은 비교를 어렵게 함</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={() => setShowHelp(false)}>
              확인
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderHelpModal()}
      <Card title="기준 설정">
        <div className="space-y-6">
          {/* 가이드 섹션 */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">📋 기준 설정 단계</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 1단계: 주요 평가 영역(상위 기준) 추가</li>
                <li>• 2단계: 각 영역별 세부 기준 추가</li>
                <li>• 3단계: 평가 방법 선택</li>
              </ul>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowHelp(true)}
              >
                📚 도움말
              </Button>
            </div>
          </div>

          {/* 평가방법 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              평가방법 선택
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pairwise"
                  checked={evaluationMethod === 'pairwise'}
                  onChange={(e) => setEvaluationMethod(e.target.value as 'pairwise')}
                  className="mr-2"
                />
                <span className="text-sm">쌍대비교 (권장)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="direct"
                  checked={evaluationMethod === 'direct'}
                  onChange={(e) => setEvaluationMethod(e.target.value as 'direct')}
                  className="mr-2"
                />
                <span className="text-sm">직접입력</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              쌍대비교: 기준들을 둘씩 비교하여 상대적 중요도 결정 (정확도 높음)
            </p>
          </div>

          {/* 기준 계층구조 시각화 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">🌳 현재 기준 구조</h4>
              {criteria.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">표시:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setLayoutMode('vertical')}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        layoutMode === 'vertical' 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      📋 세로
                    </button>
                    <button
                      onClick={() => setLayoutMode('horizontal')}
                      className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        layoutMode === 'horizontal' 
                          ? 'bg-green-500 text-white' 
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      📊 가로
                    </button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearAllData}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    🗑️ 전체 삭제
                  </Button>
                </div>
              )}
            </div>

            {criteria.length === 0 ? renderEmptyState() : (
              <HierarchyTreeVisualization
                nodes={criteria}
                title={`프로젝트 기준 구조`}
                showWeights={false}
                interactive={true}
                layout={layoutMode}
                onLayoutChange={setLayoutMode}
                onNodeClick={(node) => {
                  if (window.confirm(`"${node.name}" 기준을 삭제하시겠습니까?`)) {
                    handleDeleteCriterion(node.id);
                  }
                }}
              />
            )}
          </div>

          {/* 새 기준 추가 */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-4">➕ 새 기준 추가</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상위 기준
                </label>
                <select
                  value={newCriterion.parentId}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">최상위 기준 (주요 영역)</option>
                  {getTopLevelCriteria().map(criterion => (
                    <option key={criterion.id} value={criterion.id}>
                      {criterion.name}의 세부 기준
                    </option>
                  ))}
                </select>
              </div>

              <Input
                id="criterionName"
                label="기준명"
                placeholder="예: 성능, 비용, 사용성"
                value={newCriterion.name}
                onChange={(value) => setNewCriterion(prev => ({ ...prev, name: value }))}
                error={errors.name}
                required
              />

              <Input
                id="criterionDescription"
                label="기준 설명 (선택)"
                placeholder="이 기준에 대한 설명"
                value={newCriterion.description}
                onChange={(value) => setNewCriterion(prev => ({ ...prev, description: value }))}
              />
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={handleAddCriterion} variant="primary">
                기준 추가
              </Button>
            </div>
          </div>

          {/* 진행 상황 및 액션 버튼 */}
          <div className="flex justify-between items-center pt-6 border-t">
            <div className="text-sm text-gray-600">
              총 {getAllCriteria(criteria).length}개 기준 | 평가방법: {evaluationMethod === 'pairwise' ? '쌍대비교' : '직접입력'}
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary">
                임시 저장
              </Button>
              <Button
                variant="primary"
                onClick={onComplete}
                disabled={criteria.length === 0}
              >
                다음 단계로
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductionCriteriaManagement;