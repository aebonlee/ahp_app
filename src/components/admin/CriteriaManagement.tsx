import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import HierarchyTreeVisualization from '../common/HierarchyTreeVisualization';
import HierarchyTreeBuilder from '../modeling/HierarchyTreeBuilder';
import BulkCriteriaInput from '../criteria/BulkCriteriaInput';
import dataService from '../../services/dataService_clean';
import { CriteriaData } from '../../services/api';

interface Criterion extends Omit<CriteriaData, 'project_id' | 'position' | 'id'> {
  id: string; // required
  level: number; // override to make required
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
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [useVisualBuilder, setUseVisualBuilder] = useState(false);

  // CriteriaData를 Criterion으로 변환
  const convertToCriterion = (data: CriteriaData): Criterion => ({
    id: data.id || `crit_${Date.now()}_${Math.random()}`,
    name: data.name,
    description: data.description,
    parent_id: data.parent_id,
    level: data.level || 1,
    order: data.order,
    children: [],
    weight: 0
  });

  // Criterion을 CriteriaData로 변환
  const convertToCriteriaData = (crit: Partial<Criterion & { position?: number }>): Omit<CriteriaData, 'id'> => ({
    project_id: projectId,
    name: crit.name || '',
    description: crit.description || '',
    parent_id: crit.parent_id,
    level: crit.level || 1,
    position: crit.position || crit.order || 0,
    order: crit.order
  });
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [showHelp, setShowHelp] = useState(false);
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    rootCriteria: Criterion[];
    subCriteria: Criterion[];
    allCriteria: Criterion[];
  } | null>(null);

  useEffect(() => {
    // 백엔드에서 실제 프로젝트별 기준 데이터 로드
    const loadProjectCriteria = async () => {
      try {
        console.log(`🔍 프로젝트 ${projectId}의 기준 데이터 로드 중...`);
        const criteriaData = await dataService.getCriteria(projectId);
        const convertedCriteria = (criteriaData || []).map(convertToCriterion);
        setCriteria(convertedCriteria);
        console.log(`✅ ${convertedCriteria.length}개 기준 로드 완료`);
        
        // 부모 컴포넌트에 개수 알림
        if (onCriteriaChange) {
          onCriteriaChange(convertedCriteria.length);
        }
      } catch (error) {
        console.error('❌ 기준 데이터 로드 실패:', error);
        setCriteria([]);
        if (onCriteriaChange) {
          onCriteriaChange(0);
        }
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

  // 프로젝트별 기준 데이터 저장 (현재 미사용 - localStorage 제거됨)
  // const saveProjectCriteria = (criteriaData: Criterion[]) => {
  //   // localStorage 제거됨 - PostgreSQL로 데이터 저장
  //   console.log(`Saved ${getAllCriteria(criteriaData).length} criteria for project ${projectId}`);
  // };

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
          weight: item.weight || 0
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
    console.log('🚀 CriteriaManagement handleAddCriterion 시작:', {
      projectId,
      criterionName: newCriterion.name,
      criterionDescription: newCriterion.description,
      parentId: newCriterion.parentId
    });
    
    if (!validateCriterion(newCriterion.name)) {
      console.log('❌ 유효성 검사 실패');
      return;
    }

    // 부모가 있으면 부모 레벨 + 1, 없으면 1레벨
    let level = 1;
    if (newCriterion.parentId) {
      const parent = getAllCriteria(criteria).find(c => c.id === newCriterion.parentId);
      level = parent ? (parent.level || 1) + 1 : 2;
    }
    
    // 최대 5레벨까지만 허용
    if (level > 5) {
      setErrors({ name: '최대 5단계까지만 기준을 생성할 수 있습니다.' });
      return;
    }

    try {
      const criterionData = convertToCriteriaData({
        name: newCriterion.name,
        description: newCriterion.description || '',
        parent_id: newCriterion.parentId || null,
        level,
        order: getAllCriteria(criteria).filter(c => (c.level || 1) === level).length + 1
      });

      console.log('🔄 CriteriaManagement 기준 추가 중...', {
        criterionData,
        projectIdFromProps: projectId,
        hasProjectId: !!criterionData.project_id
      });
      const createdCriterion = await dataService.createCriteria(criterionData);
      
      if (!createdCriterion) {
        setErrors({ name: '기준 추가에 실패했습니다.' });
        return;
      }

      console.log('✅ 기준이 성공적으로 추가되었습니다:', createdCriterion);
      
      // 데이터 다시 로드
      const updatedCriteriaData = await dataService.getCriteria(projectId);
      const convertedUpdatedCriteria = (updatedCriteriaData || []).map(convertToCriterion);
      setCriteria(convertedUpdatedCriteria);
      
      setNewCriterion({ name: '', description: '', parentId: '' });
      setErrors({});
      
      // 기준 개수 변경 콜백 호출
      if (onCriteriaChange) {
        onCriteriaChange(convertedUpdatedCriteria.length);
      }
    } catch (error) {
      console.error('❌ CriteriaManagement 기준 추가 실패:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        projectId,
        criterionName: newCriterion.name
      });
      
      const errorMessage = error instanceof Error ? error.message : '기준 추가 중 알 수 없는 오류가 발생했습니다.';
      setErrors({ name: `오류: ${errorMessage}` });
    }
  };

  const handleMoveUp = async (id: string) => {
    const criterion = criteria.find(c => c.id === id);
    if (!criterion) return;
    
    // 같은 부모의 같은 레벨 기준들 찾기
    const siblings = criteria.filter(c => 
      c.parent_id === criterion.parent_id && 
      c.level === criterion.level
    ).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const currentIndex = siblings.findIndex(s => s.id === id);
    if (currentIndex <= 0) return; // 이미 첫 번째
    
    // 순서 교환 (로컬 상태만 업데이트)
    const updatedCriteria = [...criteria];
    const currentIdx = updatedCriteria.findIndex(c => c.id === id);
    const prevIdx = updatedCriteria.findIndex(c => c.id === siblings[currentIndex - 1].id);
    
    if (currentIdx >= 0 && prevIdx >= 0) {
      const temp = updatedCriteria[currentIdx].order;
      updatedCriteria[currentIdx].order = updatedCriteria[prevIdx].order;
      updatedCriteria[prevIdx].order = temp;
      setCriteria(updatedCriteria);
    }
  };

  const handleMoveDown = async (id: string) => {
    const criterion = criteria.find(c => c.id === id);
    if (!criterion) return;
    
    // 같은 부모의 같은 레벨 기준들 찾기
    const siblings = criteria.filter(c => 
      c.parent_id === criterion.parent_id && 
      c.level === criterion.level
    ).sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const currentIndex = siblings.findIndex(s => s.id === id);
    if (currentIndex >= siblings.length - 1) return; // 이미 마지막
    
    // 순서 교환 (로컬 상태만 업데이트)
    const updatedCriteria = [...criteria];
    const currentIdx = updatedCriteria.findIndex(c => c.id === id);
    const nextIdx = updatedCriteria.findIndex(c => c.id === siblings[currentIndex + 1].id);
    
    if (currentIdx >= 0 && nextIdx >= 0) {
      const temp = updatedCriteria[currentIdx].order;
      updatedCriteria[currentIdx].order = updatedCriteria[nextIdx].order;
      updatedCriteria[nextIdx].order = temp;
      setCriteria(updatedCriteria);
    }
  };

  const handleDeleteCriterion = async (id: string) => {
    console.log('기준 삭제:', id);
    
    try {
      const success = await dataService.deleteCriteria(id, projectId);
      
      if (!success) {
        console.error('❌ 기준 삭제 실패');
        return;
      }

      console.log('✅ 기준이 삭제되었습니다:', id);
      
      // 데이터 다시 로드
      const updatedCriteriaData = await dataService.getCriteria(projectId);
      const convertedUpdatedCriteria = (updatedCriteriaData || []).map(convertToCriterion);
      setCriteria(convertedUpdatedCriteria);
      
      // 기준 개수 변경 콜백 호출
      if (onCriteriaChange) {
        onCriteriaChange(convertedUpdatedCriteria.length);
      }
    } catch (error) {
      console.error('❌ 기준 삭제 실패:', error);
    }
  };


  // 상위 기준으로 선택 가능한 모든 기준 (최대 4레벨까지, 5레벨을 만들기 위해)
  const getAvailableParentCriteria = () => {
    const flatCriteria = getAllCriteria(criteria);
    // 최대 4레벨까지만 상위 기준으로 선택 가능 (5레벨까지 지원)
    return flatCriteria.filter(c => (c.level || 1) <= 4);
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
          await dataService.deleteCriteria(criterion.id, projectId);
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
    
    // 논문 작성 권장: 3개 기준 템플릿 구조
    const templateCriteria = [
      {
        project_id: projectId,
        name: '기준 1',
        description: '첫 번째 평가 기준',
        parent_id: null,
        level: 1,
        position: 1,
        order: 1
      },
      {
        project_id: projectId,
        name: '기준 2', 
        description: '두 번째 평가 기준',
        parent_id: null,
        level: 1,
        position: 2,
        order: 2
      },
      {
        project_id: projectId,
        name: '기준 3',
        description: '세 번째 평가 기준 (논문 권장 구조)',
        parent_id: null,
        level: 1,
        position: 3,
        order: 3
      }
    ];
    
    try {
      // 기존 데이터 삭제
      if (criteria.length > 0) {
        console.log('🗑️ 기존 기준 삭제 중...');
        for (const criterion of criteria) {
          if (criterion.id && criterion.id !== 'temp') {
            try {
              await dataService.deleteCriteria(criterion.id, projectId);
            } catch (deleteError) {
              console.error('기준 삭제 실패:', deleteError);
            }
          }
        }
      }
      
      // 잠시 대기 (DB 삭제 완료 대기)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 템플릿 데이터 생성
      console.log('📝 템플릿 데이터 생성 중...');
      for (const criterionData of templateCriteria) {
        try {
          const result = await dataService.createCriteria(criterionData);
          console.log('✅ 템플릿 기준 생성:', result);
        } catch (createError) {
          console.error('템플릿 기준 생성 실패:', createError);
        }
      }
      
      // 데이터 다시 로드
      await new Promise(resolve => setTimeout(resolve, 500));
      const criteriaData = await dataService.getCriteria(projectId);
      const convertedCriteria = (criteriaData || []).map(convertToCriterion);
      setCriteria(convertedCriteria);
      
      setNewCriterion({ name: '', description: '', parentId: '' });
      setErrors({});
      alert('✅ 논문 권장 템플릿(3개 기준)이 저장되었습니다.\n필요시 추가 기준을 입력할 수 있습니다.');
    } catch (error) {
      console.error('Failed to load template data:', error);
      alert(`❌ 템플릿 로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleBulkImport = async (importedCriteria: Criterion[]) => {
    try {
      console.log('🔄 일괄 가져오기 시작:', importedCriteria);
      
      if (!importedCriteria || importedCriteria.length === 0) {
        alert('⚠️ 가져올 기준이 없습니다.');
        return;
      }
      
      // 기존 데이터가 있으면 확인
      if (criteria.length > 0) {
        const confirm = window.confirm('기존 기준을 모두 삭제하고 새로운 기준으로 교체하시겠습니까?');
        if (!confirm) {
          setShowBulkInput(false);
          return;
        }
        
        // 기존 데이터 삭제
        console.log('🗑️ 기존 기준 삭제 중...');
        for (const criterion of criteria) {
          if (criterion.id && criterion.id !== 'temp') {
            try {
              await dataService.deleteCriteria(criterion.id, projectId);
            } catch (deleteError) {
              console.error('기준 삭제 실패:', deleteError);
            }
          }
        }
        
        // 상태 초기화
        setCriteria([]);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 계층구조 분석
      const rootCriteria = importedCriteria.filter(c => c.level === 1);
      const hierarchicalCriteria = importedCriteria.filter(c => c.level > 1);
      
      console.log(`📊 가져올 기준 분석: 총 ${importedCriteria.length}개 (레벨1: ${rootCriteria.length}개, 하위: ${hierarchicalCriteria.length}개)`);
      
      // 직접 계층구조 저장 처리
      await processHierarchicalImport(importedCriteria);
      setShowBulkInput(false);
      
    } catch (error) {
      console.error('Failed to bulk import criteria:', error);
      alert(`❌ 일괄 가져오기 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setShowBulkInput(false);
    }
  };

  const handleImportChoice = async (saveOnlyMain: boolean) => {
    if (!pendingImport) return;
    
    try {
      if (saveOnlyMain) {
        await processMainCriteriaOnly(pendingImport.rootCriteria, pendingImport.subCriteria);
      } else {
        await processHierarchicalImport(pendingImport.allCriteria);
      }
    } catch (error) {
      console.error('Failed to process import choice:', error);
      alert('❌ 가져오기 처리 중 오류가 발생했습니다.');
    } finally {
      setShowImportDialog(false);
      setPendingImport(null);
    }
  };

  const processHierarchicalImport = async (allCriteria: Criterion[]) => {
    console.log('🔄 계층구조 유지하여 저장 시작:', allCriteria);
    
    try {
      // 레벨 순서대로 정렬하여 부모부터 먼저 저장
      const sortedCriteria = [...allCriteria].sort((a, b) => {
        // 먼저 레벨로 정렬, 같은 레벨이면 order로 정렬
        if (a.level !== b.level) return a.level - b.level;
        return (a.order || 0) - (b.order || 0);
      });
      
      const idMapping = new Map<string, string>(); // 임시 ID를 실제 저장된 ID로 매핑
      const savedCriteria: any[] = [];
      
      for (const criterion of sortedCriteria) {
        // 부모 ID 매핑
        let mappedParentId: string | null = null;
        if (criterion.parent_id && idMapping.has(criterion.parent_id)) {
          mappedParentId = idMapping.get(criterion.parent_id)!;
        }
        
        const criterionData = {
          project_id: projectId,
          name: criterion.name,
          description: criterion.description || '',
          parent_id: mappedParentId,
          level: criterion.level,
          position: criterion.order || 1,
          order: criterion.order || 1
        };
        
        console.log(`💾 기준 저장 (레벨 ${criterion.level}):`, {
          name: criterion.name,
          parent_id: mappedParentId,
          level: criterion.level
        });
        
        try {
          const savedCriterion = await dataService.createCriteria(criterionData);
          if (savedCriterion && savedCriterion.id) {
            // 임시 ID를 실제 저장된 ID로 매핑
            idMapping.set(criterion.id, savedCriterion.id);
            savedCriteria.push(savedCriterion);
          }
        } catch (saveError) {
          console.error(`기준 저장 실패 (${criterion.name}):`, saveError);
          throw new Error(`기준 "${criterion.name}" 저장 실패`);
        }
      }
      
      // 데이터 다시 로드
      const criteriaData = await dataService.getCriteria(projectId);
      const convertedCriteria = (criteriaData || []).map(convertToCriterion);
      setCriteria(convertedCriteria);
      
      alert(`✅ ${savedCriteria.length}개의 기준이 계층구조를 유지하여 저장되었습니다.`);
    } catch (error) {
      console.error('계층구조 저장 실패:', error);
      throw error;
    }
  };

  const processMainCriteriaOnly = async (rootCriteria: Criterion[], subCriteria: Criterion[]) => {
    // 최상위 기준만 저장하고 하위 기준은 메타데이터로 포함
    for (const rootCriterion of rootCriteria) {
      const relatedSubCriteria = subCriteria.filter(c => c.parent_id === rootCriterion.id);
      
      console.log(`📋 "${rootCriterion.name}" 기준의 하위 기준 ${relatedSubCriteria.length}개:`, 
        relatedSubCriteria.map(s => s.name));
      
      const criterionData = convertToCriteriaData({
        name: rootCriterion.name,
        description: rootCriterion.description || '',
        parent_id: null,
        level: 1,
        order: rootCriterion.order || 1
      });
      
      // 하위 기준 정보를 설명에 추가
      if (relatedSubCriteria.length > 0) {
        const subCriteriaText = relatedSubCriteria.map(sub => 
          sub.description ? `${sub.name}: ${sub.description}` : sub.name
        ).join(', ');
        
        criterionData.description = criterionData.description 
          ? `${criterionData.description} [하위 기준: ${subCriteriaText}]`
          : `[하위 기준: ${subCriteriaText}]`;
      }
      
      console.log('💾 주 기준 저장:', criterionData);
      await dataService.createCriteria(criterionData);
    }
    
    // 데이터 다시 로드
    const criteriaData = await dataService.getCriteria(projectId);
    const convertedCriteria = (criteriaData || []).map(convertToCriterion);
    setCriteria(convertedCriteria);
    
    alert(`✅ ${rootCriteria.length}개의 주 기준이 저장되었습니다.\n하위 기준들은 각 기준의 설명에 포함되었습니다.`);
  };

  const processFlatImport = async (criteria: Criterion[]) => {
    // 모든 기준을 평면 구조로 저장 (레벨 1로 변환)
    for (const criterion of criteria) {
      const criterionData = convertToCriteriaData({
        name: criterion.name,
        description: criterion.description || '',
        parent_id: null, // AHP에서는 평면 구조 사용
        level: 1,
        order: criterion.order || 1
      });
      
      console.log('💾 평면 기준 저장:', criterionData);
      await dataService.createCriteria(criterionData);
    }
    
    // 데이터 다시 로드
    const criteriaData = await dataService.getCriteria(projectId);
    const convertedCriteria = (criteriaData || []).map(convertToCriterion);
    setCriteria(convertedCriteria);
    
    alert(`✅ ${criteria.length}개의 기준이 평면 구조로 저장되었습니다.`);
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
                <li><strong>📋 Level 2 (기준):</strong> 주요 평가 영역 (<span className="text-yellow-700 font-semibold">3개 권장</span>, 최대 7개)</li>
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
                <li><strong>논문 작성 시 3-5개 기준 권장</strong> (7개 초과 시 일관성 저하)</li>
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

  // 시각적 빌더 모드일 때 HierarchyTreeBuilder 렌더링
  if (useVisualBuilder) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">시각적 모델 구축</h2>
          <Button
            onClick={() => setUseVisualBuilder(false)}
            variant="outline"
            size="sm"
          >
            ← 기본 모드로 전환
          </Button>
        </div>
        <HierarchyTreeBuilder
          projectId={projectId}
          projectTitle={projectTitle || 'AHP 프로젝트'}
          onComplete={async (hierarchy) => {
            // 계층 구조를 평면 구조로 변환하여 저장
            const flattenTree = (node: any, parentId: string | null = null, level: number = 0): any[] => {
              const result: any[] = [];
              if (node.id !== 'root') {
                result.push({
                  name: node.name,
                  description: '',
                  parent_id: parentId,
                  level: level,
                  order: node.order || 0
                });
              }
              if (node.children) {
                node.children.forEach((child: any, index: number) => {
                  result.push(...flattenTree(child, node.id === 'root' ? null : node.id, level + 1));
                });
              }
              return result;
            };

            const flatCriteria = flattenTree(hierarchy);
            
            // 각 기준을 백엔드에 저장
            for (const criterion of flatCriteria) {
              const criterionData = convertToCriteriaData(criterion);
              await dataService.createCriteria(criterionData);
            }
            
            // 데이터 다시 로드
            const criteriaData = await dataService.getCriteria(projectId);
            const convertedCriteria = (criteriaData || []).map(convertToCriterion);
            setCriteria(convertedCriteria);
            
            alert(`✅ ${flatCriteria.length}개의 기준이 저장되었습니다.`);
            setUseVisualBuilder(false);
            onComplete();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderHelpModal()}
      <Card title="2-1단계 — 기준추가">
        <div className="space-y-6">
          {/* 논문 작성 권장 구조 안내 */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-yellow-800">📄 논문 작성 권장: 기본 3개 기준</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p className="mb-2">학술 논문을 위해 <strong>3개 기준</strong>으로 시작하는 것을 권장합니다. (필요시 최대 7개까지 추가 가능)</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>쌍대비교 횟수: 3개 기준 = 3회, 5개 기준 = 10회, 7개 기준 = 21회</li>
                    <li>일관성 검증(CR ≤ 0.1) 통과 확률이 높아집니다</li>
                    <li>기준이 많을수록 평가자의 피로도 증가 및 응답률 저하</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

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
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setUseVisualBuilder(true)}
                  className="transition-all duration-200 ml-2" 
                >
                  🎨 시각적 빌더
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
                      {getLevelIcon(criterion.level || 1)} {criterion.name} ({getLevelName(criterion.level || 1)})
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
                const count = getAllCriteria(criteria).filter(c => (c.level || 1) === level).length;
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

      {/* Import Choice Modal */}
      {showImportDialog && pendingImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">
                  계층구조 가져오기 방식 선택
                </h3>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  계층구조가 감지되었습니다:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">주 기준:</span>
                      <span className="text-blue-600">{pendingImport.rootCriteria.length}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">하위 기준:</span>
                      <span className="text-green-600">{pendingImport.subCriteria.length}개</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="border-l-4 border-blue-500 pl-3">
                    <p className="font-medium text-gray-900">옵션 1: 주 기준만 저장 (권장)</p>
                    <p>하위 기준들은 각 주 기준의 설명에 포함됩니다.</p>
                    <p className="text-blue-600">→ AHP 평가에 적합한 {pendingImport.rootCriteria.length}개 기준 생성</p>
                  </div>
                  <div className="border-l-4 border-gray-400 pl-3">
                    <p className="font-medium text-gray-900">옵션 2: 모든 기준을 개별 저장</p>
                    <p>모든 항목을 별도의 기준으로 저장합니다.</p>
                    <p className="text-gray-600">→ 총 {pendingImport.allCriteria.length}개 기준 생성</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  onClick={() => handleImportChoice(true)}
                  className="flex-1"
                >
                  주 기준만 저장
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleImportChoice(false)}
                  className="flex-1"
                >
                  모든 기준 저장
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImportDialog(false);
                    setPendingImport(null);
                    setShowBulkInput(true);
                  }}
                  size="sm"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaManagement;