import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Input from '../common/Input';
import HierarchyTreeVisualization from '../common/HierarchyTreeVisualization';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import HierarchyTreeBuilder from '../modeling/HierarchyTreeBuilder';
import BulkCriteriaInput from '../criteria/BulkCriteriaInput';
import CriteriaTemplates from '../criteria/CriteriaTemplates';
import VisualCriteriaBuilder from '../criteria/VisualCriteriaBuilder';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import InteractiveCriteriaEditor from '../criteria/InteractiveCriteriaEditor';
import cleanDataService from '../../services/dataService_clean';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  level: number;
  order?: number;
  children?: Criterion[];
  weight?: number;
  type?: 'criteria';
}

interface CriteriaManagementProps {
  projectId: string;
  projectTitle?: string;
  onCriteriaChange: (count: number) => void;
  onComplete?: () => void;
}

const CriteriaManagement: React.FC<CriteriaManagementProps> = ({ 
  projectId, 
  onCriteriaChange, 
  onComplete 
}) => {
  // 현재 작업 중인 기준 (화면 표시용)
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  // 백엔드에 저장된 기준
  const [savedCriteria, setSavedCriteria] = useState<Criterion[]>([]);
  // 임시 저장된 기준 (템플릿/일괄입력 등에서 온 데이터)
  const [tempCriteria, setTempCriteria] = useState<Criterion[]>([]);
  // 임시 변경사항 있는지 여부
  const [hasTempChanges, setHasTempChanges] = useState(false);
  
  // 템플릿 기본값 판별 함수들
  const isTemplateName = (name: string): boolean => {
    return /^(기준|하위기준|세부기준)\s*\d+(-\d+)*$/.test(name);
  };
  
  const isTemplateDescription = (description?: string): boolean => {
    if (!description) return false;
    return description === '세 번째 평가 기준' || 
           description === '상세 평가 항목' || 
           description.includes('번째 평가 기준') || 
           description === '평가 항목';
  };

  // UI 상태
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [activeInputMode, setActiveInputMode] = useState<'template' | 'bulk' | 'visual' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [editMode, setEditMode] = useState(false);
  
  // 인라인 편집 상태
  const [editingCriteria, setEditingCriteria] = useState<{[key: string]: {name: string, description: string}}>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [draggedItem, setDraggedItem] = useState<Criterion | null>(null);

  // 백엔드에서 기준 로드
  const loadCriteria = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedCriteria = await cleanDataService.getCriteria(projectId);
      
      console.log('🔍 백엔드에서 로드된 기준 데이터:', loadedCriteria);
      
      // parent_id, parent, level, order 필드 정규화
      const normalizedCriteria = (loadedCriteria || []).map((c, index) => {
        // 백엔드에서 parent 또는 parent_id 필드 모두 처리
        const parentId = c.parent || c.parent_id || null;
        
        return {
          id: c.id || `criterion_${Date.now()}_${index}`,
          name: c.name,
          description: c.description,
          parent_id: parentId,
          level: c.level || 1,
          order: c.order || c.position || index + 1,
          weight: c.weight || 1,
          type: 'criteria' as const,
          children: []
        };
      });
      
      console.log('🔄 정규화된 기준 데이터:', normalizedCriteria);
      
      // 계층 구조 구성
      const hierarchicalCriteria = buildHierarchy(normalizedCriteria);
      
      console.log('🌳 구성된 계층구조:', hierarchicalCriteria);
      
      setCriteria(hierarchicalCriteria);
      setSavedCriteria(hierarchicalCriteria);
      setTempCriteria([]);
      setHasTempChanges(false);
    } catch (error) {
      console.error('기준 로드 실패:', error);
      setCriteria([]);
      setSavedCriteria([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // 계층 구조 구성
  const buildHierarchy = (flatCriteria: Criterion[]): Criterion[] => {
    console.log('🔨 계층구조 구성 시작:', flatCriteria);
    
    const criteriaMap = new Map<string, Criterion>();
    const rootCriteria: Criterion[] = [];

    // 모든 기준을 맵에 저장
    flatCriteria.forEach(criterion => {
      criteriaMap.set(criterion.id, { ...criterion, children: [] });
    });

    console.log('📋 기준 맵 생성 완료:', Array.from(criteriaMap.keys()));

    // 계층 구조 구성
    flatCriteria.forEach(criterion => {
      const criterionObj = criteriaMap.get(criterion.id)!;
      
      // parent_id가 있고 해당 부모가 맵에 존재하는 경우
      if (criterion.parent_id && criteriaMap.has(criterion.parent_id)) {
        const parent = criteriaMap.get(criterion.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(criterionObj);
          console.log(`🔗 자식 연결: ${criterionObj.name} → ${parent.name}`);
        }
      } else {
        // 부모가 없거나 레벨 1인 경우 루트로 처리
        rootCriteria.push(criterionObj);
        console.log(`🌳 루트 기준: ${criterionObj.name} (level: ${criterionObj.level})`);
      }
    });

    // 각 레벨에서 order로 정렬
    const sortByOrder = (items: Criterion[]) => {
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          sortByOrder(item.children);
        }
      });
    };
    
    sortByOrder(rootCriteria);
    
    console.log('✅ 계층구조 구성 완료:', rootCriteria);
    return rootCriteria;
  };

  // 평면 구조로 변환
  const flattenCriteria = (hierarchicalCriteria: Criterion[]): Criterion[] => {
    const result: Criterion[] = [];
    
    const traverse = (items: Criterion[], parentId: string | null = null, level: number = 1) => {
      items.forEach((item, index) => {
        result.push({
          ...item,
          parent_id: parentId,
          level: level,
          order: index + 1,
          children: undefined // children 필드 제거
        });
        
        if (item.children && item.children.length > 0) {
          traverse(item.children, item.id, level + 1);
        }
      });
    };
    
    traverse(hierarchicalCriteria);
    return result;
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (projectId) {
      loadCriteria();
    }
  }, [projectId, loadCriteria]);

  // 저장된 기준 개수가 변경되면 부모 컴포넌트에 알림
  useEffect(() => {
    const count = flattenCriteria(savedCriteria).length;
    onCriteriaChange(count);
  }, [savedCriteria, onCriteriaChange]);

  // 초기화
  const handleReset = async () => {
    if (window.confirm('모든 기준을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        setIsLoading(true);
        
        // Django 백엔드에서 모든 기준 삭제
        const existingCriteria = await cleanDataService.getCriteria(projectId);
        for (const criterion of existingCriteria) {
          if (criterion.id) {
            await cleanDataService.deleteCriteria(projectId, criterion.id);
          }
        }
        
        // 로컬 상태 초기화
        setCriteria([]);
        setSavedCriteria([]);
        setTempCriteria([]);
        setHasTempChanges(false);
        setEditingIds(new Set());
        
        alert('모든 기준이 초기화되었습니다.');
      } catch (error) {
        console.error('기준 초기화 실패:', error);
        alert('기준 초기화 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 기준 저장
  const handleSaveCriteria = async () => {
    // 임시 변경사항이 있으면 임시 기준을 저장, 아니면 현재 기준을 저장
    const criteriaToSave = hasTempChanges ? tempCriteria : criteria;
    const flatCriteria = flattenCriteria(criteriaToSave);
    
    if (flatCriteria.length === 0) {
      alert('저장할 기준이 없습니다.');
      return;
    }

    setIsSaving(true);
    try {
      // 기존 기준 모두 삭제
      const existingCriteria = await cleanDataService.getCriteria(projectId);
      for (const criterion of existingCriteria) {
        if (criterion.id) {
          await cleanDataService.deleteCriteria(projectId, criterion.id);
        }
      }
      
      // 새로운 기준 저장
      let success = true;
      const createdCriteriaMap = new Map<string, any>(); // 원본 ID -> 생성된 기준 매핑
      
      // 계층 구조 순서대로 정렬 (부모부터 자식 순으로)
      const sortedCriteria = flatCriteria.sort((a, b) => a.level - b.level);
      
      for (const criterion of sortedCriteria) {
        const criteriaData = {
          project_id: projectId,
          project: projectId,
          name: criterion.name,
          description: criterion.description || '',
          level: criterion.level || 1,
          order: criterion.order || 0,
          position: criterion.order || 0,
          weight: criterion.weight || 1,
          type: 'criteria' as const,
          // parent 필드는 실제 생성된 부모 기준의 ID를 사용
          ...(criterion.parent_id 
            ? (createdCriteriaMap.has(criterion.parent_id) 
              ? { parent: createdCriteriaMap.get(criterion.parent_id).id, parent_id: createdCriteriaMap.get(criterion.parent_id).id }
              : { parent: criterion.parent_id, parent_id: criterion.parent_id })
            : { parent: null, parent_id: null })
        };
        
        console.log('💾 저장할 기준 데이터:', {
          name: criteriaData.name,
          level: criteriaData.level,
          parent_id: criterion.parent_id,
          parent: criteriaData.parent,
          originalId: criterion.id
        });
        
        const result = await cleanDataService.createCriteria(criteriaData);
        if (!result) {
          success = false;
          break;
        }
        
        // 생성된 기준을 매핑에 저장 (자식 기준들이 참조할 수 있도록)
        createdCriteriaMap.set(criterion.id, result);
      }
      
      if (success) {
        console.log('✅ 기준 저장 성공');
        
        // 저장 후 다시 로드하여 동기화
        await loadCriteria();
        
        alert('기준이 성공적으로 저장되었습니다.');
      } else {
        throw new Error('일부 기준 저장 실패');
      }
    } catch (error) {
      console.error('❌ 기준 저장 실패:', error);
      alert(`기준 저장 중 오류가 발생했습니다: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 인라인 편집 시작
  const startEditing = (criterionId: string, name: string, description: string) => {
    setEditingCriteria({
      ...editingCriteria,
      [criterionId]: { 
        name: isTemplateName(name) ? '' : name, 
        description: isTemplateDescription(description) ? '' : description 
      }
    });
  };

  // 인라인 편집 저장 (자동 저장)
  const saveInlineEdit = async (criterionId: string) => {
    if (!editingCriteria[criterionId]) return;

    const updateCriteria = (criteria: Criterion[]): Criterion[] => {
      return criteria.map(criterion => {
        if (criterion.id === criterionId) {
          return {
            ...criterion,
            name: editingCriteria[criterionId].name,
            description: editingCriteria[criterionId].description
          };
        }
        if (criterion.children) {
          return {
            ...criterion,
            children: updateCriteria(criterion.children)
          };
        }
        return criterion;
      });
    };

    const updatedCriteria = updateCriteria(hasTempChanges ? tempCriteria : criteria);
    
    // 즉시 UI 업데이트
    if (hasTempChanges) {
      setTempCriteria(updatedCriteria);
    } else {
      setCriteria(updatedCriteria);
      setTempCriteria(updatedCriteria);
      setHasTempChanges(true);
    }

    // 편집 모드 종료
    const newEditingCriteria = { ...editingCriteria };
    delete newEditingCriteria[criterionId];
    setEditingCriteria(newEditingCriteria);

    // 백그라운드에서 자동 저장
    try {
      await handleSaveCriteria();
      console.log('✅ 자동 저장 완료');
    } catch (error) {
      console.error('❌ 자동 저장 실패:', error);
      // 저장 실패 시 사용자에게 알림 (선택적)
      // alert('자동 저장에 실패했습니다. 수동으로 저장해주세요.');
    }
  };

  // 인라인 편집 취소
  const cancelInlineEdit = (criterionId: string) => {
    const newEditingCriteria = { ...editingCriteria };
    delete newEditingCriteria[criterionId];
    setEditingCriteria(newEditingCriteria);
  };

  // 기준 위아래 이동
  const moveCriterion = (criterionId: string, direction: 'up' | 'down') => {
    const moveCriteriaInList = (criteria: Criterion[]): Criterion[] => {
      const newCriteria = [...criteria];
      const index = newCriteria.findIndex(c => c.id === criterionId);
      
      if (index === -1) {
        // 하위 레벨에서 찾기
        return newCriteria.map(criterion => ({
          ...criterion,
          children: criterion.children ? moveCriteriaInList(criterion.children) : undefined
        }));
      }
      
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex >= 0 && targetIndex < newCriteria.length) {
        // 위치 교환
        [newCriteria[index], newCriteria[targetIndex]] = [newCriteria[targetIndex], newCriteria[index]];
        
        // order 값 업데이트
        newCriteria.forEach((criterion, idx) => {
          criterion.order = idx;
        });
      }
      
      return newCriteria;
    };

    const updatedCriteria = moveCriteriaInList(hasTempChanges ? tempCriteria : criteria);
    
    if (hasTempChanges) {
      setTempCriteria(updatedCriteria);
    } else {
      setCriteria(updatedCriteria);
      setTempCriteria(updatedCriteria);
      setHasTempChanges(true);
    }
  };

  // 기준 삭제
  const deleteCriterion = (criterionId: string) => {
    if (!window.confirm('이 기준을 삭제하시겠습니까?')) return;

    const deleteCriteriaFromList = (criteria: Criterion[]): Criterion[] => {
      return criteria
        .filter(c => c.id !== criterionId)
        .map(criterion => ({
          ...criterion,
          children: criterion.children ? deleteCriteriaFromList(criterion.children) : undefined
        }));
    };

    const updatedCriteria = deleteCriteriaFromList(hasTempChanges ? tempCriteria : criteria);
    
    if (hasTempChanges) {
      setTempCriteria(updatedCriteria);
    } else {
      setCriteria(updatedCriteria);
      setTempCriteria(updatedCriteria);
      setHasTempChanges(true);
    }
  };

  // 편집 가능한 기준 목록 렌더링
  const renderEditableCriteriaList = (criteriaList: Criterion[]) => {
    const flatCriteria = getAllCriteria(criteriaList);

    return (
      <div className="space-y-3">
        {flatCriteria.map((criterion) => {
          const isEditing = editingCriteria[criterion.id];
          const indent = (criterion.level - 1) * 24;
          
          return (
            <div 
              key={criterion.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              style={{ marginLeft: `${indent}px` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingCriteria[criterion.id]?.name || ''}
                        onChange={(e) => {
                          setEditingCriteria({
                            ...editingCriteria,
                            [criterion.id]: {
                              ...editingCriteria[criterion.id],
                              name: e.target.value
                            }
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        placeholder={isTemplateName(criterion.name) ? criterion.name : (criterion.level === 1 ? "예시: 기술적 역량" : criterion.level === 2 ? "예시: 프로그래밍 능력" : "예시: 알고리즘 이해도")}
                      />
                      <input
                        type="text"
                        value={editingCriteria[criterion.id]?.description || ''}
                        onChange={(e) => {
                          setEditingCriteria({
                            ...editingCriteria,
                            [criterion.id]: {
                              ...editingCriteria[criterion.id],
                              description: e.target.value
                            }
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={isTemplateDescription(criterion.description) ? criterion.description : (criterion.level === 1 ? "예시: 직무 수행에 필요한 전문 기술 수준" : criterion.level === 2 ? "예시: 코딩 및 개발 역량" : "예시: 문제해결을 위한 알고리즘 설계 능력")}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {criterion.level === 1 ? '🎯' : 
                           criterion.level === 2 ? '📋' : 
                           criterion.level === 3 ? '🎪' : 
                           criterion.level === 4 ? '📝' : '🔹'}
                        </span>
                        <span className="font-medium text-gray-900">{criterion.name}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          L{criterion.level}
                        </span>
                      </div>
                      {criterion.description && (
                        <div className="text-sm text-gray-600 mt-1 ml-7">
                          {criterion.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => saveInlineEdit(criterion.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                        title="저장"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => cancelInlineEdit(criterion.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="취소"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(criterion.id, criterion.name, criterion.description || '')}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title="편집"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => moveCriterion(criterion.id, 'up')}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="위로 이동"
                      >
                        ⬆️
                      </button>
                      <button
                        onClick={() => moveCriterion(criterion.id, 'down')}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        title="아래로 이동"
                      >
                        ⬇️
                      </button>
                      <button
                        onClick={() => deleteCriterion(criterion.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                        title="삭제"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 템플릿 선택 처리
  const handleTemplateSelect = (template: any) => {
    const convertTemplateStructure = (items: any[], parentId: string | null = null, level: number = 1): Criterion[] => {
      const result: Criterion[] = [];
      
      items.forEach((item, index) => {
        const id = `criterion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const criterion: Criterion = {
          id,
          name: item.name,
          description: item.description,
          parent_id: parentId,
          level,
          order: index + 1,
          weight: 1,
          type: 'criteria',
          children: []
        };
        
        if (item.children && item.children.length > 0) {
          criterion.children = convertTemplateStructure(item.children, id, level + 1);
        }
        
        result.push(criterion);
      });
      
      return result;
    };
    
    const newCriteria = convertTemplateStructure(template.structure);
    
    // 임시 저장소에 저장
    setTempCriteria(newCriteria);
    setCriteria(newCriteria);
    setHasTempChanges(true);
    setShowTemplates(false);
    setActiveInputMode(null);
    
    alert(`'${template.name}' 템플릿이 적용되었습니다. '저장하기' 버튼을 눌러 최종 저장하세요.`);
  };

  // 일괄 입력 처리
  const handleBulkImport = (importedCriteria: Criterion[]) => {
    // parent_id, level, order 필드 정규화
    const normalizedCriteria = importedCriteria.map((criterion, index) => ({
      ...criterion,
      id: criterion.id || `criterion_${Date.now()}_${index}`,
      level: criterion.level || 1,
      order: criterion.order || index + 1,
      parent_id: criterion.parent_id || null,
      type: 'criteria' as const
    }));
    
    const hierarchicalCriteria = buildHierarchy(normalizedCriteria);
    
    // 임시 저장소에 저장
    setTempCriteria(hierarchicalCriteria);
    setCriteria(hierarchicalCriteria);
    setHasTempChanges(true);
    setShowBulkInput(false);
    setActiveInputMode(null);
    
    alert(`${normalizedCriteria.length}개의 기준이 추가되었습니다. '저장하기' 버튼을 눌러 최종 저장하세요.`);
  };

  // 시각적 빌더 데이터 변환
  const convertVisualBuilderData = (builderCriteria: any[]): Criterion[] => {
    const result: Criterion[] = [];
    
    const traverse = (nodes: any[], parentId: string | null = null, level: number = 1) => {
      nodes.forEach((node, index) => {
        const criterion: Criterion = {
          id: node.id || `criterion_${Date.now()}_${index}`,
          name: node.name,
          description: node.description,
          parent_id: parentId,
          level,
          order: index + 1,
          weight: 1,
          type: 'criteria',
          children: []
        };
        
        if (node.children && node.children.length > 0) {
          criterion.children = traverse(node.children, criterion.id, level + 1);
        }
        
        result.push(criterion);
      });
      
      return result;
    };
    
    return traverse(builderCriteria);
  };

  // Criterion을 CriteriaNode로 변환 (재귀적)
  const convertToVisualNode = (criteria: Criterion[]): any[] => {
    return criteria.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      level: c.level,
      parent_id: c.parent_id || null,
      children: c.children ? convertToVisualNode(c.children) : [],
      isExpanded: true
    }));
  };

  // 시각적 빌더 저장 처리
  const handleVisualBuilderSave = (builderCriteria: any[]) => {
    const convertedCriteria = convertVisualBuilderData(builderCriteria);
    
    // 임시 저장소에 저장
    setTempCriteria(convertedCriteria);
    setCriteria(convertedCriteria);
    setHasTempChanges(true);
    
    alert(`${convertedCriteria.length}개의 기준이 시각적 빌더에서 추가되었습니다. '저장하기' 버튼을 눌러 최종 저장하세요.`);
  };

  // 모든 기준 가져오기 (평면 구조)
  const getAllCriteria = (criteriaList: Criterion[]): Criterion[] => {
    return flattenCriteria(criteriaList);
  };

  return (
    <div className="space-y-6">
      <Card title="평가 기준 설정">
        <div className="space-y-6">
          {/* 상단 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📊 평가 기준 설정</h4>
            <p className="text-sm text-blue-700">
              평가 목표를 달성하기 위한 계층구조의 기준을 설정합니다.
              템플릿을 사용하거나 직접 입력할 수 있습니다.
            </p>
            {hasTempChanges && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-sm text-yellow-800">
                  ⚠️ 저장되지 않은 변경사항이 있습니다. '저장하기' 버튼을 눌러 저장하세요.
                </p>
              </div>
            )}
          </div>

          {/* 입력 방법 선택 버튼 */}
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-900 mb-3">입력 방법 선택</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Button
                  variant={activeInputMode === 'template' ? 'primary' : 'outline'}
                  onClick={() => {
                    setActiveInputMode('template');
                    setShowTemplates(true);
                    setShowBulkInput(false);
                  }}
                  className="flex items-center justify-center w-full"
                  title="미리 정의된 템플릿을 사용하여 빠르게 계층구조를 설정할 수 있습니다."
                >
                  <span className="mr-2">📋</span>
                  기본 템플릿 사용
                </Button>
              </div>
              
              <div className="relative">
                <Button
                  variant={activeInputMode === 'bulk' ? 'primary' : 'outline'}
                  onClick={() => {
                    setActiveInputMode('bulk');
                    setShowBulkInput(true);
                    setShowTemplates(false);
                  }}
                  className="flex items-center justify-center w-full"
                  title="텍스트로 작성된 계층구조를 한 번에 입력할 수 있습니다. 마크다운, 번호, 들여쓰기 형식을 지원합니다."
                >
                  <span className="mr-2">📝</span>
                  텍스트 일괄 입력
                </Button>
              </div>
              
              <div className="relative">
                <Button
                  variant={activeInputMode === 'visual' ? 'primary' : 'outline'}
                  onClick={() => {
                    setActiveInputMode(activeInputMode === 'visual' ? null : 'visual');
                    setShowTemplates(false);
                    setShowBulkInput(false);
                  }}
                  className="flex items-center justify-center w-full"
                  title="드래그 앤 드롭으로 계층구조를 시각적으로 설계할 수 있습니다."
                >
                  <span className="mr-2">🎨</span>
                  시각적 빌더
                </Button>
              </div>
            </div>
          </div>

          {/* 현재 계층구조 표시 또는 시각적 빌더 */}
          <div className="min-h-[300px]">
            {activeInputMode === 'visual' ? (
              // 인라인 시각적 빌더
              <div className="border border-gray-200 rounded-lg p-4">
                <VisualCriteriaBuilder
                  initialCriteria={convertToVisualNode(criteria)}
                  onSave={handleVisualBuilderSave}
                  onClose={() => setActiveInputMode(null)}
                />
              </div>
            ) : criteria.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">현재 계층구조</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        editMode 
                          ? 'bg-green-100 text-green-700 border border-green-300' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {editMode ? '✅ 편집 모드' : '✏️ 편집하기'}
                    </button>
                    {!editMode && (
                      <>
                        <button
                          onClick={() => setLayoutMode('vertical')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            layoutMode === 'vertical' 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          📋 세로형
                        </button>
                        <button
                          onClick={() => setLayoutMode('horizontal')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            layoutMode === 'horizontal' 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          📊 가로형
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editMode ? (
                  <div className="space-y-4">
                    {renderEditableCriteriaList(hasTempChanges ? tempCriteria : criteria)}
                  </div>
                ) : (
                  <HierarchyTreeVisualization 
                    nodes={getAllCriteria(criteria)}
                    title=""
                    showWeights={false}
                    interactive={true}
                    layout={layoutMode}
                    onLayoutChange={setLayoutMode}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-500">
                  <div className="text-4xl mb-3">🌳</div>
                  <p className="text-lg font-medium">계층구조가 비어있습니다</p>
                  <p className="text-sm mt-2">위의 입력 방법 중 하나를 선택하여 기준을 추가하세요</p>
                </div>
              </div>
            )}
          </div>

          {/* 요약 정보 */}
          {criteria.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {getAllCriteria(criteria).length}
                  </div>
                  <div className="text-sm text-gray-600">전체 기준</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {criteria.filter(c => c.level === 1).length}
                  </div>
                  <div className="text-sm text-gray-600">상위 기준</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {getAllCriteria(criteria).filter(c => c.level > 1).length}
                  </div>
                  <div className="text-sm text-gray-600">하위 기준</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.max(...getAllCriteria(criteria).map(c => c.level), 0)}
                  </div>
                  <div className="text-sm text-gray-600">최대 깊이</div>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={isLoading || criteria.length === 0}
              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            >
              🗑️ 초기화
            </Button>
            
            <div className="flex space-x-3">
              {onComplete && (
                <Button
                  variant="outline"
                  onClick={onComplete}
                  disabled={isLoading || savedCriteria.length === 0}
                >
                  다음 단계
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleSaveCriteria}
                disabled={isLoading || isSaving || criteria.length === 0}
              >
                {isSaving ? '저장 중...' : '저장하기'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* 템플릿 선택 모달 */}
      {showTemplates && (
        <CriteriaTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => {
            setShowTemplates(false);
            setActiveInputMode(null);
          }}
        />
      )}

      {/* 일괄 입력 모달 */}
      {showBulkInput && (
        <BulkCriteriaInput
          onImport={handleBulkImport}
          onCancel={() => {
            setShowBulkInput(false);
            setActiveInputMode(null);
          }}
          existingCriteria={criteria}
        />
      )}
    </div>
  );
};

export default CriteriaManagement;