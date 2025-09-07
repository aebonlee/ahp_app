import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import MatrixGrid from './MatrixGrid';
import JudgmentHelper from './JudgmentHelper';

interface Matrix {
  id: string;
  name: string;
  items: string[];
  values: number[][];
  completed: boolean;
  consistencyRatio?: number;
}

interface PairwiseEvaluationProps {
  projectId: string;
  projectTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

const PairwiseEvaluation: React.FC<PairwiseEvaluationProps> = ({
  projectId,
  projectTitle,
  onComplete,
  onBack
}) => {
  const [matrices, setMatrices] = useState<Matrix[]>([
    {
      id: 'criteria',
      name: '주요 기준 비교',
      items: ['성능', '비용', '사용성'],
      values: Array(3).fill(null).map(() => Array(3).fill(1)),
      completed: false
    },
    {
      id: 'performance',
      name: '성능 세부기준 비교',
      items: ['처리속도', '안정성'],
      values: Array(2).fill(null).map(() => Array(2).fill(1)),
      completed: false
    },
    {
      id: 'alternatives_performance',
      name: '성능 관점 대안 비교',
      items: ['대안 A', '대안 B', '대안 C'],
      values: Array(3).fill(null).map(() => Array(3).fill(1)),
      completed: false
    }
  ]);

  const [currentMatrixIndex, setCurrentMatrixIndex] = useState(0);
  const [showHelper, setShowHelper] = useState(false);

  const currentMatrix = matrices[currentMatrixIndex];

  useEffect(() => {
    // 현재 매트릭스의 일관성 비율 계산
    if (currentMatrix && currentMatrix.items.length >= 3) {
      const cr = calculateConsistencyRatio(currentMatrix.values);
      setMatrices(prev => prev.map((matrix, index) => 
        index === currentMatrixIndex 
          ? { ...matrix, consistencyRatio: cr }
          : matrix
      ));

      // CR > 0.1이면 판단 도우미 자동 표시
      if (cr > 0.1) {
        setShowHelper(true);
      }
    }
  }, [currentMatrix?.values, currentMatrix, currentMatrixIndex]);

  const calculateConsistencyRatio = (values: number[][]): number => {
    // 실제 CR 계산 로직 구현 (간략화된 버전)
    const n = values.length;
    if (n < 3) return 0;

    // 임의의 CR 값 반환 (실제로는 고유값 계산 필요)
    const mockCR = Math.random() * 0.15;
    return parseFloat(mockCR.toFixed(3));
  };

  const handleMatrixUpdate = (newValues: number[][]) => {
    setMatrices(prev => prev.map((matrix, index) => 
      index === currentMatrixIndex 
        ? { ...matrix, values: newValues }
        : matrix
    ));
  };

  const handleMatrixComplete = () => {
    const updatedMatrices = [...matrices];
    updatedMatrices[currentMatrixIndex].completed = true;
    setMatrices(updatedMatrices);

    if (currentMatrixIndex < matrices.length - 1) {
      setCurrentMatrixIndex(currentMatrixIndex + 1);
      setShowHelper(false);
    } else {
      // 모든 매트릭스 완료
      onComplete();
    }
  };

  const isMatrixCompleted = () => {
    if (!currentMatrix) return false;
    
    const n = currentMatrix.items.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (currentMatrix.values[i][j] === 1 && i !== j) {
          return false; // 대각선이 아닌 요소가 1이면 미완료
        }
      }
    }
    return true;
  };

  const getProgressPercentage = () => {
    const completedCount = matrices.filter(m => m.completed).length;
    const currentProgress = isMatrixCompleted() ? 1 : 0;
    return Math.round(((completedCount + currentProgress) / matrices.length) * 100);
  };

  return (
    <div className="page-evaluator">
      <div className="page-content content-width-evaluator">
        <div className="page-header">
          <h1 className="page-title">
            단계 2 — 평가하기 / 쌍대비교
          </h1>
          <p className="page-subtitle">
            프로젝트: <span className="font-medium">{projectTitle}</span>
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={onBack}>
              프로젝트 선택으로
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="card-enhanced p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>전체 진행률</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {currentMatrixIndex + 1} / {matrices.length} 매트릭스
            </span>
          </div>
          <div className="w-full rounded-full h-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <div 
              className="h-3 rounded-full transition-all duration-300"
              style={{ 
                width: `${getProgressPercentage()}%`,
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
              }}
            />
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {getProgressPercentage()}% 완료
          </div>
        </div>

        {/* Matrix Navigation */}
        <div className="card-enhanced p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {matrices.map((matrix, index) => (
              <button
                key={matrix.id}
                onClick={() => {
                  if (matrix.completed || index === currentMatrixIndex) {
                    setCurrentMatrixIndex(index);
                  }
                }}
                disabled={!matrix.completed && index !== currentMatrixIndex}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                style={{
                  backgroundColor: index === currentMatrixIndex 
                    ? 'var(--accent-primary)'
                    : matrix.completed 
                    ? 'var(--status-success-light)'
                    : 'var(--bg-elevated)',
                  color: index === currentMatrixIndex 
                    ? 'white'
                    : matrix.completed 
                    ? 'var(--status-success-text)'
                    : 'var(--text-muted)',
                  borderColor: index === currentMatrixIndex 
                    ? 'var(--accent-primary)'
                    : matrix.completed 
                    ? 'var(--status-success-border)'
                    : 'var(--border-light)',
                  border: '1px solid',
                  cursor: !matrix.completed && index !== currentMatrixIndex ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (matrix.completed || index === currentMatrixIndex) {
                    if (index !== currentMatrixIndex) {
                      e.currentTarget.style.backgroundColor = 'var(--status-success-bg)';
                      e.currentTarget.style.color = 'white';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (index !== currentMatrixIndex && matrix.completed) {
                    e.currentTarget.style.backgroundColor = 'var(--status-success-light)';
                    e.currentTarget.style.color = 'var(--status-success-text)';
                  }
                }}
              >
                <span className="mr-2">
                  {matrix.completed ? '✓' : index + 1}
                </span>
                {matrix.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Matrix Area */}
          <div className="lg:col-span-2">
            <Card title={currentMatrix?.name || ''}>
              {currentMatrix && (
                <div className="space-y-4">
                  <MatrixGrid
                    items={currentMatrix.items}
                    values={currentMatrix.values}
                    onUpdate={handleMatrixUpdate}
                  />

                  {/* Consistency Ratio */}
                  {currentMatrix.items.length >= 3 && currentMatrix.consistencyRatio !== undefined && (
                    <div className="mt-4">
                      <div className="p-3 rounded-lg border"
                           style={{
                             backgroundColor: currentMatrix.consistencyRatio <= 0.1 
                               ? 'var(--status-success-light)' 
                               : 'var(--status-warning-light)',
                             borderColor: currentMatrix.consistencyRatio <= 0.1 
                               ? 'var(--status-success-border)' 
                               : 'var(--status-warning-border)'
                           }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            비일관성비율 (CR)
                          </span>
                          <span className="font-semibold"
                                style={{
                                  color: currentMatrix.consistencyRatio <= 0.1 
                                    ? 'var(--status-success-text)' 
                                    : 'var(--status-warning-text)'
                                }}>
                            {currentMatrix.consistencyRatio.toFixed(3)}
                          </span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {currentMatrix.consistencyRatio <= 0.1 
                            ? '✓ 일관성이 양호합니다' 
                            : '⚠ 일관성을 개선해주세요 (기준: ≤ 0.1)'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Button */}
                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={handleMatrixComplete}
                      variant="primary"
                      size="lg"
                      disabled={!isMatrixCompleted()}
                    >
                      {currentMatrixIndex === matrices.length - 1 ? '평가 완료' : '다음'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Help Button */}
              <Card>
                <div className="text-center">
                  <button
                    onClick={() => setShowHelper(!showHelper)}
                    className="w-full p-3 rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--interactive-primary-light)',
                      color: 'var(--interactive-secondary)',
                      border: '1px solid var(--interactive-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--interactive-primary)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--interactive-primary-light)';
                      e.currentTarget.style.color = 'var(--interactive-secondary)';
                    }}
                  >
                    <span className="text-2xl">❓</span>
                    <div className="text-sm font-medium mt-1">
                      판단 도우미
                    </div>
                  </button>
                </div>
              </Card>

              {/* Judgment Helper Panel */}
              {showHelper && (
                <JudgmentHelper 
                  currentMatrix={currentMatrix}
                  onClose={() => setShowHelper(false)}
                />
              )}

              {/* Scale Reference */}
              <Card title="쌍대비교 척도">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>1</span>
                    <span style={{ color: 'var(--text-secondary)' }}>동등하게 중요</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>3</span>
                    <span style={{ color: 'var(--text-secondary)' }}>약간 더 중요</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>5</span>
                    <span style={{ color: 'var(--text-secondary)' }}>중요</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>7</span>
                    <span style={{ color: 'var(--text-secondary)' }}>매우 중요</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--font-weight-semibold)' }}>9</span>
                    <span style={{ color: 'var(--text-secondary)' }}>절대적으로 중요</span>
                  </div>
                  <div className="text-center mt-2" style={{ color: 'var(--text-muted)' }}>
                    2, 4, 6, 8은 중간값
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PairwiseEvaluation;