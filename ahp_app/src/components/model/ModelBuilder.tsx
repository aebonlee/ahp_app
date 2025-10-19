import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import EvaluatorAssignment from '../admin/EvaluatorAssignment';
import CanvasModelBuilder from './CanvasModelBuilder';
import { DEMO_PROJECTS, DEMO_CRITERIA, DEMO_ALTERNATIVES } from '../../data/demoData';
import { 
  Squares2X2Icon, 
  ListBulletIcon, 
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Criterion {
  id: string;
  name: string;
  description?: string;
  parent_id: string | null;
  level: number;
  order_index: number;
  children?: Criterion[];
}

interface Alternative {
  id: string;
  name: string;
  description?: string;
  order_index: number;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  objective?: string;
  criteria: Criterion[];
  alternatives: Alternative[];
}

interface ModelBuilderProps {
  projectId: string;
  onSave?: () => void;
  demoMode?: boolean;
  onComplete?: () => void;
}

const ModelBuilder: React.FC<ModelBuilderProps> = ({ projectId, onSave, demoMode = false, onComplete }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 빌더 모드 선택
  const [builderMode, setBuilderMode] = useState<'select' | 'canvas' | 'form'>('select');
  const [modelData, setModelData] = useState<any[]>([]);
  const [modelCompleted, setModelCompleted] = useState(false);
  
  // 기존 상태들
  const [editingCriterion, setEditingCriterion] = useState<string | null>(null);
  const [newCriterionName, setNewCriterionName] = useState('');
  const [newCriterionDescription, setNewCriterionDescription] = useState('');
  const [editingAlternative, setEditingAlternative] = useState<string | null>(null);
  const [newAlternativeName, setNewAlternativeName] = useState('');
  const [newAlternativeDescription, setNewAlternativeDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'criteria' | 'alternatives' | 'evaluators' | 'settings'>('criteria');

  const API_BASE_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8000' 
    : 'https://ahp-django-backend.onrender.com';

  // 캔버스 모델 저장 핸들러
  const handleCanvasModelSave = useCallback((canvasNodes: any[]) => {
    setModelData(canvasNodes);
    setModelCompleted(true);
    setSaving(true);
    
    // 실제 API 저장 로직 (여기서는 시뮬레이션)
    setTimeout(() => {
      setSaving(false);
      console.log('✅ 캔버스 모델 저장 완료:', canvasNodes);
      onSave?.();
    }, 1000);
  }, [onSave]);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      
      if (demoMode) {
        // 데모 모드에서는 샘플 데이터 사용
        const demoProject = DEMO_PROJECTS.find(p => p.id === projectId);
        if (demoProject) {
          setProject({
            ...demoProject,
            criteria: buildHierarchy(DEMO_CRITERIA),
            alternatives: DEMO_ALTERNATIVES
          });
        }
        return;
      }

      // 프로젝트 정보 조회
      const projectResponse = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        
        headers: { 'Content-Type': 'application/json' },
      });

      if (!projectResponse.ok) throw new Error('Failed to fetch project');
      const projectData = await projectResponse.json();

      // 기준 조회
      const criteriaResponse = await fetch(`${API_BASE_URL}/api/v1/criteria/?project=${projectId}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      let criteria: Criterion[] = [];
      if (criteriaResponse.ok) {
        const criteriaData = await criteriaResponse.json();
        criteria = criteriaData.criteria || [];
      }

      // 대안 조회
      const alternativesResponse = await fetch(`${API_BASE_URL}/api/v1/alternatives/?project=${projectId}`, {
        
        headers: { 'Content-Type': 'application/json' },
      });

      let alternatives: Alternative[] = [];
      if (alternativesResponse.ok) {
        const alternativesData = await alternativesResponse.json();
        alternatives = alternativesData.alternatives || [];
      }

      setProject({
        ...projectData.project,
        criteria: buildHierarchy(criteria),
        alternatives
      });
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, demoMode]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const buildHierarchy = (criteria: Criterion[]): Criterion[] => {
    const criteriaMap = new Map<string, Criterion>();
    const rootCriteria: Criterion[] = [];

    // Initialize all criteria with children array
    criteria.forEach(criterion => {
      criteriaMap.set(criterion.id, { ...criterion, children: [] });
    });

    // Build hierarchy
    criteria.forEach(criterion => {
      const criterionWithChildren = criteriaMap.get(criterion.id)!;
      if (criterion.parent_id) {
        const parent = criteriaMap.get(criterion.parent_id);
        if (parent) {
          parent.children!.push(criterionWithChildren);
        }
      } else {
        rootCriteria.push(criterionWithChildren);
      }
    });

    return rootCriteria.sort((a, b) => a.order_index - b.order_index);
  };

  const addCriterion = async (parentId: string | null = null) => {
    if (!newCriterionName.trim()) return;

    try {
      setSaving(true);
      const level = parentId ? getLevel(parentId) + 1 : 1;
      
      const response = await fetch(`${API_BASE_URL}/api/v1/criteria/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          name: newCriterionName,
          description: newCriterionDescription,
          parent_id: parentId,
          level,
          order_index: getNextOrderIndex(parentId)
        }),
      });

      if (!response.ok) throw new Error('Failed to create criterion');

      setNewCriterionName('');
      setNewCriterionDescription('');
      setEditingCriterion(null);
      fetchProject();
    } catch (error) {
      console.error('Failed to add criterion:', error);
    } finally {
      setSaving(false);
    }
  };

  const addAlternative = async () => {
    if (!newAlternativeName.trim()) return;

    try {
      setSaving(true);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/alternatives/`, {
        method: 'POST',
        
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: projectId,
          name: newAlternativeName,
          description: newAlternativeDescription,
          order_index: (project?.alternatives.length || 0) + 1
        }),
      });

      if (!response.ok) throw new Error('Failed to create alternative');

      setNewAlternativeName('');
      setNewAlternativeDescription('');
      setEditingAlternative(null);
      fetchProject();
    } catch (error) {
      console.error('Failed to add alternative:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteCriterion = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/criteria/${id}/`, {
        method: 'DELETE',
        
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to delete criterion');
      fetchProject();
    } catch (error) {
      console.error('Failed to delete criterion:', error);
    }
  };

  const deleteAlternative = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/alternatives/${id}/`, {
        method: 'DELETE',
        
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to delete alternative');
      fetchProject();
    } catch (error) {
      console.error('Failed to delete alternative:', error);
    }
  };

  const getLevel = (criterionId: string): number => {
    const findCriterion = (criteria: Criterion[]): Criterion | null => {
      for (const criterion of criteria) {
        if (criterion.id === criterionId) return criterion;
        if (criterion.children) {
          const found = findCriterion(criterion.children);
          if (found) return found;
        }
      }
      return null;
    };

    const criterion = findCriterion(project?.criteria || []);
    return criterion?.level || 0;
  };

  const getNextOrderIndex = (parentId: string | null): number => {
    if (!project) return 1;

    if (!parentId) {
      return project.criteria.length + 1;
    }

    const findCriterion = (criteria: Criterion[]): Criterion | null => {
      for (const criterion of criteria) {
        if (criterion.id === parentId) return criterion;
        if (criterion.children) {
          const found = findCriterion(criterion.children);
          if (found) return found;
        }
      }
      return null;
    };

    const parent = findCriterion(project.criteria);
    return (parent?.children?.length || 0) + 1;
  };

  const renderCriterion = (criterion: Criterion, depth = 0) => {
    const indent = depth * 24;
    const canAddChild = criterion.level < 4;

    return (
      <div key={criterion.id} style={{ marginLeft: `${indent}px` }}>
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${ 
                criterion.level === 1 ? 'bg-blue-100 text-blue-800' :
                criterion.level === 2 ? 'bg-green-100 text-green-800' :
                criterion.level === 3 ? 'bg-yellow-100 text-yellow-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                Level {criterion.level}
              </span>
              <h5 className="font-medium">{criterion.name}</h5>
            </div>
            {criterion.description && (
              <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            {canAddChild && (
              <button
                onClick={() => setEditingCriterion(criterion.id)}
                className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                하위기준 추가
              </button>
            )}
            <button
              onClick={() => deleteCriterion(criterion.id)}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        </div>
        
        {editingCriterion === criterion.id && (
          <div className="ml-6 p-3 bg-gray-50 border border-gray-200 rounded-lg mb-2">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="기준명"
                value={newCriterionName}
                onChange={(e) => setNewCriterionName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="설명 (선택사항)"
                value={newCriterionDescription}
                onChange={(e) => setNewCriterionDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => addCriterion(criterion.id)}
                  disabled={saving}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '추가'}
                </button>
                <button
                  onClick={() => {
                    setEditingCriterion(null);
                    setNewCriterionName('');
                    setNewCriterionDescription('');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
        
        {criterion.children && criterion.children.map(child => 
          renderCriterion(child, depth + 1)
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card title="모델 빌더">
        <div className="text-center py-8">로딩 중...</div>
      </Card>
    );
  }

  if (!project) {
    return (
      <Card title="모델 빌더">
        <div className="text-center py-8">프로젝트를 찾을 수 없습니다.</div>
      </Card>
    );
  }

  // 모델 구축 완료 후 다음 단계로
  const handleProceedToEvaluation = () => {
    onComplete?.();
  };

  // 빌더 모드 선택 화면
  if (builderMode === 'select') {
    return (
      <div className="space-y-6">
        <Card title={`모델 구축 방식 선택: ${project?.title || 'Loading...'}`}>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">🎯 프로젝트 목표</h4>
              <p className="text-blue-700">{project?.objective || project?.description}</p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                어떤 방식으로 모델을 구축하시겠습니까?
              </h3>
              <p className="text-gray-600 mb-6">
                프로젝트에 적합한 모델 구축 방식을 선택하세요
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 캔버스 기반 빌더 */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200">
                <div 
                  className="p-6 text-center"
                  onClick={() => setBuilderMode('canvas')}
                >
                  <div className="bg-blue-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                    <Squares2X2Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    캔버스 기반 빌더
                  </h3>
                  <p className="text-gray-600 mb-4">
                    드래그&드롭으로 시각적으로 모델을 구축합니다
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>✅ 3×3 기본 템플릿 제공</div>
                    <div>✅ 다양한 템플릿 지원</div>
                    <div>✅ 시각적 편집</div>
                    <div>✅ 다단계 계층구조</div>
                  </div>
                  <Button className="mt-4 w-full" variant="primary">
                    캔버스 빌더 시작
                  </Button>
                </div>
              </Card>

              {/* 폼 기반 빌더 */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-gray-200">
                <div 
                  className="p-6 text-center"
                  onClick={() => setBuilderMode('form')}
                >
                  <div className="bg-gray-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                    <ListBulletIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    전통적 폼 빌더
                  </h3>
                  <p className="text-gray-600 mb-4">
                    폼 기반으로 단계별로 모델을 구축합니다
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>✅ 단계별 가이드</div>
                    <div>✅ 상세 설정</div>
                    <div>✅ 기존 방식</div>
                    <div>✅ 안정적 구축</div>
                  </div>
                  <Button className="mt-4 w-full" variant="outline">
                    폼 빌더 시작
                  </Button>
                </div>
              </Card>
            </div>

            {/* 추천 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <p className="text-sm text-yellow-700">
                  <strong>추천:</strong> 처음 사용하시거나 복잡한 구조가 필요한 경우 
                  <strong className="text-yellow-800">캔버스 기반 빌더</strong>를 권장합니다.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 캔버스 빌더 모드
  if (builderMode === 'canvas') {
    return (
      <CanvasModelBuilder
        projectId={projectId}
        projectTitle={project?.title || ''}
        onSave={handleCanvasModelSave}
        onCancel={() => setBuilderMode('select')}
        initialModel={modelData}
      />
    );
  }

  // 모델 구축 완료 상태
  if (modelCompleted) {
    return (
      <div className="space-y-6">
        <Card title="모델 구축 완료">
          <div className="text-center space-y-4">
            <div className="bg-green-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                모델 구축이 완료되었습니다!
              </h3>
              <p className="text-gray-600">
                이제 평가자를 배정하고 평가를 시작할 수 있습니다.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-gray-900 mb-2">구축된 모델 요약</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>📊 총 노드 수: {modelData.length}개</div>
                <div>🎯 목표: {modelData.filter(n => n.type === 'goal').length}개</div>
                <div>📋 주기준: {modelData.filter(n => n.type === 'criteria').length}개</div>
                <div>📝 하위기준: {modelData.filter(n => n.type === 'sub_criteria').length}개</div>
                <div>🔄 대안: {modelData.filter(n => n.type === 'alternative').length}개</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setModelCompleted(false);
                  setBuilderMode('canvas');
                }}
              >
                모델 수정
              </Button>
              
              <Button 
                variant="primary" 
                onClick={handleProceedToEvaluation}
                className="flex items-center"
              >
                평가자 배정하기
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // 폼 기반 빌더 (기존 로직)
  return (
    <div className="space-y-6">
      <Card title={`모델 빌더: ${project?.title || 'Loading...'}`}>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">🎯 프로젝트 목표</h4>
            <p className="text-blue-700">{project?.objective || project?.description}</p>
          </div>

          {/* 캔버스 빌더로 전환 버튼 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-green-800 mb-1">💡 캔버스 빌더 사용하기</h4>
                <p className="text-sm text-green-700">더 직관적이고 편리한 캔버스 기반 빌더를 사용해보세요!</p>
              </div>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setBuilderMode('canvas')}
                className="flex items-center"
              >
                <Squares2X2Icon className="h-4 w-4 mr-1" />
                캔버스 빌더
              </Button>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('criteria')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'criteria' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                평가 기준
              </button>
              <button
                onClick={() => setActiveTab('alternatives')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'alternatives' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                대안
              </button>
              <button
                onClick={() => setActiveTab('evaluators')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'evaluators' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                평가자 배정
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                설정
              </button>
            </nav>
          </div>
        </div>
      </Card>

      {/* 탭별 컨텐츠 */}
      {activeTab === 'criteria' && (
        <Card title="평가 기준 (Criteria)">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">기준 계층 구조</h4>
            <button
              onClick={() => setEditingCriterion('root')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              주기준 추가
            </button>
          </div>

          {editingCriterion === 'root' && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="기준명"
                  value={newCriterionName}
                  onChange={(e) => setNewCriterionName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="설명 (선택사항)"
                  value={newCriterionDescription}
                  onChange={(e) => setNewCriterionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => addCriterion(null)}
                    disabled={saving}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {saving ? '저장 중...' : '추가'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCriterion(null);
                      setNewCriterionName('');
                      setNewCriterionDescription('');
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {project.criteria.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              기준이 없습니다. 주기준을 먼저 추가해주세요.
            </div>
          ) : (
            <div className="space-y-2">
              {project.criteria.map(criterion => renderCriterion(criterion))}
            </div>
          )}
        </div>
        </Card>
      )}

      {activeTab === 'alternatives' && (
        <Card title="대안 (Alternatives)">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">대안 목록</h4>
            <button
              onClick={() => setEditingAlternative('new')}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              대안 추가
            </button>
          </div>

          {editingAlternative === 'new' && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="대안명"
                  value={newAlternativeName}
                  onChange={(e) => setNewAlternativeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  placeholder="설명 (선택사항)"
                  value={newAlternativeDescription}
                  onChange={(e) => setNewAlternativeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={addAlternative}
                    disabled={saving}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {saving ? '저장 중...' : '추가'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingAlternative(null);
                      setNewAlternativeName('');
                      setNewAlternativeDescription('');
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          )}

          {project.alternatives.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              대안이 없습니다. 비교할 대안을 추가해주세요.
            </div>
          ) : (
            <div className="grid gap-4">
              {project.alternatives.map((alternative) => (
                <div key={alternative.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium">{alternative.name}</h5>
                    {alternative.description && (
                      <p className="text-sm text-gray-600 mt-1">{alternative.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteAlternative(alternative.id)}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </Card>
      )}

      {activeTab === 'evaluators' && (
        <EvaluatorAssignment 
          projectId={projectId}
          onComplete={() => {
            // 평가자 배정 완료 후 처리
            console.log('Evaluator assignment completed');
          }}
        />
      )}

      {activeTab === 'settings' && (
        <Card title="프로젝트 설정">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">⚙️ 모델 설정</h5>
              <p className="text-blue-700 text-sm">
                향후 버전에서 평가 방법론, 일관성 임계값 등의 설정을 관리할 수 있습니다.
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h6 className="font-medium mb-2">현재 설정</h6>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• 평가 방법: 쌍대비교 (Pairwise Comparison)</p>
                <p>• 일관성 임계값: 0.1</p>
                <p>• 가중치 계산: 기하평균법 (Geometric Mean)</p>
                <p>• 그룹 의사결정: 가중평균</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 모델 상태는 모든 탭에서 공통으로 표시 */}
      <Card title="모델 상태">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>주기준 수:</span>
            <span className="font-medium">{project.criteria.length}개</span>
          </div>
          <div className="flex justify-between items-center">
            <span>전체 기준 수:</span>
            <span className="font-medium">
              {project.criteria.reduce((count, criterion) => {
                const countChildren = (c: Criterion): number => 1 + (c.children?.reduce((sum, child) => sum + countChildren(child), 0) || 0);
                return count + countChildren(criterion);
              }, 0)}개
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>대안 수:</span>
            <span className="font-medium">{project.alternatives.length}개</span>
          </div>
          <div className="pt-3 border-t">
            <div className={`px-3 py-2 rounded text-sm ${
              project.criteria.length >= 2 && project.alternatives.length >= 2
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {project.criteria.length >= 2 && project.alternatives.length >= 2
                ? '✅ AHP 분석을 시작할 준비가 완료되었습니다!'
                : '⚠️ 최소 2개 이상의 기준과 대안이 필요합니다.'
              }
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModelBuilder;