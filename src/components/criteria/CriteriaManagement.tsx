import React, { useState, useEffect } from 'react';

interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  parent_id?: string;
  level: number;
}

interface CriteriaManagementProps {
  projectId: string;
  onCriteriaChange?: (criteria: Criterion[]) => void;
}

const CriteriaManagement: React.FC<CriteriaManagementProps> = ({
  projectId,
  onCriteriaChange
}) => {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [newCriterion, setNewCriterion] = useState({
    name: '',
    description: '',
    parent_id: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCriteria();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadCriteria = async () => {
    setLoading(true);
    try {
      // 실제로는 API 호출
      // const response = await apiService.get(`/api/projects/${projectId}/criteria`);
      // setCriteria(response);
      
      // 데모 데이터
      const demoCriteria: Criterion[] = [
        { id: '1', name: '비용', description: '총 비용', weight: 0, level: 1 },
        { id: '2', name: '품질', description: '제품 품질', weight: 0, level: 1 },
        { id: '3', name: '시간', description: '소요 시간', weight: 0, level: 1 }
      ];
      setCriteria(demoCriteria);
      
      if (onCriteriaChange) {
        onCriteriaChange(demoCriteria);
      }
    } catch (err) {
      setError('기준을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCriterion = async () => {
    if (!newCriterion.name.trim()) {
      setError('기준명을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const criterion: Criterion = {
        id: Date.now().toString(),
        name: newCriterion.name,
        description: newCriterion.description,
        weight: 0,
        parent_id: newCriterion.parent_id || undefined,
        level: newCriterion.parent_id ? 2 : 1
      };

      const updatedCriteria = [...criteria, criterion];
      setCriteria(updatedCriteria);
      
      if (onCriteriaChange) {
        onCriteriaChange(updatedCriteria);
      }

      setNewCriterion({ name: '', description: '', parent_id: '' });
      setIsFormOpen(false);
      setError(null);
    } catch (err) {
      setError('기준 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCriterion = async (id: string) => {
    if (window.confirm('이 기준을 삭제하시겠습니까?')) {
      const updatedCriteria = criteria.filter(c => c.id !== id);
      setCriteria(updatedCriteria);
      
      if (onCriteriaChange) {
        onCriteriaChange(updatedCriteria);
      }
    }
  };

  const getParentCriteria = () => {
    return criteria.filter(c => c.level === 1);
  };

  if (loading) {
    return <div className="criteria-loading">기준을 불러오는 중...</div>;
  }

  return (
    <div className="criteria-management">
      <div className="criteria-header">
        <h3>기준 관리</h3>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setIsFormOpen(true)}
        >
          기준 추가
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="criteria-list">
        {criteria.length === 0 ? (
          <div className="empty-criteria">
            <div className="empty-icon">📋</div>
            <h4>등록된 기준이 없습니다</h4>
            <p>의사결정을 위한 기준을 추가해보세요.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setIsFormOpen(true)}
            >
              첫 기준 추가하기
            </button>
          </div>
        ) : (
          <div className="criteria-grid">
            {criteria.map((criterion) => (
              <div key={criterion.id} className="criterion-card">
                <div className="criterion-header">
                  <h4>{criterion.name}</h4>
                  <div className="criterion-actions">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        // 편집 기능
                      }}
                    >
                      편집
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCriterion(criterion.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                
                {criterion.description && (
                  <p className="criterion-description">{criterion.description}</p>
                )}
                
                <div className="criterion-info">
                  <span className="criterion-level">
                    {criterion.level === 1 ? '주 기준' : '하위 기준'}
                  </span>
                  {criterion.weight > 0 && (
                    <span className="criterion-weight">
                      가중치: {(criterion.weight * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>새 기준 추가</h3>
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setIsFormOpen(false);
                  setNewCriterion({ name: '', description: '', parent_id: '' });
                  setError(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>기준명 *</label>
                <input
                  type="text"
                  value={newCriterion.name}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 비용, 품질, 시간..."
                  required
                />
              </div>

              <div className="form-group">
                <label>설명</label>
                <textarea
                  value={newCriterion.description}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="기준에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>상위 기준</label>
                <select
                  value={newCriterion.parent_id}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, parent_id: e.target.value }))}
                >
                  <option value="">주 기준으로 설정</option>
                  {getParentCriteria().map(parent => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name}의 하위 기준
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setNewCriterion({ name: '', description: '', parent_id: '' });
                    setError(null);
                  }}
                >
                  취소
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleAddCriterion}
                  disabled={loading}
                >
                  {loading ? '추가 중...' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriteriaManagement;