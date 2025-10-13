import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import HierarchyTreeVisualization from '../common/HierarchyTreeVisualization';
import BulkCriteriaInput from '../criteria/BulkCriteriaInput';
import apiService from '../../services/apiService';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  level: number;
  children?: Criterion[];
  weight?: number;
}

interface CriteriaManagementProps {
  projectId: string;
  projectTitle?: string;
  onComplete: () => void;
  onCriteriaChange?: (criteriaCount: number) => void;
}

const CriteriaManagement: React.FC<CriteriaManagementProps> = ({ projectId, projectTitle, onComplete, onCriteriaChange }) => {
  // DEMO_CRITERIA와 DEMO_SUB_CRITERIA를 조합하여 완전한 계층구조 생성
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [showHelp, setShowHelp] = useState(false);
  const [showBulkInput, setShowBulkInput] = useState(false);

  useEffect(() => {
    // 백엔드에서 실제 프로젝트별 기준 데이터 로드
    const loadProjectCriteria = async () => {
      try {
        const response = await apiService.criteriaAPI.fetch(Number(projectId));
        if (response.data) {
          const criteriaData = (response.data as any).criteria || response.data || [];
          setCriteria(criteriaData);
          console.log(`Loaded ${criteriaData.length} criteria from API for project ${projectId}`);
        } else {
          setCriteria([]);
          console.log(`No criteria found for project ${projectId}`);
        }
      } catch (error) {
        console.error('Failed to load criteria from API:', error);
        // No localStorage fallback - rely on server session only
        setCriteria([]);
        console.log(`No criteria found for project ${projectId} - server only`);
      }
    };

    if (projectId) {
      loadProjectCriteria();
    }
  }, [projectId]);

  // 기준이 변경될 때마다 부모 컴포넌트에 개수 알림
  useEffect(() => {
    const totalCount = getAllCriteria(criteria).length;
    if (onCriteriaChange) {
      onCriteriaChange(totalCount);
    }
  }, [criteria, onCriteriaChange]);

  const [evaluationMethod, setEvaluationMethod] = useState<'pairwise' | 'direct'>('pairwise');
  const [newCriterion, setNewCriterion] = useState({ name: '', description: '', parentId: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 프로젝트별 기준 데이터는 API 호출 시 자동으로 PostgreSQL에 저장됨
  const saveProjectCriteria = (criteriaData: Criterion[]) => {
    console.log(`Criteria automatically saved to PostgreSQL via Django session for project ${projectId}`);
    // All data is persisted through Django session and PostgreSQL
  };

  const validateCriterion = (name: string): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '기준명을 입력해주세요.';
    } else if (name.length < 2) {
      newErrors.name = '기준명은 2자 이상이어야 합니다.';
    } else {
      // Check for duplicate names
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

  // 시각화를 위한 평면 배열 생성
  const getFlatCriteriaForVisualization = (criteriaList: Criterion[]): Criterion[] => {
    const flat: Criterion[] = [];
    const traverse = (items: Criterion[], parentLevel: number = 0) => {
      items.forEach(item => {
        // 아이템의 실제 레벨 사용 (저장된 레벨이 있으면 사용, 없으면 부모 레벨 + 1)
        const actualLevel = item.level || (parentLevel + 1);
        
        // 평면 배열에 추가 (children 제거)
        flat.push({
          id: item.id,
          name: item.name,
          description: item.description,
          parent_id: item.parent_id,
          level: actualLevel,
          weight: item.weight
        });
        
        // 하위 항목이 있으면 재귀적으로 처리
        if (item.children && item.children.length > 0) {
          traverse(item.children, actualLevel);
        }
      });
    };
    traverse(criteriaList);
    return flat;
  };

  const handleAddCriterion = async () => {
    if (!validateCriterion(newCriterion.name)) {
      return;
    }

    // 부모가 있으면 부모 레벨 + 1, 없으면 1레벨
    let level = 1;
    if (newCriterion.parentId) {
      const parent = getAllCriteria(criteria).find(c => c.id === newCriterion.parentId);
      level = parent ? parent.level + 1 : 2;
    }
    
    // 최대 5레벨까지만 허용
    if (level > 5) {
      setErrors({ name: '최대 5단계까지만 기준을 생성할 수 있습니다.' });
      return;
    }
    
    const criterionData = {
      project_id: Number(projectId),
      name: newCriterion.name,
      description: newCriterion.description || null,
      parent_id: newCriterion.parentId ? Number(newCriterion.parentId) : null,
      level,
      order_index: getAllCriteria(criteria).filter(c => c.level === level).length + 1
    };

    try {
      const response = await apiService.criteriaAPI.create(criterionData);
      
      if (response.error) {
        setErrors({ name: response.error });
        return;
      }

      // 성공 시 데이터 다시 로드
      const updatedResponse = await apiService.criteriaAPI.fetch(Number(projectId));
      if (updatedResponse.data) {
        const criteriaData = (updatedResponse.data as any).criteria || updatedResponse.data || [];
        setCriteria(criteriaData);
      }
      
      setNewCriterion({ name: '', description: '', parentId: '' });
      setErrors({});
      console.log('✅ 기준이 PostgreSQL에 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save criterion to API:', error);
      setErrors({ name: '기준 저장 중 오류가 발생했습니다.' });
    }
  };

  const handleDeleteCriterion = async (id: string) => {
    console.log('기준 삭제:', id);
    
    try {
      const response = await apiService.criteriaAPI.delete(id);
      
      if (response.error) {
        console.error('Failed to delete criterion:', response.error);
        return;
      }

      // 성공 시 데이터 다시 로드
      const updatedResponse = await apiService.criteriaAPI.fetch(Number(projectId));
      if (updatedResponse.data) {
        const criteriaData = (updatedResponse.data as any).criteria || updatedResponse.data || [];
        setCriteria(criteriaData);
      }
      
      console.log('✅ 기준이 PostgreSQL에서 삭제되었습니다:', id);
    } catch (error) {
      console.error('Failed to delete criterion from API:', error);
    }
  };


  // 상위 기준으로 선택 가능한 모든 기준 (최대 4레벨까지, 5레벨을 만들기 위해)
  const getAvailableParentCriteria = () => {
    const flatCriteria = getAllCriteria(criteria);
    // 최대 4레벨까지만 상위 기준으로 선택 가능 (5레벨까지 지원)
    return flatCriteria.filter(c => c.level <= 4);
  };

  // 레벨별 표시 아이콘 (최소화)
  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1: return 'G'; // Goal
      case 2: return 'C'; // Criteria
      case 3: return 'A'; // Alternatives
      case 4: return 'S'; // Sub-criteria
      case 5: return 'D'; // Detailed criteria
      default: return 'L';
    }
  };

  // 레벨별 명칭 반환
  const getLevelName = (level: number) => {
    switch (level) {
      case 1: return '목표(Goal)';
      case 2: return '기준(Criteria)';
      case 3: return '대안(Alternatives)';
      case 4: return '하위기준(Sub-criteria)';
      case 5: return '세부기준(Detailed)';
      default: return `레벨 ${level}`;
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('경고: 모든 기준 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      try {
        // 모든 기준을 PostgreSQL에서 삭제
        for (const criterion of criteria) {
          await apiService.criteriaAPI.delete(criterion.id);
        }
        
        setCriteria([]);
        setNewCriterion({ name: '', description: '', parentId: '' });
        setErrors({});
        console.log('✅ 모든 기준이 PostgreSQL에서 삭제되었습니다.');
      } catch (error) {
        console.error('Failed to clear all criteria:', error);
        alert('❌ 데이터 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleLoadTemplateData = async () => {
    if (criteria.length > 0) {
      if (!window.confirm('⚠️ 기존 데이터가 있습니다. 템플릿으로 교체하시겠습니까?')) {
        return;
      }
    }
    
    // 기본 AHP 템플릿 구조
    const templateCriteria = [
      {
        project_id: Number(projectId),
        name: '프로젝트 목표',
        description: '최종 달성하고자 하는 목표를 입력하세요',
        parent_id: null,
        level: 1,
        order_index: 1
      },
      {
        project_id: Number(projectId),
        name: '기준 1',
        description: '첫 번째 평가 기준',
        parent_id: null,
        level: 2,
        order_index: 1
      },
      {
        project_id: Number(projectId),
        name: '기준 2', 
        description: '두 번째 평가 기준',
        parent_id: null,
        level: 2,
        order_index: 2
      }
    ];
    
    try {
      // 기존 데이터 삭제 후 템플릿 생성
      for (const criterion of criteria) {
        await apiService.criteriaAPI.delete(criterion.id);
      }
      
      // 템플릿 데이터 생성
      for (const criterionData of templateCriteria) {
        await apiService.criteriaAPI.create(criterionData);
      }
      
      // 데이터 다시 로드
      const response = await apiService.criteriaAPI.fetch(Number(projectId));
      if (response.data) {
        const criteriaData = (response.data as any).criteria || response.data || [];
        setCriteria(criteriaData);
      }
      
      setNewCriterion({ name: '', description: '', parentId: '' });
      setErrors({});
      alert('✅ 기본 템플릿이 PostgreSQL에 저장되었습니다.');
    } catch (error) {
      console.error('Failed to load template data:', error);
      alert('❌ 템플릿 로드 중 오류가 발생했습니다.');
    }
  };

  const handleBulkImport = async (importedCriteria: Criterion[]) => {
    try {
      // 가져온 기준들을 PostgreSQL에 저장
      for (const criterion of importedCriteria) {
        const criterionData = {
          project_id: Number(projectId),
          name: criterion.name,
          description: criterion.description || null,
          parent_id: criterion.parent_id ? Number(criterion.parent_id) : null,
          level: criterion.level,
          order_index: criterion.level
        };
        
        await apiService.criteriaAPI.create(criterionData);
      }
      
      // 데이터 다시 로드
      const response = await apiService.criteriaAPI.fetch(Number(projectId));
      if (response.data) {
        const criteriaData = (response.data as any).criteria || response.data || [];
        setCriteria(criteriaData);
      }
      
      setShowBulkInput(false);
      
      // 성공 메시지
      const count = getAllCriteria(importedCriteria).length;
      alert(`✅ ${count}개의 기준이 PostgreSQL에 저장되었습니다.`);
    } catch (error) {
      console.error('Failed to bulk import criteria:', error);
      alert('❌ 일괄 가져오기 중 오류가 발생했습니다.');
    }
  };

  const renderHelpModal = () => {
    if (!showHelp) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'var(--modal-backdrop)' }}>
        <div className="rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto" style={{ backgroundColor: 'var(--modal-bg)', boxShadow: 'var(--shadow-2xl)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>📚 기준 설정 도움말</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-xl transition-colors" style={{ color: 'var(--text-muted)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--status-info-text)' }}>🎯 AHP 기준 계층구조란?</h4>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                AHP(Analytic Hierarchy Process)에서 기준 계층구조는 의사결정 문제를 체계적으로 분해하여 
                상위 목표부터 세부 기준까지 단계별로 구성하는 구조입니다.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--status-success-text)' }}>📊 AHP 5단계 계층구조</h4>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li><strong>🎯 Level 1 (목표):</strong> 최종 의사결정 목표</li>
                <li><strong>📋 Level 2 (기준):</strong> 주요 평가 영역 (3-7개 권장)</li>
                <li><strong>🎪 Level 3 (대안):</strong> 선택 가능한 대안들 (표준 AHP)</li>
                <li><strong>📝 Level 4 (하위기준):</strong> 세분화된 평가 기준</li>
                <li><strong>🔹 Level 5 (세부기준):</strong> 최상세 수준 기준</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--accent-secondary)' }}>🔄 레이아웃 모드</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--status-info-bg)', border: '1px solid var(--status-info-border)' }}>
                  <div className="font-medium" style={{ color: 'var(--status-info-text)' }}>📋 세로형</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>계층구조를 세로로 표시, 상세 정보 확인에 적합</div>
                </div>
                <div className="p-3 rounded" style={{ backgroundColor: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)' }}>
                  <div className="font-medium" style={{ color: 'var(--status-success-text)' }}>📊 가로형</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>계층구조를 가로로 표시, 전체 구조 파악에 적합</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--status-danger-text)' }}>⚠️ 주의사항</h4>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>기준명은 중복될 수 없습니다</li>
                <li>기존 데이터를 삭제하면 복구할 수 없습니다</li>
                <li>너무 많은 기준(9개 이상)은 평가의 일관성을 떨어뜨릴 수 있습니다</li>
                <li>평가방법(쌍대비교/직접입력)은 신중히 선택하세요</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--status-warning-text)' }}>💡 실무 팁</h4>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--text-secondary)' }}>
                <li>기준 설명을 명확히 작성하여 평가자의 이해를 돕습니다</li>
                <li>비슷한 성격의 기준들은 하나의 상위 기준으로 그룹화하세요</li>
                <li>측정 가능한 기준과 주관적 기준을 적절히 균형있게 구성하세요</li>
                <li>🗑️ 버튼으로 개별 기준을 삭제할 수 있습니다</li>
                <li>📝 기본 템플릿을 활용하여 빠르게 시작할 수 있습니다</li>
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
      <Card title="2-1단계 — 기준추가">
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg p-4" style={{ backgroundColor: 'var(--status-info-bg)', border: '1px solid var(--status-info-border)' }}>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--status-info-text)' }}>📋 프로젝트 기준 설정 가이드</h4>
              <ul className="text-sm space-y-1" style={{ color: 'var(--status-info-text)' }}>
                <li>• 프로젝트 목표에 맞는 평가 기준을 계층적으로 구성</li>
                <li>• 1레벨(목표) → 2레벨(기준) → 3레벨(대안) 순서로 추가</li>
                <li>• 기준명은 중복될 수 없으며, 최대 5단계까지 세분화 가능</li>
                <li>• 개별 기준 삭제는 🗑️ 버튼을 클릭하여 수행</li>
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
              {criteria.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearAllData}
                  className="transition-all duration-200" 
                  style={{ color: 'var(--status-danger-text)', borderColor: 'var(--status-danger-border)' }} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--status-danger-bg)'} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  🗑️ 모든 데이터 삭제
                </Button>
              )}
            </div>
          </div>

          {/* Evaluation Method Selection */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
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
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>쌍대비교</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="direct"
                  checked={evaluationMethod === 'direct'}
                  onChange={(e) => setEvaluationMethod(e.target.value as 'direct')}
                  className="mr-2"
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>직접입력</span>
              </label>
            </div>
          </div>

          {/* Current Criteria Tree Visualization */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>🌳 기준 계층구조 시각화</h4>
              <div className="flex items-center space-x-2">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>표시 방식:</span>
                <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                  <button
                    onClick={() => setLayoutMode('vertical')}
                    className="px-3 py-1 text-xs rounded-md transition-colors"
                    style={{
                      backgroundColor: layoutMode === 'vertical' ? 'var(--status-info-text)' : 'transparent',
                      color: layoutMode === 'vertical' ? 'white' : 'var(--text-muted)'
                    }}
                    onMouseEnter={(e) => {
                      if (layoutMode !== 'vertical') {
                        e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (layoutMode !== 'vertical') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    📋 세로형
                  </button>
                  <button
                    onClick={() => setLayoutMode('horizontal')}
                    className="px-3 py-1 text-xs rounded-md transition-colors"
                    style={{
                      backgroundColor: layoutMode === 'horizontal' ? 'var(--status-success-text)' : 'transparent',
                      color: layoutMode === 'horizontal' ? 'white' : 'var(--text-muted)'
                    }}
                    onMouseEnter={(e) => {
                      if (layoutMode !== 'horizontal') {
                        e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (layoutMode !== 'horizontal') {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    📊 가로형
                  </button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLoadTemplateData}
                  className="transition-all duration-200 ml-2" 
                  style={{ color: 'var(--status-info-text)', borderColor: 'var(--status-info-border)' }} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--status-info-bg)'} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  📝 기본 템플릿
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowBulkInput(true)}
                  className="transition-all duration-200 ml-2" 
                  style={{ color: 'var(--status-success-text)', borderColor: 'var(--status-success-border)' }} 
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--status-success-bg)'} 
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  🗂️ 일괄 입력
                </Button>
                {criteria.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearAllData}
                    className="transition-all duration-200" 
                    style={{ color: 'var(--status-danger-text)', borderColor: 'var(--status-danger-border)' }} 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--status-danger-bg)'} 
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    🗑️ 초기화
                  </Button>
                )}
              </div>
            </div>
            <HierarchyTreeVisualization
              nodes={getFlatCriteriaForVisualization(criteria)}
              title={`${projectTitle || 'AHP 프로젝트'} 기준 계층구조`}
              showWeights={true}
              interactive={true}
              layout={layoutMode}
              onLayoutChange={setLayoutMode}
              onNodeClick={(node) => {
                console.log('선택된 기준:', node);
                // 추후 편집 모드 구현 가능
              }}
              onNodeDelete={(node) => {
                // TreeNode를 id로 변환하여 삭제 함수 호출
                handleDeleteCriterion(node.id);
              }}
              allowDelete={true}
            />
          </div>

          {/* Add New Criterion */}
          <div className="pt-6" style={{ borderTop: '1px solid var(--border-light)' }}>
            <h4 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>➕ 새 기준 추가</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  상위 기준
                </label>
                <select
                  value={newCriterion.parentId}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: 'var(--input-bg)', 
                    color: 'var(--text-primary)', 
                    border: '1px solid var(--input-border)',
                    borderRadius: 'var(--radius-md)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-primary)';
                    e.target.style.boxShadow = '0 0 0 2px var(--accent-focus)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--input-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">🎯 최상위 기준 (목표)</option>
                  {getAvailableParentCriteria().map(criterion => (
                    <option key={criterion.id} value={criterion.id}>
                      {getLevelIcon(criterion.level)} {criterion.name} ({getLevelName(criterion.level)})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                id="criterionName"
                label="기준명"
                placeholder="기준명을 입력하세요"
                value={newCriterion.name}
                onChange={(value) => setNewCriterion(prev => ({ ...prev, name: value }))}
                error={errors.name}
                required
              />

              <Input
                id="criterionDescription"
                label="기준 설명 (선택)"
                placeholder="기준에 대한 설명"
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

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6" style={{ borderTop: '1px solid var(--border-light)' }}>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              총 {getAllCriteria(criteria).length}개 기준 (
              {[1,2,3,4,5].map(level => {
                const count = getAllCriteria(criteria).filter(c => c.level === level).length;
                return count > 0 ? `L${level}: ${count}개` : null;
              }).filter(Boolean).join(', ') || '없음'}
              ) | 평가방법: {evaluationMethod === 'pairwise' ? '쌍대비교' : '직접입력'}
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary">
                저장
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

      {/* Bulk Criteria Input Modal */}
      {showBulkInput && (
        <BulkCriteriaInput
          onImport={handleBulkImport}
          onCancel={() => setShowBulkInput(false)}
          existingCriteria={criteria}
        />
      )}
    </div>
  );
};

export default CriteriaManagement;