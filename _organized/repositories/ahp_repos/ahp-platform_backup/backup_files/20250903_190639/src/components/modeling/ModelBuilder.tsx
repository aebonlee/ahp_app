/**
 * 고급 AHP 모델 빌더
 * 드래그앤드롭 편집기와 다중 시각화 모드를 통합한 포괄적 모델 구축 인터페이스
 */

import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import HierarchyTreeEditor, { HierarchyNode } from './HierarchyTreeEditor';
import ModelVisualization from './ModelVisualization';

// 모델 메타데이터
interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  tags: string[];
  isPublic: boolean;
  templateType: 'custom' | 'technology' | 'strategy' | 'resource' | 'quality';
}

// 모델 상태
interface ModelState {
  hierarchy: HierarchyNode | null;
  metadata: ModelMetadata;
  isValid: boolean;
  validationErrors: string[];
  hasUnsavedChanges: boolean;
  version: number;
}

// 편집 히스토리
interface EditHistoryEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'rename';
  description: string;
  oldState?: any;
  newState?: any;
}

// 템플릿 정의
interface ModelTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  hierarchy: HierarchyNode;
  previewImage?: string;
  usageCount: number;
}

// 뷰 모드
type ViewMode = 'split' | 'editor' | 'visualization' | 'fullscreen';

interface ModelBuilderProps {
  initialModel?: ModelState;
  onModelSave?: (model: ModelState) => void;
  onModelExport?: (model: ModelState, format: string) => void;
  className?: string;
  readOnly?: boolean;
}

const ModelBuilder: React.FC<ModelBuilderProps> = ({
  initialModel,
  onModelSave,
  onModelExport,
  className = '',
  readOnly = false
}) => {
  // 상태 관리
  const [modelState, setModelState] = useState<ModelState>({
    hierarchy: null,
    metadata: {
      id: `model-${Date.now()}`,
      name: '새 AHP 모델',
      description: '',
      version: '1.0.0',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tags: [],
      isPublic: false,
      templateType: 'custom'
    },
    isValid: false,
    validationErrors: [],
    hasUnsavedChanges: false,
    version: 1
  });

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [editHistory, setEditHistory] = useState<EditHistoryEntry[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showValidationPanel, setShowValidationPanel] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ModelTemplate | null>(null);
  const [autoSave, setAutoSave] = useState(true);
  const [currentView, setCurrentView] = useState<'tree' | 'network' | 'matrix' | 'sunburst' | 'treemap'>('tree');

  // 초기 모델 설정
  useEffect(() => {
    if (initialModel) {
      setModelState(initialModel);
    }
  }, [initialModel]);

  // 자동 저장
  useEffect(() => {
    if (autoSave && modelState.hasUnsavedChanges && !readOnly) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 5000); // 5초 후 자동 저장

      return () => clearTimeout(timer);
    }
  }, [modelState.hasUnsavedChanges, autoSave, readOnly]);

  // 계층구조 변경 핸들러
  const handleHierarchyChange = useCallback((newHierarchy: HierarchyNode) => {
    setModelState(prev => ({
      ...prev,
      hierarchy: newHierarchy,
      hasUnsavedChanges: true,
      lastModified: new Date().toISOString(),
      version: prev.version + 1
    }));

    // 편집 히스토리 추가
    addToHistory('update', '계층구조 수정', null, newHierarchy);
  }, []);

  // 유효성 검사 변경 핸들러
  const handleValidationChange = useCallback((isValid: boolean, errors: string[]) => {
    setModelState(prev => ({
      ...prev,
      isValid,
      validationErrors: errors
    }));
  }, []);

  // 편집 히스토리에 항목 추가
  const addToHistory = (action: EditHistoryEntry['action'], description: string, oldState?: any, newState?: any) => {
    const entry: EditHistoryEntry = {
      id: `history-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      description,
      oldState,
      newState
    };

    setEditHistory(prev => [entry, ...prev].slice(0, 50)); // 최대 50개 항목 유지
  };

  // 모델 저장
  const handleSave = async () => {
    if (!modelState.hierarchy || !modelState.isValid) {
      alert('유효하지 않은 모델입니다. 오류를 수정한 후 다시 시도하세요.');
      return;
    }

    try {
      const savedModel = {
        ...modelState,
        hasUnsavedChanges: false,
        lastModified: new Date().toISOString()
      };

      setModelState(savedModel);
      
      if (onModelSave) {
        onModelSave(savedModel);
      }

      addToHistory('create', '모델 저장', null, savedModel);
      console.log('모델이 성공적으로 저장되었습니다.');
      
    } catch (error) {
      console.error('모델 저장 중 오류 발생:', error);
      alert('모델 저장에 실패했습니다.');
    }
  };

  // 자동 저장
  const handleAutoSave = async () => {
    if (modelState.isValid && modelState.hierarchy) {
      const autoSavedModel = {
        ...modelState,
        hasUnsavedChanges: false,
        lastModified: new Date().toISOString()
      };

      setModelState(autoSavedModel);
      console.log('모델이 자동 저장되었습니다.');
    }
  };

  // 모델 내보내기
  const handleExport = (format: string) => {
    if (!modelState.hierarchy) return;

    if (onModelExport) {
      onModelExport(modelState, format);
    } else {
      // 기본 내보내기 로직
      const exportData = {
        metadata: modelState.metadata,
        hierarchy: modelState.hierarchy,
        exportedAt: new Date().toISOString(),
        format
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelState.metadata.name}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    setShowExportDialog(false);
  };

  // 템플릿 적용
  const applyTemplate = (template: ModelTemplate) => {
    setModelState(prev => ({
      ...prev,
      hierarchy: template.hierarchy,
      metadata: {
        ...prev.metadata,
        name: template.name,
        description: template.description,
        templateType: template.category as any
      },
      hasUnsavedChanges: true,
      version: prev.version + 1
    }));

    addToHistory('create', `템플릿 적용: ${template.name}`, null, template.hierarchy);
    setShowTemplates(false);
  };

  // 새 모델 생성
  const createNewModel = () => {
    const newModel: ModelState = {
      hierarchy: null,
      metadata: {
        id: `model-${Date.now()}`,
        name: '새 AHP 모델',
        description: '',
        version: '1.0.0',
        createdBy: 'Current User',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [],
        isPublic: false,
        templateType: 'custom'
      },
      isValid: false,
      validationErrors: [],
      hasUnsavedChanges: false,
      version: 1
    };

    setModelState(newModel);
    setEditHistory([]);
    addToHistory('create', '새 모델 생성', null, newModel);
  };

  // 메타데이터 업데이트
  const updateMetadata = (updates: Partial<ModelMetadata>) => {
    setModelState(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...updates },
      hasUnsavedChanges: true,
      lastModified: new Date().toISOString()
    }));
  };

  // 미리 정의된 템플릿들
  const getModelTemplates = (): ModelTemplate[] => {
    return [
      {
        id: 'tech-selection',
        name: '기술 선택 모델',
        description: '신기술 도입을 위한 의사결정 템플릿',
        category: 'technology',
        usageCount: 150,
        hierarchy: {
          id: 'goal-tech',
          name: '최적 기술 선택',
          type: 'goal',
          level: 0,
          position: { x: 400, y: 50 },
          isExpanded: true,
          children: [
            {
              id: 'criterion-cost',
              name: '비용 효율성',
              type: 'criterion',
              level: 1,
              weight: 0.30,
              position: { x: 200, y: 200 },
              parentId: 'goal-tech',
              children: [],
              isExpanded: true
            },
            {
              id: 'criterion-performance',
              name: '성능',
              type: 'criterion',
              level: 1,
              weight: 0.25,
              position: { x: 350, y: 200 },
              parentId: 'goal-tech',
              children: [],
              isExpanded: true
            },
            {
              id: 'criterion-reliability',
              name: '신뢰성',
              type: 'criterion',
              level: 1,
              weight: 0.25,
              position: { x: 500, y: 200 },
              parentId: 'goal-tech',
              children: [],
              isExpanded: true
            },
            {
              id: 'criterion-scalability',
              name: '확장성',
              type: 'criterion',
              level: 1,
              weight: 0.20,
              position: { x: 650, y: 200 },
              parentId: 'goal-tech',
              children: [],
              isExpanded: true
            }
          ]
        }
      },
      {
        id: 'strategy-planning',
        name: '전략 계획 모델',
        description: '조직의 전략적 방향 설정을 위한 템플릿',
        category: 'strategy',
        usageCount: 89,
        hierarchy: {
          id: 'goal-strategy',
          name: '최적 전략 선택',
          type: 'goal',
          level: 0,
          position: { x: 400, y: 50 },
          isExpanded: true,
          children: [
            {
              id: 'criterion-market',
              name: '시장 기회',
              type: 'criterion',
              level: 1,
              weight: 0.35,
              position: { x: 250, y: 200 },
              parentId: 'goal-strategy',
              children: [],
              isExpanded: true
            },
            {
              id: 'criterion-resources',
              name: '자원 활용',
              type: 'criterion',
              level: 1,
              weight: 0.30,
              position: { x: 400, y: 200 },
              parentId: 'goal-strategy',
              children: [],
              isExpanded: true
            },
            {
              id: 'criterion-risk',
              name: '위험 관리',
              type: 'criterion',
              level: 1,
              weight: 0.35,
              position: { x: 550, y: 200 },
              parentId: 'goal-strategy',
              children: [],
              isExpanded: true
            }
          ]
        }
      },
      {
        id: 'resource-allocation',
        name: '자원 배분 모델',
        description: '한정된 자원의 효율적 배분을 위한 템플릿',
        category: 'resource',
        usageCount: 112,
        hierarchy: {
          id: 'goal-resource',
          name: '자원 배분 최적화',
          type: 'goal',
          level: 0,
          position: { x: 400, y: 50 },
          isExpanded: true,
          children: [
            {
              id: 'criterion-urgency',
              name: '긴급성',
              type: 'criterion',
              level: 1,
              weight: 0.40,
              position: { x: 300, y: 200 },
              parentId: 'goal-resource',
              children: [],
              isExpanded: true
            },
            {
              id: 'criterion-impact',
              name: '영향도',
              type: 'criterion',
              level: 1,
              weight: 0.35,
              position: { x: 450, y: 200 },
              parentId: 'goal-resource',
              children: [],
              isExpanded: true
            },
            {
              id: 'criterion-effort',
              name: '투입 노력',
              type: 'criterion',
              level: 1,
              weight: 0.25,
              position: { x: 600, y: 200 },
              parentId: 'goal-resource',
              children: [],
              isExpanded: true
            }
          ]
        }
      }
    ];
  };

  // 템플릿 선택 다이얼로그
  const renderTemplateDialog = () => {
    if (!showTemplates) return null;

    const templates = getModelTemplates();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-4/5 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">모델 템플릿 선택</h2>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {template.description}
                </p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>사용 횟수: {template.usageCount}</span>
                  <span>
                    기준 {template.hierarchy.children.length}개
                  </span>
                </div>

                {/* 템플릿 미리보기 */}
                <div className="mt-3 bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium mb-1">기준:</div>
                  <div className="space-y-1">
                    {template.hierarchy.children.slice(0, 3).map(criterion => (
                      <div key={criterion.id} className="flex justify-between">
                        <span>{criterion.name}</span>
                        {criterion.weight && (
                          <span>{(criterion.weight * 100).toFixed(0)}%</span>
                        )}
                      </div>
                    ))}
                    {template.hierarchy.children.length > 3 && (
                      <div className="text-gray-400">
                        ... {template.hierarchy.children.length - 3}개 더
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={() => setShowTemplates(false)}>
              취소
            </Button>
            <Button
              variant="primary"
              onClick={() => selectedTemplate && applyTemplate(selectedTemplate)}
              disabled={!selectedTemplate}
            >
              템플릿 적용
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // 메타데이터 편집 다이얼로그
  const renderMetadataDialog = () => {
    if (!showMetadataEditor) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">모델 정보 편집</h3>
            <button
              onClick={() => setShowMetadataEditor(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">모델명</label>
              <input
                type="text"
                value={modelState.metadata.name}
                onChange={(e) => updateMetadata({ name: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">설명</label>
              <textarea
                value={modelState.metadata.description}
                onChange={(e) => updateMetadata({ description: e.target.value })}
                className="w-full border rounded px-3 py-2 h-20"
                placeholder="모델에 대한 설명을 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">템플릿 유형</label>
              <select
                value={modelState.metadata.templateType}
                onChange={(e) => updateMetadata({ templateType: e.target.value as any })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="custom">사용자 정의</option>
                <option value="technology">기술 선택</option>
                <option value="strategy">전략 계획</option>
                <option value="resource">자원 배분</option>
                <option value="quality">품질 평가</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">태그 (쉼표로 구분)</label>
              <input
                type="text"
                value={modelState.metadata.tags.join(', ')}
                onChange={(e) => updateMetadata({ 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                })}
                className="w-full border rounded px-3 py-2"
                placeholder="예: 기술, 의사결정, 평가"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={modelState.metadata.isPublic}
                onChange={(e) => updateMetadata({ isPublic: e.target.checked })}
              />
              <label htmlFor="isPublic" className="text-sm">공개 모델로 설정</label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="secondary" onClick={() => setShowMetadataEditor(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={() => setShowMetadataEditor(false)}>
              확인
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // 내보내기 다이얼로그
  const renderExportDialog = () => {
    if (!showExportDialog) return null;

    const exportFormats = [
      { value: 'json', label: 'JSON', description: '모든 데이터를 포함한 완전한 모델' },
      { value: 'xml', label: 'XML', description: '구조화된 XML 형식' },
      { value: 'csv', label: 'CSV', description: '스프레드시트용 테이블 형식' },
      { value: 'pdf', label: 'PDF', description: '인쇄 가능한 보고서 형식' },
      { value: 'png', label: 'PNG', description: '시각화 이미지' }
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">모델 내보내기</h3>
            <button
              onClick={() => setShowExportDialog(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            {exportFormats.map(format => (
              <button
                key={format.value}
                onClick={() => handleExport(format.value)}
                className="w-full text-left p-3 border rounded hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">{format.label}</div>
                <div className="text-sm text-gray-600">{format.description}</div>
              </button>
            ))}
          </div>
          
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={() => setShowExportDialog(false)}>
              취소
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // 유효성 검사 패널
  const renderValidationPanel = () => {
    if (!showValidationPanel) return null;

    return (
      <Card title="유효성 검사 결과">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${modelState.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              {modelState.isValid ? '모델이 유효합니다' : '모델에 오류가 있습니다'}
            </span>
          </div>
          
          {modelState.validationErrors.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">오류 목록:</h4>
              <ul className="space-y-1">
                {modelState.validationErrors.map((error, index) => (
                  <li key={index} className="text-red-600 text-sm flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">총 노드 수:</span>
              <span className="ml-2 font-medium">
                {modelState.hierarchy ? countAllNodes(modelState.hierarchy) : 0}
              </span>
            </div>
            <div>
              <span className="text-gray-600">기준 수:</span>
              <span className="ml-2 font-medium">
                {modelState.hierarchy ? countNodesByLevel(modelState.hierarchy, 1) : 0}
              </span>
            </div>
            <div>
              <span className="text-gray-600">대안 수:</span>
              <span className="ml-2 font-medium">
                {modelState.hierarchy ? countNodesByLevel(modelState.hierarchy, 3) : 0}
              </span>
            </div>
            <div>
              <span className="text-gray-600">최대 깊이:</span>
              <span className="ml-2 font-medium">
                {modelState.hierarchy ? getMaxDepth(modelState.hierarchy) : 0}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // 헬퍼 함수들
  const countAllNodes = (node: HierarchyNode): number => {
    return 1 + node.children.reduce((sum, child) => sum + countAllNodes(child), 0);
  };

  const countNodesByLevel = (node: HierarchyNode, targetLevel: number): number => {
    let count = 0;
    
    const countRecursive = (n: HierarchyNode) => {
      if (n.level === targetLevel) count++;
      n.children.forEach(countRecursive);
    };
    
    countRecursive(node);
    return count;
  };

  const getMaxDepth = (node: HierarchyNode): number => {
    if (node.children.length === 0) return node.level;
    return Math.max(...node.children.map(getMaxDepth));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 및 도구 모음 */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">{modelState.metadata.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span>버전: {modelState.metadata.version}</span>
              <span>마지막 수정: {new Date(modelState.metadata.lastModified).toLocaleString('ko-KR')}</span>
              {modelState.hasUnsavedChanges && (
                <span className="text-orange-600 font-medium">• 저장되지 않은 변경사항</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm">자동저장:</span>
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                disabled={readOnly}
              />
            </div>
            
            {!readOnly && (
              <>
                <Button variant="secondary" onClick={createNewModel}>
                  🆕 새 모델
                </Button>
                <Button variant="secondary" onClick={() => setShowTemplates(true)}>
                  📋 템플릿
                </Button>
                <Button variant="secondary" onClick={() => setShowMetadataEditor(true)}>
                  ⚙️ 정보 편집
                </Button>
              </>
            )}
            
            <Button variant="secondary" onClick={() => setShowExportDialog(true)}>
              💾 내보내기
            </Button>
            
            {!readOnly && (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!modelState.isValid || !modelState.hasUnsavedChanges}
              >
                💾 저장
              </Button>
            )}
          </div>
        </div>

        {/* 뷰 모드 선택 */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {[
              { value: 'split', label: '분할 보기', icon: '⊞' },
              { value: 'editor', label: '편집기', icon: '✏️' },
              { value: 'visualization', label: '시각화', icon: '📊' },
              { value: 'fullscreen', label: '전체화면', icon: '⛶' }
            ].map(mode => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value as ViewMode)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === mode.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={showValidationPanel ? 'primary' : 'secondary'}
              onClick={() => setShowValidationPanel(!showValidationPanel)}
              className="text-sm"
            >
              🔍 유효성 검사
            </Button>
            
            <div className={`w-3 h-3 rounded-full ${modelState.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </div>
      </Card>

      {/* 유효성 검사 패널 */}
      {showValidationPanel && renderValidationPanel()}

      {/* 메인 콘텐츠 영역 */}
      <div className={`${
        viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' :
        viewMode === 'fullscreen' ? 'fixed inset-0 z-40 bg-white p-6 overflow-auto' :
        ''
      }`}>
        {/* 트리 편집기 */}
        {(viewMode === 'split' || viewMode === 'editor' || viewMode === 'fullscreen') && (
          <div className={viewMode === 'fullscreen' ? 'w-1/2 pr-3' : ''}>
            <HierarchyTreeEditor
              initialHierarchy={modelState.hierarchy || undefined}
              onHierarchyChange={handleHierarchyChange}
              onValidationChange={handleValidationChange}
              readOnly={readOnly}
            />
          </div>
        )}

        {/* 모델 시각화 */}
        {(viewMode === 'split' || viewMode === 'visualization' || viewMode === 'fullscreen') && modelState.hierarchy && (
          <div className={viewMode === 'fullscreen' ? 'w-1/2 pl-3' : ''}>
            <ModelVisualization
              hierarchy={modelState.hierarchy}
              mode={currentView}
              interactive={!readOnly}
              onNodeClick={(node) => console.log('Node clicked:', node)}
              onNodeHover={(node) => console.log('Node hovered:', node)}
            />
          </div>
        )}
      </div>

      {/* 편집 히스토리 */}
      {editHistory.length > 0 && (
        <Card title="편집 히스토리">
          <div className="max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {editHistory.slice(0, 10).map(entry => (
                <div key={entry.id} className="flex justify-between items-center text-sm border-b pb-2">
                  <div>
                    <span className="font-medium">{entry.description}</span>
                    <span className="text-gray-500 ml-2">
                      {new Date(entry.timestamp).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    entry.action === 'create' ? 'bg-green-100 text-green-800' :
                    entry.action === 'update' ? 'bg-blue-100 text-blue-800' :
                    entry.action === 'delete' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {entry.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 다이얼로그들 */}
      {renderTemplateDialog()}
      {renderMetadataDialog()}
      {renderExportDialog()}

      {/* 전체화면 모드 닫기 버튼 */}
      {viewMode === 'fullscreen' && (
        <button
          onClick={() => setViewMode('split')}
          className="fixed top-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          ✕ 닫기
        </button>
      )}
    </div>
  );
};

export default ModelBuilder;