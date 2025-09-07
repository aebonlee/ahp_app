import React, { useState, useEffect } from 'react';

interface Alternative {
  id: string;
  name: string;
  description: string;
  score: number;
}

interface AlternativeManagementProps {
  projectId: string;
  onAlternativesChange?: (alternatives: Alternative[]) => void;
}

const AlternativeManagement: React.FC<AlternativeManagementProps> = ({
  projectId,
  onAlternativesChange
}) => {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [newAlternative, setNewAlternative] = useState({
    name: '',
    description: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlternatives();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadAlternatives = async () => {
    setLoading(true);
    try {
      // 실제로는 API 호출
      // const response = await apiService.get(`/api/projects/${projectId}/alternatives`);
      // setAlternatives(response);
      
      // 데모 데이터
      const demoAlternatives: Alternative[] = [
        { id: '1', name: '대안 A', description: '첫 번째 선택지', score: 0 },
        { id: '2', name: '대안 B', description: '두 번째 선택지', score: 0 },
        { id: '3', name: '대안 C', description: '세 번째 선택지', score: 0 }
      ];
      setAlternatives(demoAlternatives);
      
      if (onAlternativesChange) {
        onAlternativesChange(demoAlternatives);
      }
    } catch (err) {
      setError('대안을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlternative = async () => {
    if (!newAlternative.name.trim()) {
      setError('대안명을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const alternative: Alternative = {
        id: Date.now().toString(),
        name: newAlternative.name,
        description: newAlternative.description,
        score: 0
      };

      const updatedAlternatives = [...alternatives, alternative];
      setAlternatives(updatedAlternatives);
      
      if (onAlternativesChange) {
        onAlternativesChange(updatedAlternatives);
      }

      setNewAlternative({ name: '', description: '' });
      setIsFormOpen(false);
      setError(null);
    } catch (err) {
      setError('대안 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlternative = async (id: string) => {
    if (window.confirm('이 대안을 삭제하시겠습니까?')) {
      const updatedAlternatives = alternatives.filter(a => a.id !== id);
      setAlternatives(updatedAlternatives);
      
      if (onAlternativesChange) {
        onAlternativesChange(updatedAlternatives);
      }
    }
  };

  if (loading) {
    return <div className="alternatives-loading">대안을 불러오는 중...</div>;
  }

  return (
    <div className="alternatives-management">
      <div className="alternatives-header">
        <h3>대안 관리</h3>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setIsFormOpen(true)}
        >
          대안 추가
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="alternatives-list">
        {alternatives.length === 0 ? (
          <div className="empty-alternatives">
            <div className="empty-icon">🎯</div>
            <h4>등록된 대안이 없습니다</h4>
            <p>비교할 대안들을 추가해보세요.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setIsFormOpen(true)}
            >
              첫 대안 추가하기
            </button>
          </div>
        ) : (
          <div className="alternatives-grid">
            {alternatives.map((alternative, index) => (
              <div key={alternative.id} className="alternative-card">
                <div className="alternative-header">
                  <div className="alternative-number">#{index + 1}</div>
                  <h4>{alternative.name}</h4>
                  <div className="alternative-actions">
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
                      onClick={() => handleDeleteAlternative(alternative.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                
                {alternative.description && (
                  <p className="alternative-description">{alternative.description}</p>
                )}
                
                <div className="alternative-info">
                  {alternative.score > 0 ? (
                    <div className="alternative-score">
                      <span className="score-label">종합 점수:</span>
                      <span className="score-value">{alternative.score.toFixed(3)}</span>
                    </div>
                  ) : (
                    <div className="alternative-status">평가 대기</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {alternatives.length >= 2 && (
        <div className="alternatives-summary">
          <div className="summary-item">
            <span className="label">총 대안 수:</span>
            <span className="value">{alternatives.length}개</span>
          </div>
          <div className="summary-item">
            <span className="label">평가 상태:</span>
            <span className="value">
              {alternatives.filter(a => a.score > 0).length}/{alternatives.length} 완료
            </span>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>새 대안 추가</h3>
              <button 
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setIsFormOpen(false);
                  setNewAlternative({ name: '', description: '' });
                  setError(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>대안명 *</label>
                <input
                  type="text"
                  value={newAlternative.name}
                  onChange={(e) => setNewAlternative(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="예: 방안 A, 제품 X, 서비스 1..."
                  required
                />
              </div>

              <div className="form-group">
                <label>설명</label>
                <textarea
                  value={newAlternative.description}
                  onChange={(e) => setNewAlternative(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="대안에 대한 상세 설명을 입력하세요"
                  rows={4}
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setNewAlternative({ name: '', description: '' });
                    setError(null);
                  }}
                >
                  취소
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleAddAlternative}
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

export default AlternativeManagement;