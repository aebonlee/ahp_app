import React, { useState, useEffect } from 'react';

interface ComparisonItem {
  id: string;
  name: string;
  description?: string;
}

interface Comparison {
  itemA: ComparisonItem;
  itemB: ComparisonItem;
  value: number; // 1/9 ~ 9 사이의 값
  comment?: string;
}

interface PairwiseComparisonProps {
  projectId: string;
  items: ComparisonItem[];
  type: 'criteria' | 'alternatives';
  onComparisonComplete?: (comparisons: Comparison[]) => void;
}

const PairwiseComparison: React.FC<PairwiseComparisonProps> = ({
  projectId,
  items,
  type,
  onComparisonComplete
}) => {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState(1);
  const [comment, setComment] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // 쌍대비교 척도
  const scales = [
    { value: 9, label: '절대적 중요', description: 'A가 B보다 절대적으로 중요' },
    { value: 7, label: '매우 중요', description: 'A가 B보다 매우 중요' },
    { value: 5, label: '중요', description: 'A가 B보다 중요' },
    { value: 3, label: '약간 중요', description: 'A가 B보다 약간 중요' },
    { value: 1, label: '동등', description: 'A와 B가 동등함' },
    { value: 1/3, label: '약간 덜 중요', description: 'A가 B보다 약간 덜 중요' },
    { value: 1/5, label: '덜 중요', description: 'A가 B보다 덜 중요' },
    { value: 1/7, label: '매우 덜 중요', description: 'A가 B보다 매우 덜 중요' },
    { value: 1/9, label: '절대적으로 덜 중요', description: 'A가 B보다 절대적으로 덜 중요' }
  ];

  // 모든 가능한 쌍 생성
  const generatePairs = () => {
    const pairs: { itemA: ComparisonItem; itemB: ComparisonItem }[] = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        pairs.push({ itemA: items[i], itemB: items[j] });
      }
    }
    return pairs;
  };

  const pairs = generatePairs();

  useEffect(() => {
    // 기존 비교 결과 로드
    loadComparisons();
  }, [projectId, items]);

  const loadComparisons = async () => {
    try {
      // 실제로는 API 호출
      // const response = await apiService.get(`/api/projects/${projectId}/comparisons/${type}`);
      // setComparisons(response);
      
      // 데모: 빈 비교 배열
      setComparisons([]);
      setCurrentIndex(0);
      setIsCompleted(false);
    } catch (error) {
      console.error('비교 결과 로드 실패:', error);
    }
  };

  const handleSaveComparison = () => {
    if (currentIndex < pairs.length) {
      const currentPair = pairs[currentIndex];
      const comparison: Comparison = {
        itemA: currentPair.itemA,
        itemB: currentPair.itemB,
        value: selectedValue,
        comment: comment.trim() || undefined
      };

      const updatedComparisons = [...comparisons];
      const existingIndex = updatedComparisons.findIndex(
        c => c.itemA.id === currentPair.itemA.id && c.itemB.id === currentPair.itemB.id
      );

      if (existingIndex >= 0) {
        updatedComparisons[existingIndex] = comparison;
      } else {
        updatedComparisons.push(comparison);
      }

      setComparisons(updatedComparisons);
      
      // 다음 비교로 이동
      if (currentIndex < pairs.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedValue(1);
        setComment('');
      } else {
        // 모든 비교 완료
        setIsCompleted(true);
        if (onComparisonComplete) {
          onComparisonComplete(updatedComparisons);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      
      // 이전 비교 결과 복원
      const prevComparison = comparisons.find(c => {
        const prevPair = pairs[currentIndex - 1];
        return c.itemA.id === prevPair.itemA.id && c.itemB.id === prevPair.itemB.id;
      });
      
      if (prevComparison) {
        setSelectedValue(prevComparison.value);
        setComment(prevComparison.comment || '');
      } else {
        setSelectedValue(1);
        setComment('');
      }
    }
  };

  const calculateProgress = () => {
    return pairs.length > 0 ? Math.round((comparisons.length / pairs.length) * 100) : 0;
  };

  if (items.length < 2) {
    return (
      <div className="pairwise-comparison">
        <div className="comparison-error">
          <div className="error-icon">⚠️</div>
          <h3>비교할 항목이 부족합니다</h3>
          <p>쌍대비교를 하려면 최소 2개 이상의 {type === 'criteria' ? '기준' : '대안'}이 필요합니다.</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="pairwise-comparison">
        <div className="comparison-completed">
          <div className="completion-icon">✅</div>
          <h3>쌍대비교 완료</h3>
          <p>{pairs.length}개의 비교를 모두 완료했습니다.</p>
          
          <div className="completion-summary">
            <h4>비교 결과 요약</h4>
            <div className="comparison-results">
              {comparisons.map((comp, index) => (
                <div key={index} className="comparison-result">
                  <span className="comparison-pair">
                    {comp.itemA.name} vs {comp.itemB.name}
                  </span>
                  <span className="comparison-value">
                    {comp.value === 1 ? '동등' : 
                     comp.value > 1 ? `${comp.value}:1` : 
                     `1:${Math.round(1/comp.value)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="completion-actions">
            <button 
              className="btn btn-outline"
              onClick={() => {
                setIsCompleted(false);
                setCurrentIndex(0);
                setSelectedValue(1);
                setComment('');
              }}
            >
              다시 비교하기
            </button>
            <button className="btn btn-primary">
              다음 단계로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPair = pairs[currentIndex];
  const progress = calculateProgress();

  return (
    <div className="pairwise-comparison">
      <div className="comparison-header">
        <h3>{type === 'criteria' ? '기준' : '대안'} 쌍대비교</h3>
        <div className="comparison-progress">
          <div className="progress-info">
            {currentIndex + 1} / {pairs.length} ({progress}%)
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="comparison-content">
        <div className="comparison-question">
          <h4>다음 두 항목 중 어느 것이 더 중요합니까?</h4>
          
          <div className="comparison-items">
            <div className="comparison-item item-a">
              <h5>{currentPair.itemA.name}</h5>
              {currentPair.itemA.description && (
                <p>{currentPair.itemA.description}</p>
              )}
            </div>
            
            <div className="comparison-vs">VS</div>
            
            <div className="comparison-item item-b">
              <h5>{currentPair.itemB.name}</h5>
              {currentPair.itemB.description && (
                <p>{currentPair.itemB.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="comparison-scale">
          <h5>중요도를 선택하세요</h5>
          <div className="scale-options">
            {scales.map((scale) => (
              <label key={scale.value} className="scale-option">
                <input
                  type="radio"
                  name="comparison-scale"
                  value={scale.value}
                  checked={selectedValue === scale.value}
                  onChange={() => setSelectedValue(scale.value)}
                />
                <div className="scale-content">
                  <div className="scale-label">{scale.label}</div>
                  <div className="scale-description">{scale.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="comparison-comment">
          <label>의견 (선택사항)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="이 비교에 대한 추가 설명이나 의견을 입력하세요"
            rows={2}
          />
        </div>

        <div className="comparison-actions">
          <button 
            className="btn btn-outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            이전
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSaveComparison}
          >
            {currentIndex === pairs.length - 1 ? '완료' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PairwiseComparison;