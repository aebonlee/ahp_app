import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface Evaluator {
  id: string;
  email: string;
  name: string;
  phone?: string;
  assignedProjects?: ProjectAssignment[];
  isSelected?: boolean;
  createdAt?: string;
  lastActive?: string;
  status?: 'active' | 'inactive' | 'pending';
}

interface ProjectAssignment {
  projectId: string;
  projectName: string;
  assignedAt: string;
  completionRate: number;
  status: 'assigned' | 'completed' | 'in_progress';
}

interface EvaluatorManagementProps {
  projectId?: string;
  projectName?: string;
  onAssign?: (evaluatorIds: string[]) => void;
  onClose?: () => void;
}

const EvaluatorManagement: React.FC<EvaluatorManagementProps> = ({
  projectId,
  projectName,
  onAssign,
  onClose
}) => {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEvaluator, setEditingEvaluator] = useState<Evaluator | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Load project-specific evaluators from API
  useEffect(() => {
    if (projectId) {
      loadProjectEvaluators();
    } else {
      loadAllEvaluators();
    }
  }, [projectId]);

  const loadProjectEvaluators = async () => {
    try {
      const response = await fetch(`https://ahp-platform.onrender.com/api/projects/${projectId}/evaluators`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvaluators(data.evaluators || []);
      }
    } catch (error) {
      console.error('평가자 목록 로딩 실패:', error);
      loadDemoData();
    }
  };

  const loadAllEvaluators = async () => {
    try {
      const response = await fetch('https://ahp-platform.onrender.com/api/evaluators', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEvaluators(data.evaluators || []);
      }
    } catch (error) {
      console.error('전체 평가자 목록 로딩 실패:', error);
      loadDemoData();
    }
  };

  const loadDemoData = () => {
    const demoProjects = [
      { projectId: '1', projectName: 'AI 도구 선택 프로젝트', assignedAt: '2025-08-30', completionRate: 75, status: 'in_progress' as const },
      { projectId: '2', projectName: '마케팅 전략 평가', assignedAt: '2025-08-28', completionRate: 100, status: 'completed' as const },
      { projectId: '3', projectName: '제품 개발 우선순위', assignedAt: '2025-09-01', completionRate: 30, status: 'assigned' as const }
    ];

    const demoEvaluators: Evaluator[] = [
      { 
        id: '1', 
        email: 'evaluator1@company.com', 
        name: '김평가', 
        phone: '010-1234-5678',
        assignedProjects: [demoProjects[0], demoProjects[1]], 
        lastActive: '1시간 전',
        status: 'active'
      },
      { 
        id: '2', 
        email: 'evaluator2@company.com', 
        name: '이분석', 
        phone: '010-2345-6789',
        assignedProjects: [demoProjects[0], demoProjects[2]], 
        lastActive: '2시간 전',
        status: 'active'
      },
      { 
        id: '3', 
        email: 'evaluator3@company.com', 
        name: '박의사', 
        phone: '010-3456-7890',
        assignedProjects: [demoProjects[1]], 
        lastActive: '1일 전',
        status: 'active'
      },
      { 
        id: '4', 
        email: 'evaluator4@company.com', 
        name: '최결정', 
        assignedProjects: [], 
        lastActive: '3일 전',
        status: 'inactive'
      }
    ];
    
    if (projectId) {
      setEvaluators(demoEvaluators.filter(e => 
        e.assignedProjects?.some(p => p.projectId === projectId)
      ));
    } else {
      setEvaluators(demoEvaluators);
    }
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setEvaluators(evaluators.map(e => ({ ...e, isSelected: newSelectAll })));
  };

  const handleSelectEvaluator = (evaluatorId: string) => {
    setEvaluators(evaluators.map(e => 
      e.id === evaluatorId ? { ...e, isSelected: !e.isSelected } : e
    ));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }
    
    if (formData.phone && !/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '전화번호는 숫자와 하이픈(-)만 입력 가능합니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteEvaluator = async (evaluatorId: string, fromProject?: boolean) => {
    if (!confirm(fromProject ? 
      '이 평가자를 현재 프로젝트에서 제거하시겠습니까?' : 
      '이 평가자를 모든 프로젝트에서 완전히 삭제하시겠습니까?'
    )) return;

    try {
      const url = fromProject && projectId 
        ? `https://ahp-platform.onrender.com/api/evaluators/${evaluatorId}/project/${projectId}`
        : `https://ahp-platform.onrender.com/api/evaluators/${evaluatorId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // 성공 시 목록 다시 로드
        if (projectId) {
          loadProjectEvaluators();
        } else {
          loadAllEvaluators();
        }
        alert(fromProject ? '평가자가 프로젝트에서 제거되었습니다.' : '평가자가 완전히 삭제되었습니다.');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('평가자 삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAddEvaluator = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await fetch('https://ahp-platform.onrender.com/api/evaluators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          projectId: projectId || null
        })
      });

      if (response.ok) {
        setFormData({ email: '', name: '', phone: '' });
        setShowAddForm(false);
        setErrors({});
        
        // 목록 다시 로드
        if (projectId) {
          loadProjectEvaluators();
        } else {
          loadAllEvaluators();
        }
        alert('평가자가 성공적으로 추가되었습니다.');
      } else {
        alert('평가자 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('평가자 추가 오류:', error);
      alert('추가 중 오류가 발생했습니다.');
    }
  };

  const handleAddEvaluatorDemo = () => {
    if (!validateForm()) return;
    
    const newEvaluator: Evaluator = {
      id: `eval-${Date.now()}`,
      email: formData.email,
      name: formData.name,
      phone: formData.phone,
      assignedProjects: [],
      createdAt: new Date().toISOString(),
      lastActive: '방금 전'
    };
    
    setEvaluators([newEvaluator, ...evaluators]);
    setFormData({ email: '', name: '', phone: '' });
    setShowAddForm(false);
    setErrors({});
  };

  const handleEditEvaluator = () => {
    if (!validateForm()) return;
    
    setEvaluators(evaluators.map(e => 
      e.id === editingEvaluator?.id 
        ? { ...e, ...formData, lastActive: '방금 전' }
        : e
    ));
    
    setEditingEvaluator(null);
    setFormData({ email: '', name: '', phone: '' });
    setErrors({});
  };


  const handleAssignEvaluators = () => {
    const selectedEvaluatorIds = evaluators
      .filter(e => e.isSelected)
      .map(e => e.id);
    
    if (selectedEvaluatorIds.length === 0) {
      alert('평가자를 선택해주세요.');
      return;
    }
    
    if (onAssign) {
      onAssign(selectedEvaluatorIds);
    }
  };

  const filteredEvaluators = evaluators.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = evaluators.filter(e => e.isSelected).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {projectId ? `평가자 배정 - ${projectName}` : '평가자 관리'}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {projectId 
              ? '프로젝트에 평가자를 배정하거나 제외합니다.'
              : '평가자를 추가, 수정, 삭제할 수 있습니다.'}
          </p>
        </div>
        {onClose && (
          <Button variant="secondary" onClick={onClose}>
            닫기
          </Button>
        )}
      </div>

      {/* Search and Add */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 max-w-md">
            <Input
              id="search"
              placeholder="이름 또는 이메일로 검색..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setShowAddForm(true);
              setEditingEvaluator(null);
              setFormData({ email: '', name: '', phone: '' });
            }}
          >
            + 평가자 추가
          </Button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingEvaluator) && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-3">
              {editingEvaluator ? '평가자 수정' : '새 평가자 추가'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                id="email"
                label="이메일"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                error={errors.email}
                placeholder="email@example.com"
                required
              />
              <Input
                id="name"
                label="이름"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                error={errors.name}
                placeholder="홍길동"
                required
              />
              <Input
                id="phone"
                label="전화번호"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                error={errors.phone}
                placeholder="010-1234-5678"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingEvaluator(null);
                  setFormData({ email: '', name: '', phone: '' });
                  setErrors({});
                }}
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={editingEvaluator ? handleEditEvaluator : handleAddEvaluator}
              >
                {editingEvaluator ? '수정' : '추가'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Evaluators List */}
      <Card>
        {projectId && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                전체 선택 {selectedCount > 0 && `(${selectedCount}명 선택됨)`}
              </span>
            </label>
            <Button
              variant="primary"
              onClick={handleAssignEvaluators}
              disabled={selectedCount === 0}
            >
              평가자 배정
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {filteredEvaluators.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 평가자가 없습니다.
            </div>
          ) : (
            filteredEvaluators.map(evaluator => (
              <div
                key={evaluator.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  evaluator.isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
                } hover:shadow-sm transition-all`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  {projectId && (
                    <input
                      type="checkbox"
                      checked={evaluator.isSelected || false}
                      onChange={() => handleSelectEvaluator(evaluator.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{evaluator.name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        evaluator.status === 'active' ? 'bg-green-100 text-green-800' :
                        evaluator.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {evaluator.status === 'active' ? '활성' : 
                         evaluator.status === 'pending' ? '대기' : '비활성'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {evaluator.email}
                      {evaluator.phone && ` · ${evaluator.phone}`}
                    </div>
                    
                    {/* 프로젝트 할당 정보 */}
                    {evaluator.assignedProjects && evaluator.assignedProjects.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-600 mb-1">할당된 프로젝트 ({evaluator.assignedProjects.length}/3):</div>
                        <div className="flex flex-wrap gap-1">
                          {evaluator.assignedProjects.map((project, index) => (
                            <span key={index} className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              project.status === 'completed' ? 'bg-green-100 text-green-700' :
                              project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {project.projectName} ({project.completionRate}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {evaluator.lastActive && (
                      <div className="text-xs text-gray-400 mt-1">
                        최근 활동: {evaluator.lastActive}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingEvaluator(evaluator);
                      setFormData({
                        email: evaluator.email,
                        name: evaluator.name,
                        phone: evaluator.phone || ''
                      });
                      setShowAddForm(false);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                  >
                    수정
                  </button>
                  
                  {projectId && (
                    <button
                      onClick={() => handleDeleteEvaluator(evaluator.id, true)}
                      className="text-sm text-orange-600 hover:text-orange-800 px-2 py-1 rounded"
                      title="이 프로젝트에서만 제거"
                    >
                      제거
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteEvaluator(evaluator.id, false)}
                    className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded"
                    title="모든 프로젝트에서 완전 삭제"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">평가자 관리 안내</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>프로젝트별 관리:</strong> 평가자는 각 프로젝트에 개별적으로 할당됩니다 (최대 3개 프로젝트).</li>
          <li>• <strong>제거 vs 삭제:</strong> "제거"는 현재 프로젝트에서만, "삭제"는 모든 프로젝트에서 완전 제거됩니다.</li>
          <li>• <strong>자동 삭제:</strong> 프로젝트가 삭제되면 연결된 모든 평가자가 자동으로 제거됩니다.</li>
          <li>• <strong>진행률 추적:</strong> 각 프로젝트별로 평가 완료율이 별도 관리됩니다.</li>
          <li>• <strong>접근 권한:</strong> 평가자는 할당된 프로젝트에만 접근할 수 있습니다.</li>
        </ul>
      </Card>
    </div>
  );
};

export default EvaluatorManagement;