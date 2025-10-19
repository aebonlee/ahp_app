import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

interface Evaluator {
  id: string;
  email: string;
  name: string;
  phone?: string;
  assignedProjects?: string[];
  isSelected?: boolean;
  createdAt?: string;
  lastActive?: string;
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

  // Load demo evaluators
  useEffect(() => {
    const demoEvaluators: Evaluator[] = [
      { id: '1', email: 'admin@ahp.com', name: '관리자', assignedProjects: ['1'], lastActive: '1시간 전' },
      { id: '2', email: 'p001@ahp.com', name: '평가자1', assignedProjects: ['1'], lastActive: '2시간 전' },
      { id: '3', email: 'p002@ahp.com', name: '평가자2', assignedProjects: ['1'], lastActive: '1일 전' },
      { id: '4', email: 'p003@ahp.com', name: '평가자3', assignedProjects: [], lastActive: '2일 전' },
      { id: '5', email: 'p004@ahp.com', name: '평가자4', assignedProjects: [], lastActive: '3일 전' },
      { id: '6', email: 'p005@ahp.com', name: '평가자5', assignedProjects: ['2'], lastActive: '1주일 전' },
    ];
    
    // If projectId is provided, show assignment status
    if (projectId) {
      setEvaluators(demoEvaluators.map(e => ({
        ...e,
        isSelected: e.assignedProjects?.includes(projectId) || false
      })));
    } else {
      setEvaluators(demoEvaluators);
    }
  }, [projectId]);

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

  const handleAddEvaluator = () => {
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

  const handleDeleteEvaluator = (evaluatorId: string) => {
    if (window.confirm('평가자를 삭제하시겠습니까? 배정된 프로젝트에서 제외되며 평가 데이터가 삭제됩니다.')) {
      setEvaluators(evaluators.filter(e => e.id !== evaluatorId));
    }
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
                <div className="flex items-center space-x-4">
                  {projectId && (
                    <input
                      type="checkbox"
                      checked={evaluator.isSelected || false}
                      onChange={() => handleSelectEvaluator(evaluator.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{evaluator.name}</span>
                      {evaluator.assignedProjects && evaluator.assignedProjects.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {evaluator.assignedProjects.includes(projectId || '') ? '배정됨' : `${evaluator.assignedProjects.length}개 프로젝트`}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {evaluator.email}
                      {evaluator.phone && ` · ${evaluator.phone}`}
                    </div>
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
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteEvaluator(evaluator.id)}
                    className="text-sm text-red-600 hover:text-red-800"
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
          <li>• 평가자를 프로젝트에 배정하면 해당 프로젝트의 평가에 참여할 수 있습니다.</li>
          <li>• 평가 진행 중에도 평가자를 추가하거나 제외할 수 있습니다.</li>
          <li>• 평가자를 삭제하면 해당 평가자의 모든 평가 데이터가 삭제됩니다.</li>
          <li>• 이메일 주소는 평가자 로그인 ID로 사용됩니다.</li>
        </ul>
      </Card>
    </div>
  );
};

export default EvaluatorManagement;