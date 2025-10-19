import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

interface Criteria {
  id: number;
  name: string;
  description?: string;
  type: 'criteria' | 'alternative';
  order: number;
  weight: number;
}

interface Comparison {
  id: number;
  criteria_a: number;
  criteria_b: number;
  criteria_a_name: string;
  criteria_b_name: string;
  value: number;
}

interface DjangoPairwiseComparisonProps {
  projectId: number;
  onComplete?: () => void;
  onBack?: () => void;
}

const DjangoPairwiseComparison: React.FC<DjangoPairwiseComparisonProps> = ({
  projectId,
  onComplete,
  onBack
}) => {
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPair, setCurrentPair] = useState<{ i: number; j: number } | null>(null);
  const [comparisonMatrix, setComparisonMatrix] = useState<number[][]>([]);

  // 비교 스케일 정의
  const comparisonScale = [
    { value: 9, label: '9 (극도로 중요)' },
    { value: 7, label: '7 (매우 중요)' },
    { value: 5, label: '5 (중요)' },
    { value: 3, label: '3 (약간 중요)' },
    { value: 1, label: '1 (동등)' },
    { value: 1/3, label: '1/3 (약간 덜 중요)' },
    { value: 1/5, label: '1/5 (덜 중요)' },
    { value: 1/7, label: '1/7 (매우 덜 중요)' },
    { value: 1/9, label: '1/9 (극도로 덜 중요)' }
  ];

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 평가기준과 기존 쌍대비교 데이터 로드
      const [criteriaResponse, comparisonsResponse] = await Promise.all([
        apiService.criteriaAPI.fetch(projectId),
        apiService.comparisonsAPI.fetch(projectId)
      ]);

      if (criteriaResponse.error) {
        throw new Error(criteriaResponse.error);
      }

      if (comparisonsResponse.error) {
        throw new Error(comparisonsResponse.error);
      }

      const criteriaData = (criteriaResponse.results || criteriaResponse.data || []) as Criteria[];
      const comparisonsData = (comparisonsResponse.results || comparisonsResponse.data || []) as any[];

      console.log('✅ 평가기준 로드:', criteriaData);
      console.log('✅ 쌍대비교 로드:', comparisonsData);

      setCriteria(criteriaData);
      setComparisons(comparisonsData);

      // 비교 매트릭스 초기화
      initializeComparisonMatrix(criteriaData, comparisonsData);

    } catch (error: any) {
      console.error('❌ 데이터 로드 실패:', error);
      setError(error.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const initializeComparisonMatrix = (criteriaList: Criteria[], comparisonsList: Comparison[]) => {
    const n = criteriaList.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(1));

    // 기존 비교 데이터를 매트릭스에 반영
    comparisonsList.forEach(comparison => {
      const iIndex = criteriaList.findIndex(c => c.id === comparison.criteria_a);
      const jIndex = criteriaList.findIndex(c => c.id === comparison.criteria_b);
      
      if (iIndex >= 0 && jIndex >= 0) {
        matrix[iIndex][jIndex] = comparison.value;
        matrix[jIndex][iIndex] = 1 / comparison.value; // 역수 관계
      }
    });

    setComparisonMatrix(matrix);
    
    // 첫 번째 미완료 쌍 찾기
    findNextUncompletedPair(matrix);
  };

  const findNextUncompletedPair = (matrix: number[][]) => {
    const n = matrix.length;
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        // 기본값 1이 아닌 경우 이미 비교된 것으로 간주
        if (matrix[i][j] === 1 && i !== j) {
          setCurrentPair({ i, j });
          return;
        }
      }
    }
    
    // 모든 쌍이 완료됨
    setCurrentPair(null);
  };

  const saveComparison = async (value: number) => {
    if (!currentPair) return;

    const { i, j } = currentPair;
    const criteriaA = criteria[i];
    const criteriaB = criteria[j];

    try {
      setSaving(true);
      setError(null);

      // 쌍대비교 저장
      const response = await apiService.comparisonsAPI.create({
        project: projectId,
        criteria_a: criteriaA.id,
        criteria_b: criteriaB.id,
        value: value
      });

      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ 쌍대비교 저장 성공:', response);

      // 매트릭스 업데이트
      const newMatrix = [...comparisonMatrix];
      newMatrix[i][j] = value;
      newMatrix[j][i] = 1 / value;
      setComparisonMatrix(newMatrix);

      // 다음 쌍 찾기
      findNextUncompletedPair(newMatrix);

      // 쌍대비교 목록 업데이트
      const responseData = response as any;
      setComparisons(prev => [...prev, {
        id: responseData.id || Date.now(),
        criteria_a: criteriaA.id,
        criteria_b: criteriaB.id,
        criteria_a_name: criteriaA.name,
        criteria_b_name: criteriaB.name,
        value: value
      }]);

    } catch (error: any) {
      console.error('❌ 쌍대비교 저장 실패:', error);
      setError(error.message || '비교 데이터 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const calculateWeights = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.projectAPI.calculateWeights(projectId);

      if (response.error) {
        throw new Error(response.error);
      }

      console.log('✅ 가중치 계산 완료:', response);
      
      const calculateResponse = response as any;
      alert(`AHP 가중치 계산이 완료되었습니다!\n${calculateResponse.message || '계산이 완료되었습니다.'}\n가중치: ${calculateResponse.data?.weights?.map((w: number) => w.toFixed(4)).join(', ') || '임시 계산'}`);
      
      onComplete?.();

    } catch (error: any) {
      console.error('❌ 가중치 계산 실패:', error);
      setError(error.message || '가중치 계산에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    if (criteria.length <= 1) return 100;
    
    const totalPairs = (criteria.length * (criteria.length - 1)) / 2;
    const completedPairs = comparisons.length;
    
    return Math.round((completedPairs / totalPairs) * 100);
  };

  if (loading) {
    return (
      <div className="django-pairwise-comparison">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>쌍대비교 데이터 로딩 중...</h3>
          <p>평가기준과 기존 비교 데이터를 불러오고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="django-pairwise-comparison">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>오류 발생</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={loadData} className="retry-button">다시 시도</button>
            {onBack && <button onClick={onBack} className="back-button">뒤로 가기</button>}
          </div>
        </div>
      </div>
    );
  }

  if (criteria.length < 2) {
    return (
      <div className="django-pairwise-comparison">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>평가기준이 부족합니다</h3>
          <p>쌍대비교를 수행하려면 최소 2개 이상의 평가기준이 필요합니다.</p>
          {onBack && <button onClick={onBack} className="back-button">뒤로 가기</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="django-pairwise-comparison">
      <div className="header">
        <div className="header-content">
          <h2>AHP 쌍대비교</h2>
          <div className="progress-info">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
            <span>{getCompletionPercentage()}% 완료</span>
          </div>
        </div>
        
        <div className="header-actions">
          {onBack && (
            <button onClick={onBack} className="back-button" disabled={saving}>
              뒤로 가기
            </button>
          )}
        </div>
      </div>

      <div className="comparison-content">
        {currentPair ? (
          <div className="comparison-section">
            <div className="comparison-question">
              <h3>다음 두 기준 중 어느 것이 더 중요합니까?</h3>
              
              <div className="criteria-comparison">
                <div className="criteria-item">
                  <div className="criteria-name">{criteria[currentPair.i].name}</div>
                  {criteria[currentPair.i].description && (
                    <div className="criteria-description">
                      {criteria[currentPair.i].description}
                    </div>
                  )}
                </div>
                
                <div className="vs-divider">VS</div>
                
                <div className="criteria-item">
                  <div className="criteria-name">{criteria[currentPair.j].name}</div>
                  {criteria[currentPair.j].description && (
                    <div className="criteria-description">
                      {criteria[currentPair.j].description}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="scale-selection">
              <h4>중요도를 선택하세요:</h4>
              <div className="scale-buttons">
                {comparisonScale.map((scale, index) => (
                  <button
                    key={index}
                    onClick={() => saveComparison(scale.value)}
                    disabled={saving}
                    className={`scale-button ${scale.value === 1 ? 'equal' : scale.value > 1 ? 'left-important' : 'right-important'}`}
                  >
                    <span className="scale-value">{scale.label}</span>
                    <span className="scale-meaning">
                      {scale.value > 1 && scale.value !== 1 && 
                        `${criteria[currentPair.i].name}이(가) 더 중요`}
                      {scale.value === 1 && '동등하게 중요'}
                      {scale.value < 1 && 
                        `${criteria[currentPair.j].name}이(가) 더 중요`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="completion-section">
            <div className="completion-message">
              <div className="success-icon">🎉</div>
              <h3>모든 쌍대비교가 완료되었습니다!</h3>
              <p>총 {comparisons.length}개의 쌍대비교를 완료했습니다.</p>
              <p>이제 AHP 가중치를 계산할 수 있습니다.</p>
            </div>

            <div className="completion-actions">
              <button 
                onClick={calculateWeights}
                disabled={loading}
                className="calculate-button"
              >
                {loading ? '계산 중...' : 'AHP 가중치 계산'}
              </button>
            </div>
          </div>
        )}

        <div className="comparison-summary">
          <h4>비교 현황</h4>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-value">{criteria.length}</span>
              <span className="stat-label">평가기준</span>
            </div>
            <div className="stat">
              <span className="stat-value">{comparisons.length}</span>
              <span className="stat-label">완료된 비교</span>
            </div>
            <div className="stat">
              <span className="stat-value">{Math.max(0, (criteria.length * (criteria.length - 1)) / 2 - comparisons.length)}</span>
              <span className="stat-label">남은 비교</span>
            </div>
          </div>

          {comparisons.length > 0 && (
            <div className="recent-comparisons">
              <h5>최근 비교 결과</h5>
              <div className="comparison-list">
                {comparisons.slice(-3).reverse().map((comparison, index) => (
                  <div key={comparison.id} className="comparison-item">
                    <span className="comparison-text">
                      {comparison.criteria_a_name} vs {comparison.criteria_b_name}
                    </span>
                    <span className="comparison-value">
                      {comparison.value === 1 ? '동등' : 
                       comparison.value > 1 ? `${comparison.value}:1` : 
                       `1:${(1/comparison.value).toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .django-pairwise-comparison {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .header-content h2 {
          margin: 0 0 12px 0;
          color: #333;
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-bar {
          width: 200px;
          height: 8px;
          background: #f3f4f6;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          transition: width 0.3s ease;
        }

        .loading-state,
        .error-state,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon,
        .empty-icon,
        .success-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }

        .error-actions {
          margin-top: 20px;
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .comparison-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .comparison-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .comparison-question h3 {
          margin: 0 0 24px 0;
          color: #333;
          text-align: center;
        }

        .criteria-comparison {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding: 24px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .criteria-item {
          flex: 1;
          text-align: center;
        }

        .criteria-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .criteria-description {
          font-size: 14px;
          color: #666;
          line-height: 1.4;
        }

        .vs-divider {
          font-size: 20px;
          font-weight: 700;
          color: #667eea;
          margin: 0 20px;
        }

        .scale-selection h4 {
          margin: 0 0 20px 0;
          color: #333;
          text-align: center;
        }

        .scale-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .scale-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .scale-button:hover:not(:disabled) {
          border-color: #667eea;
          background: #f8fafc;
        }

        .scale-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .scale-button.equal {
          border-color: #10b981;
        }

        .scale-button.left-important {
          border-left: 4px solid #3b82f6;
        }

        .scale-button.right-important {
          border-right: 4px solid #f59e0b;
        }

        .scale-value {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .scale-meaning {
          font-size: 12px;
          color: #666;
        }

        .completion-section {
          background: white;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .completion-message {
          margin-bottom: 32px;
        }

        .completion-message h3 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .completion-message p {
          color: #666;
          margin: 8px 0;
        }

        .calculate-button {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .calculate-button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .calculate-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .comparison-summary {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .comparison-summary h4 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .summary-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 24px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
          flex: 1;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #333;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .recent-comparisons h5 {
          margin: 0 0 12px 0;
          color: #333;
          font-size: 14px;
        }

        .comparison-list {
          space-y: 8px;
        }

        .comparison-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .comparison-text {
          font-size: 13px;
          color: #666;
        }

        .comparison-value {
          font-size: 13px;
          font-weight: 600;
          color: #333;
        }

        .back-button,
        .retry-button {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .back-button:hover:not(:disabled),
        .retry-button:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .back-button:disabled,
        .retry-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .comparison-content {
            grid-template-columns: 1fr;
          }
          
          .criteria-comparison {
            flex-direction: column;
            gap: 16px;
          }
          
          .vs-divider {
            margin: 12px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DjangoPairwiseComparison;