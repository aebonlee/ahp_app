import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import HelpModal from '../common/HelpModal';
import TreeModelConfiguration from './TreeModelConfiguration';
import { ProjectStatus, ProjectFormData } from './ProjectCreationForm';

interface Project extends ProjectFormData {
  id: string;
  evaluatorCount?: number;
  completionRate?: number;
  lastActivity?: string;
}

interface Criterion {
  id: string;
  name: string;
  description?: string;
  weight?: number;
  parentId?: string;
  level: number;
  order: number;
}

interface Alternative {
  id: string;
  name: string;
  description?: string;
  order: number;
}


interface ModelConfigurationProps {
  project: Project;
  onBack: () => void;
  onSave: (criteria: Criterion[], alternatives: Alternative[]) => void;
}

const ModelConfiguration: React.FC<ModelConfigurationProps> = ({
  project,
  onBack,
  onSave
}) => {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [activeTab, setActiveTab] = useState<'criteria' | 'alternatives'>('criteria');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpType, setHelpType] = useState<'project-status' | 'model-building'>('model-building');
  const [viewMode, setViewMode] = useState<'simple' | 'tree'>('simple' as 'simple' | 'tree');
  const [showCriterionForm, setShowCriterionForm] = useState(false);
  const [showAlternativeForm, setShowAlternativeForm] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
  const [editingAlternative, setEditingAlternative] = useState<Alternative | null>(null);

  const [criterionForm, setCriterionForm] = useState({
    name: '',
    description: '',
    parentId: ''
  });

  const [alternativeForm, setAlternativeForm] = useState({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState<any>({});

  // 초기 데모 데이터 설정
  useEffect(() => {
    const demoCriteria: Criterion[] = [
      { id: 'c1', name: '기능성', description: '시스템의 핵심 기능 및 성능', level: 1, order: 1 },
      { id: 'c2', name: '사용성', description: '사용자 편의성 및 인터페이스', level: 1, order: 2 },
      { id: 'c3', name: '경제성', description: '도입 및 운영 비용', level: 1, order: 3 },
      { id: 'c4', name: '안정성', description: '시스템 안정성 및 보안', level: 1, order: 4 }
    ];

    const demoAlternatives: Alternative[] = [
      { id: 'a1', name: 'SAP ERP', description: '대규모 기업용 ERP 솔루션', order: 1 },
      { id: 'a2', name: 'Oracle ERP', description: '클라우드 기반 ERP 시스템', order: 2 },
      { id: 'a3', name: 'Microsoft Dynamics', description: '중소기업 최적화 ERP', order: 3 }
    ];

    setCriteria(demoCriteria);
    setAlternatives(demoAlternatives);
  }, []);

  const validateCriterionForm = () => {
    const newErrors: any = {};
    
    if (!criterionForm.name.trim()) {
      newErrors.name = '기준명을 입력해주세요.';
    }
    
    if (criteria.length >= 7) {
      newErrors.name = '기준은 최대 7개까지 추가할 수 있습니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAlternativeForm = () => {
    const newErrors: any = {};
    
    if (!alternativeForm.name.trim()) {
      newErrors.name = '대안명을 입력해주세요.';
    }
    
    if (alternatives.length >= 9) {
      newErrors.name = '대안은 최대 9개까지 추가할 수 있습니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCriterion = () => {
    if (!validateCriterionForm()) return;

    const newCriterion: Criterion = {
      id: `c${Date.now()}`,
      name: criterionForm.name,
      description: criterionForm.description,
      level: 1,
      order: criteria.length + 1
    };

    setCriteria([...criteria, newCriterion]);
    setCriterionForm({ name: '', description: '', parentId: '' });
    setShowCriterionForm(false);
    setErrors({});
  };

  const handleEditCriterion = () => {
    if (!validateCriterionForm() || !editingCriterion) return;

    setCriteria(criteria.map(c => 
      c.id === editingCriterion.id 
        ? { ...c, name: criterionForm.name, description: criterionForm.description }
        : c
    ));

    setEditingCriterion(null);
    setCriterionForm({ name: '', description: '', parentId: '' });
    setErrors({});
  };

  const handleDeleteCriterion = (criterionId: string) => {
    if (window.confirm('기준을 삭제하시겠습니까? 연관된 평가 데이터도 함께 삭제됩니다.')) {
      setCriteria(criteria.filter(c => c.id !== criterionId));
    }
  };

  const handleAddAlternative = () => {
    if (!validateAlternativeForm()) return;

    const newAlternative: Alternative = {
      id: `a${Date.now()}`,
      name: alternativeForm.name,
      description: alternativeForm.description,
      order: alternatives.length + 1
    };

    setAlternatives([...alternatives, newAlternative]);
    setAlternativeForm({ name: '', description: '' });
    setShowAlternativeForm(false);
    setErrors({});
  };

  const handleEditAlternative = () => {
    if (!validateAlternativeForm() || !editingAlternative) return;

    setAlternatives(alternatives.map(a => 
      a.id === editingAlternative.id 
        ? { ...a, name: alternativeForm.name, description: alternativeForm.description }
        : a
    ));

    setEditingAlternative(null);
    setAlternativeForm({ name: '', description: '' });
    setErrors({});
  };

  const handleDeleteAlternative = (alternativeId: string) => {
    if (window.confirm('대안을 삭제하시겠습니까? 연관된 평가 데이터도 함께 삭제됩니다.')) {
      setAlternatives(alternatives.filter(a => a.id !== alternativeId));
    }
  };

  const handleSaveModel = () => {
    if (criteria.length < 2) {
      alert('최소 2개 이상의 기준을 추가해주세요.');
      return;
    }
    
    if (alternatives.length < 2) {
      alert('최소 2개 이상의 대안을 추가해주세요.');
      return;
    }

    onSave(criteria, alternatives);
  };

  const canEdit = (project.status === 'creating' || project.status === 'waiting') && project.status !== undefined;

  const getStatusInfo = () => {
    switch (project.status || 'creating') {
      case 'creating':
        return { 
          message: '현재 모델을 자유롭게 수정할 수 있습니다.',
          color: 'text-green-600'
        };
      case 'waiting':
        return { 
          message: '모델이 완성되었습니다. 평가자를 배정하여 평가를 시작할 수 있습니다.',
          color: 'text-blue-600'
        };
      case 'evaluating':
        return { 
          message: '평가가 진행 중입니다. 모델 수정 시 기존 평가 데이터가 삭제됩니다.',
          color: 'text-orange-600'
        };
      case 'completed':
        return { 
          message: '평가가 완료되어 모델을 수정할 수 없습니다.',
          color: 'text-red-600'
        };
      default:
        return { message: '', color: '' };
    }
  };

  const statusInfo = getStatusInfo();

  // Helper to get button variant
  const getButtonVariant = (mode: 'simple' | 'tree') => {
    return viewMode === mode ? 'primary' : 'secondary';
  };

  // If tree mode is selected, render TreeModelConfiguration
  if (viewMode === 'tree') {
    return (
      <TreeModelConfiguration
        project={project}
        onBack={onBack}
        onSave={(treeModel, alternatives) => {
          // Convert tree model to criteria format for compatibility
          const flatCriteria: Criterion[] = [];
          const flattenTree = (nodes: any[], parentId?: string) => {
            nodes.forEach(node => {
              if (node.type === 'criterion') {
                flatCriteria.push({
                  id: node.id,
                  name: node.name,
                  description: node.description,
                  parentId: node.parentId,
                  level: node.level,
                  order: node.order
                });
              }
              if (node.children) {
                flattenTree(node.children, node.id);
              }
            });
          };
          flattenTree(treeModel);
          onSave(flatCriteria, alternatives);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" onClick={onBack}>
              ← 뒤로
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">모델 구성</h2>
            <div className="flex space-x-2">
              <Button
                variant={getButtonVariant('simple')}
                onClick={() => setViewMode('simple')}
                size="sm"
              >
                📋 기본 모드
              </Button>
              <Button
                variant={getButtonVariant('tree')}
                onClick={() => setViewMode('tree')}
                size="sm"
              >
                🌳 트리 모드
              </Button>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setHelpType('model-building');
                setShowHelpModal(true);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              ❓ 도움말
            </Button>
          </div>
          <div className="mt-2">
            <p className="text-lg font-medium text-gray-700">{project.name}</p>
            <p className="text-sm text-gray-600">{project.description}</p>
            <p className={`text-sm mt-1 ${statusInfo.color}`}>
              {statusInfo.message}
            </p>
          </div>
        </div>
        <div className="text-right">
          <Button
            variant="secondary"
            onClick={() => {
              setHelpType('project-status');
              setShowHelpModal(true);
            }}
            className="mb-2 block"
          >
            프로젝트 상태 설명
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveModel}
            disabled={!canEdit || criteria.length < 2 || alternatives.length < 2}
          >
            모델 저장
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">모델 구축 진행도</h3>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  criteria.length >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  ✓
                </span>
                <span className="ml-2 text-sm">기준 설정 ({criteria.length}/2+)</span>
              </div>
              <div className="flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  alternatives.length >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  ✓
                </span>
                <span className="ml-2 text-sm">대안 설정 ({alternatives.length}/2+)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('criteria')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'criteria'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            평가 기준 ({criteria.length})
          </button>
          <button
            onClick={() => setActiveTab('alternatives')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alternatives'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            대안 ({alternatives.length})
          </button>
        </nav>
      </div>

      {/* Criteria Tab */}
      {activeTab === 'criteria' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">평가 기준</h3>
                <p className="text-sm text-gray-600">대안을 평가할 기준들을 정의합니다. (권장: 3-7개)</p>
              </div>
              {canEdit && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowCriterionForm(true);
                    setEditingCriterion(null);
                    setCriterionForm({ name: '', description: '', parentId: '' });
                  }}
                >
                  + 기준 추가
                </Button>
              )}
            </div>

            {/* Add/Edit Form */}
            {(showCriterionForm || editingCriterion) && canEdit && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-md font-semibold mb-3">
                  {editingCriterion ? '기준 수정' : '새 기준 추가'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="criterion-name"
                    label="기준명"
                    value={criterionForm.name}
                    onChange={(value) => setCriterionForm({ ...criterionForm, name: value })}
                    error={errors.name}
                    placeholder="예: 기능성, 사용성, 경제성"
                    required
                  />
                  <Input
                    id="criterion-description"
                    label="설명"
                    value={criterionForm.description}
                    onChange={(value) => setCriterionForm({ ...criterionForm, description: value })}
                    placeholder="기준에 대한 자세한 설명"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowCriterionForm(false);
                      setEditingCriterion(null);
                      setCriterionForm({ name: '', description: '', parentId: '' });
                      setErrors({});
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    onClick={editingCriterion ? handleEditCriterion : handleAddCriterion}
                  >
                    {editingCriterion ? '수정' : '추가'}
                  </Button>
                </div>
              </div>
            )}

            {/* Criteria List */}
            <div className="space-y-2 mt-4">
              {criteria.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>평가 기준을 추가해주세요.</p>
                  <p className="text-sm">최소 2개 이상의 기준이 필요합니다.</p>
                </div>
              ) : (
                criteria.map((criterion, index) => (
                  <div
                    key={criterion.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                        {criterion.description && (
                          <p className="text-sm text-gray-600">{criterion.description}</p>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingCriterion(criterion);
                            setCriterionForm({
                              name: criterion.name,
                              description: criterion.description || '',
                              parentId: criterion.parentId || ''
                            });
                            setShowCriterionForm(false);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteCriterion(criterion.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Criteria Guidelines */}
          <Card className="bg-amber-50 border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-2">기준 설정 가이드라인</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• <strong>3~7개</strong>의 기준을 설정하는 것이 적당합니다 (인간의 인지 한계 고려)</li>
              <li>• 기준들은 서로 <strong>독립적</strong>이어야 합니다</li>
              <li>• <strong>구체적이고 측정 가능한</strong> 기준으로 설정하세요</li>
              <li>• 평가 방법: <strong>{project.evaluationMethod === 'pairwise-practical' ? '쌍대비교-실용' : project.evaluationMethod === 'direct-input' ? '직접입력' : '쌍대비교-이론'}</strong></li>
            </ul>
          </Card>
        </div>
      )}

      {/* Alternatives Tab */}
      {activeTab === 'alternatives' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">대안</h3>
                <p className="text-sm text-gray-600">비교하고 선택할 대안들을 정의합니다. (권장: 2-9개)</p>
              </div>
              {canEdit && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowAlternativeForm(true);
                    setEditingAlternative(null);
                    setAlternativeForm({ name: '', description: '' });
                  }}
                >
                  + 대안 추가
                </Button>
              )}
            </div>

            {/* Add/Edit Form */}
            {(showAlternativeForm || editingAlternative) && canEdit && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-md font-semibold mb-3">
                  {editingAlternative ? '대안 수정' : '새 대안 추가'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="alternative-name"
                    label="대안명"
                    value={alternativeForm.name}
                    onChange={(value) => setAlternativeForm({ ...alternativeForm, name: value })}
                    error={errors.name}
                    placeholder="예: SAP ERP, Oracle ERP"
                    required
                  />
                  <Input
                    id="alternative-description"
                    label="설명"
                    value={alternativeForm.description}
                    onChange={(value) => setAlternativeForm({ ...alternativeForm, description: value })}
                    placeholder="대안에 대한 자세한 설명"
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowAlternativeForm(false);
                      setEditingAlternative(null);
                      setAlternativeForm({ name: '', description: '' });
                      setErrors({});
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    onClick={editingAlternative ? handleEditAlternative : handleAddAlternative}
                  >
                    {editingAlternative ? '수정' : '추가'}
                  </Button>
                </div>
              </div>
            )}

            {/* Alternatives List */}
            <div className="space-y-2 mt-4">
              {alternatives.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">⚖️</div>
                  <p>비교할 대안을 추가해주세요.</p>
                  <p className="text-sm">최소 2개 이상의 대안이 필요합니다.</p>
                </div>
              ) : (
                alternatives.map((alternative, index) => (
                  <div
                    key={alternative.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900">{alternative.name}</h4>
                        {alternative.description && (
                          <p className="text-sm text-gray-600">{alternative.description}</p>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingAlternative(alternative);
                            setAlternativeForm({
                              name: alternative.name,
                              description: alternative.description || ''
                            });
                            setShowAlternativeForm(false);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteAlternative(alternative.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Alternatives Guidelines */}
          <Card className="bg-green-50 border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">대안 설정 가이드라인</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>2~9개</strong>의 대안을 설정하는 것이 적당합니다</li>
              <li>• 대안들은 서로 <strong>배타적</strong>이어야 합니다</li>
              <li>• <strong>실현 가능한</strong> 대안들로 구성하세요</li>
              <li>• 각 대안은 모든 기준에 대해 <strong>평가가 가능</strong>해야 합니다</li>
            </ul>
          </Card>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal
          isVisible={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          helpType={helpType}
        />
      )}
    </div>
  );
};

export default ModelConfiguration;