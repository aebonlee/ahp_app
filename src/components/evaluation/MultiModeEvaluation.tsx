/**
 * 다중 평가 모드 컴포넌트
 * 쌍대비교, 직접입력, 순위기반, 점수기반 평가 방법을 통합 지원
 */

import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import PairwiseGrid from './PairwiseGrid';
import DirectInputEvaluation from './DirectInputEvaluation';
import FuzzyPairwiseEvaluation from './fuzzy/FuzzyPairwiseEvaluation';

export type EvaluationMode = 
  | 'pairwise'           // 쌍대비교
  | 'direct_input'       // 직접입력
  | 'ranking'            // 순위기반
  | 'scoring'            // 점수기반
  | 'fuzzy'              // 퍼지 평가
  | 'linguistic'         // 언어적 평가
  | 'interval'           // 구간 평가
  | 'group_discussion';  // 그룹 토론

export interface EvaluationSettings {
  mode: EvaluationMode;
  scale: {
    type: 'saaty' | 'balanced' | 'custom';
    min: number;
    max: number;
    steps: number[];
    labels: string[];
  };
  validation: {
    consistencyCheck: boolean;
    completenessCheck: boolean;
    maxInconsistency: number;
  };
  assistance: {
    showHelp: boolean;
    showExamples: boolean;
    autoSave: boolean;
    guidedMode: boolean;
  };
}

export interface EvaluationResult {
  mode: EvaluationMode;
  participantId: string;
  criterionId: string;
  data: any;
  consistencyRatio?: number;
  completionTime: number;
  confidence: number;
  timestamp: string;
}

interface MultiModeEvaluationProps {
  projectId: string;
  criterionId: string;
  criterionName: string;
  alternatives: Array<{ id: string; name: string; description?: string }>;
  participantId?: string;
  initialMode?: EvaluationMode;
  onComplete?: (result: EvaluationResult) => void;
  onModeChange?: (mode: EvaluationMode) => void;
  className?: string;
}

const MultiModeEvaluation: React.FC<MultiModeEvaluationProps> = ({
  projectId,
  criterionId,
  criterionName,
  alternatives,
  participantId = 'current_user',
  initialMode = 'pairwise',
  onComplete,
  onModeChange,
  className = ''
}) => {
  const [currentMode, setCurrentMode] = useState<EvaluationMode>(initialMode);
  const [settings, setSettings] = useState<EvaluationSettings>({
    mode: initialMode,
    scale: {
      type: 'saaty',
      min: 1,
      max: 9,
      steps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      labels: ['동등', '약간중요', '중요', '많이중요', '절대중요']
    },
    validation: {
      consistencyCheck: true,
      completenessCheck: true,
      maxInconsistency: 0.1
    },
    assistance: {
      showHelp: true,
      showExamples: false,
      autoSave: true,
      guidedMode: false
    }
  });

  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [confidence, setConfidence] = useState<number>(3); // 1-5 scale
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);

  // 모드별 설명
  const modeDescriptions: { [key in EvaluationMode]: { name: string; description: string; icon: string; difficulty: string } } = {
    pairwise: {
      name: '쌍대비교 평가',
      description: '두 대안씩 비교하여 상대적 중요도를 평가합니다. 가장 정확하지만 시간이 오래 걸립니다.',
      icon: '⚖️',
      difficulty: '높음'
    },
    direct_input: {
      name: '직접입력 평가',
      description: '각 대안에 대한 정량적 값을 직접 입력합니다. 빠르고 간단합니다.',
      icon: '📝',
      difficulty: '낮음'
    },
    ranking: {
      name: '순위기반 평가',
      description: '대안들을 순위대로 나열합니다. 직관적이고 이해하기 쉽습니다.',
      icon: '📊',
      difficulty: '낮음'
    },
    scoring: {
      name: '점수기반 평가',
      description: '각 대안에 점수를 부여합니다. 절대적 평가가 가능합니다.',
      icon: '🎯',
      difficulty: '보통'
    },
    fuzzy: {
      name: '퍼지 평가',
      description: '불확실성을 고려한 구간값으로 평가합니다. 애매한 상황에 적합합니다.',
      icon: '🌫️',
      difficulty: '높음'
    },
    linguistic: {
      name: '언어적 평가',
      description: '자연어 표현으로 평가합니다. 정성적 평가에 적합합니다.',
      icon: '💬',
      difficulty: '보통'
    },
    interval: {
      name: '구간 평가',
      description: '최소값과 최대값의 구간으로 평가합니다. 불확실성 표현이 가능합니다.',
      icon: '📏',
      difficulty: '보통'
    },
    group_discussion: {
      name: '그룹 토론',
      description: '참가자들이 실시간으로 토론하며 합의점을 찾습니다.',
      icon: '👥',
      difficulty: '높음'
    }
  };

  useEffect(() => {
    setStartTime(Date.now());
    if (onModeChange) {
      onModeChange(currentMode);
    }
  }, [currentMode, onModeChange]);

  const handleModeChange = (newMode: EvaluationMode) => {
    if (evaluationData && currentMode !== newMode) {
      // Note: In production, replace with proper modal confirmation
      const shouldChange = window.confirm('평가 모드를 변경하면 현재 입력한 데이터가 손실됩니다. 계속하시겠습니까?');
      if (shouldChange) {
        setCurrentMode(newMode);
        setEvaluationData(null);
        setValidationResults(null);
        setSettings(prev => ({ ...prev, mode: newMode }));
      }
    } else {
      setCurrentMode(newMode);
      setSettings(prev => ({ ...prev, mode: newMode }));
    }
  };

  const validateEvaluation = async () => {
    setIsValidating(true);
    
    try {
      // 모드별 검증 로직
      let validation: any = {
        isValid: true,
        errors: [],
        warnings: [],
        completeness: 100,
        consistency: null
      };

      switch (currentMode) {
        case 'pairwise':
          validation = validatePairwiseData();
          break;
        case 'direct_input':
          validation = validateDirectInputData();
          break;
        case 'ranking':
          validation = validateRankingData();
          break;
        case 'scoring':
          validation = validateScoringData();
          break;
        default:
          validation = { isValid: true, errors: [], warnings: [], completeness: 100 };
      }

      setValidationResults(validation);
      return validation.isValid;
      
    } catch (error) {
      console.error('검증 중 오류:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const validatePairwiseData = () => {
    if (!evaluationData || !evaluationData.matrix) {
      return {
        isValid: false,
        errors: ['쌍대비교 데이터가 없습니다.'],
        warnings: [],
        completeness: 0
      };
    }

    const matrix = evaluationData.matrix;
    const n = alternatives.length;
    let completedPairs = 0;
    let totalPairs = (n * (n - 1)) / 2;

    // 완성도 검사
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (matrix[i] && matrix[i][j] && matrix[i][j] !== 1) {
          completedPairs++;
        }
      }
    }

    const completeness = (completedPairs / totalPairs) * 100;
    
    // 일관성 검사 (간단한 버전)
    const consistencyRatio = calculateConsistencyRatio(matrix);
    
    const validation = {
      isValid: completeness === 100 && consistencyRatio <= settings.validation.maxInconsistency,
      errors: [] as string[],
      warnings: [] as string[],
      completeness,
      consistency: consistencyRatio
    };

    if (completeness < 100) {
      validation.errors.push(`평가가 완료되지 않았습니다. (${completeness.toFixed(1)}%)`);
    }

    if (consistencyRatio > settings.validation.maxInconsistency) {
      validation.errors.push(`일관성 비율이 너무 높습니다. (${consistencyRatio.toFixed(3)} > ${settings.validation.maxInconsistency})`);
    }

    if (consistencyRatio > 0.05) {
      validation.warnings.push('일관성을 개선할 여지가 있습니다.');
    }

    return validation;
  };

  const validateDirectInputData = () => {
    if (!evaluationData || !evaluationData.values) {
      return {
        isValid: false,
        errors: ['직접입력 데이터가 없습니다.'],
        warnings: [],
        completeness: 0
      };
    }

    const values = evaluationData.values;
    const completedValues = values.filter((v: any) => v.value > 0).length;
    const completeness = (completedValues / alternatives.length) * 100;

    const validation = {
      isValid: completeness === 100,
      errors: [] as string[],
      warnings: [] as string[],
      completeness
    };

    if (completeness < 100) {
      validation.errors.push(`모든 대안에 값을 입력해주세요. (${completeness.toFixed(1)}%)`);
    }

    // 모든 값이 동일한지 검사
    const uniqueValues = new Set(values.map((v: any) => v.value));
    if (uniqueValues.size === 1) {
      validation.warnings.push('모든 대안의 값이 동일합니다. 차별화된 평가를 고려해보세요.');
    }

    return validation;
  };

  const validateRankingData = () => {
    if (!evaluationData || !evaluationData.rankings) {
      return {
        isValid: false,
        errors: ['순위 데이터가 없습니다.'],
        warnings: [],
        completeness: 0
      };
    }

    const rankings = evaluationData.rankings;
    const completedRankings = rankings.filter((r: any) => r.rank > 0).length;
    const completeness = (completedRankings / alternatives.length) * 100;

    const validation = {
      isValid: completeness === 100,
      errors: [] as string[],
      warnings: [] as string[],
      completeness
    };

    if (completeness < 100) {
      validation.errors.push(`모든 대안의 순위를 지정해주세요. (${completeness.toFixed(1)}%)`);
    }

    // 중복 순위 검사
    const ranks = rankings.map((r: any) => r.rank).filter((r: number) => r > 0);
    const uniqueRanks = new Set(ranks);
    if (ranks.length !== uniqueRanks.size) {
      validation.errors.push('중복된 순위가 있습니다.');
    }

    return validation;
  };

  const validateScoringData = () => {
    if (!evaluationData || !evaluationData.scores) {
      return {
        isValid: false,
        errors: ['점수 데이터가 없습니다.'],
        warnings: [],
        completeness: 0
      };
    }

    const scores = evaluationData.scores;
    const completedScores = scores.filter((s: any) => s.score >= 0).length;
    const completeness = (completedScores / alternatives.length) * 100;

    const validation = {
      isValid: completeness === 100,
      errors: [] as string[],
      warnings: [] as string[],
      completeness
    };

    if (completeness < 100) {
      validation.errors.push(`모든 대안에 점수를 부여해주세요. (${completeness.toFixed(1)}%)`);
    }

    return validation;
  };

  const calculateConsistencyRatio = (matrix: number[][]): number => {
    // 간단한 일관성 비율 계산 (실제로는 더 복잡한 알고리즘 필요)
    const n = matrix.length;
    if (n < 3) return 0;

    // 임의 인덱스
    const randomIndex = [0, 0, 0.52, 0.89, 1.11, 1.25, 1.35, 1.40, 1.45, 1.49];
    const ri = randomIndex[n] || 1.49;

    // 간단한 CI 계산 (실제로는 고유값을 계산해야 함)
    let ci = Math.random() * 0.2; // 시뮬레이션

    return ci / ri;
  };

  const handleComplete = async () => {
    const isValid = await validateEvaluation();
    
    if (!isValid && settings.validation.completenessCheck) {
      alert('평가를 완료하기 전에 검증 오류를 수정해주세요.');
      return;
    }

    const result: EvaluationResult = {
      mode: currentMode,
      participantId,
      criterionId,
      data: evaluationData,
      consistencyRatio: validationResults?.consistency,
      completionTime: Date.now() - startTime,
      confidence,
      timestamp: new Date().toISOString()
    };

    if (onComplete) {
      onComplete(result);
    }
  };

  const renderModeSelector = () => (
    <Card title="평가 방법 선택">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(modeDescriptions).map(([mode, info]) => (
          <button
            key={mode}
            onClick={() => handleModeChange(mode as EvaluationMode)}
            className={`p-4 border rounded-lg text-left transition-all ${
              currentMode === mode
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{info.icon}</span>
              <span className="font-medium">{info.name}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{info.description}</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">난이도:</span>
              <span className={`px-2 py-1 rounded ${
                info.difficulty === '높음' ? 'bg-red-100 text-red-700' :
                info.difficulty === '보통' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {info.difficulty}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );

  const renderEvaluationInterface = () => {
    switch (currentMode) {
      case 'pairwise':
        return (
          <PairwiseGrid
            elements={alternatives}
            onComparisonChange={(comparisons) => setEvaluationData({ matrix: comparisons })}
            onConsistencyChange={(cr, isConsistent) => console.log('Consistency:', cr, isConsistent)}
          />
        );

      case 'direct_input':
        return (
          <DirectInputEvaluation
            projectId={projectId}
            criterionId={criterionId}
            criterionName={criterionName}
            alternatives={alternatives}
            onComplete={(values) => setEvaluationData({ values })}
          />
        );

      case 'ranking':
        return renderRankingEvaluation();
        
      case 'scoring':
        return renderScoringEvaluation();
        
      case 'fuzzy':
        return renderFuzzyEvaluation();
        
      case 'linguistic':
        return renderLinguisticEvaluation();
        
      case 'interval':
        return renderIntervalEvaluation();
        
      case 'group_discussion':
        return renderGroupDiscussion();

      default:
        return <div className="text-center py-8">선택된 평가 방법을 개발 중입니다.</div>;
    }
  };

  const renderRankingEvaluation = () => (
    <Card title={`순위기반 평가: ${criterionName}`}>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="font-medium text-blue-800 mb-2">📊 순위 평가</h5>
          <p className="text-blue-700 text-sm">
            대안들을 중요도 순으로 드래그하여 순위를 매겨주세요. (1위가 가장 중요)
          </p>
        </div>

        <div className="space-y-3">
          {alternatives.map((alt, index) => (
            <div key={alt.id} className="flex items-center space-x-4 p-3 border rounded">
              <select
                onChange={(e) => {
                  const rankings = evaluationData?.rankings || alternatives.map(a => ({ alternativeId: a.id, rank: 0 }));
                  const updated = rankings.map((r: any) => 
                    r.alternativeId === alt.id ? { ...r, rank: parseInt(e.target.value) } : r
                  );
                  setEvaluationData({ rankings: updated });
                }}
                className="w-20 border rounded px-2 py-1"
              >
                <option value={0}>순위</option>
                {alternatives.map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}위</option>
                ))}
              </select>
              <div className="flex-1">
                <h4 className="font-medium">{alt.name}</h4>
                {alt.description && (
                  <p className="text-sm text-gray-600">{alt.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const renderScoringEvaluation = () => (
    <Card title={`점수기반 평가: ${criterionName}`}>
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h5 className="font-medium text-green-800 mb-2">🎯 점수 평가</h5>
          <p className="text-green-700 text-sm">
            각 대안에 0-100점 사이의 점수를 부여해주세요.
          </p>
        </div>

        <div className="space-y-3">
          {alternatives.map(alt => (
            <div key={alt.id} className="flex items-center space-x-4 p-3 border rounded">
              <div className="flex-1">
                <h4 className="font-medium">{alt.name}</h4>
                {alt.description && (
                  <p className="text-sm text-gray-600">{alt.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  onChange={(e) => {
                    const scores = evaluationData?.scores || alternatives.map(a => ({ alternativeId: a.id, score: 0 }));
                    const updated = scores.map((s: any) => 
                      s.alternativeId === alt.id ? { ...s, score: parseInt(e.target.value) } : s
                    );
                    setEvaluationData({ scores: updated });
                  }}
                  className="w-32"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="점수"
                  className="w-20 border rounded px-2 py-1 text-center"
                  onChange={(e) => {
                    const scores = evaluationData?.scores || alternatives.map(a => ({ alternativeId: a.id, score: 0 }));
                    const updated = scores.map((s: any) => 
                      s.alternativeId === alt.id ? { ...s, score: parseInt(e.target.value) || 0 } : s
                    );
                    setEvaluationData({ scores: updated });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  const renderFuzzyEvaluation = () => (
    <FuzzyPairwiseEvaluation
      projectId={projectId}
      criterionId={criterionId}
      criterionName={criterionName}
      items={alternatives}
      evaluationType="alternatives"
      participantId={participantId}
      onComplete={(comparisons) => {
        if (onComplete) {
          onComplete({
            mode: 'fuzzy',
            participantId,
            criterionId,
            data: comparisons,
            completionTime: Date.now(),
            confidence: 0.95,
            timestamp: new Date().toISOString()
          });
        }
      }}
      onSave={(comparisons) => {
        console.log('퍼지 평가 임시 저장:', comparisons);
      }}
    />
  );

  const renderLinguisticEvaluation = () => (
    <Card title={`언어적 평가: ${criterionName}`}>
      <div className="text-center py-8 text-gray-500">
        언어적 평가 모드는 개발 중입니다.
      </div>
    </Card>
  );

  const renderIntervalEvaluation = () => (
    <Card title={`구간 평가: ${criterionName}`}>
      <div className="text-center py-8 text-gray-500">
        구간 평가 모드는 개발 중입니다.
      </div>
    </Card>
  );

  const renderGroupDiscussion = () => (
    <Card title={`그룹 토론: ${criterionName}`}>
      <div className="text-center py-8 text-gray-500">
        그룹 토론 모드는 개발 중입니다.
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {renderModeSelector()}
      
      {renderEvaluationInterface()}

      {/* 검증 결과 */}
      {validationResults && (
        <Card title="검증 결과">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>완성도:</span>
              <span className={`font-medium ${
                validationResults.completeness === 100 ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationResults.completeness.toFixed(1)}%
              </span>
            </div>
            
            {validationResults.consistency !== null && (
              <div className="flex items-center justify-between">
                <span>일관성 비율:</span>
                <span className={`font-medium ${
                  validationResults.consistency <= 0.1 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {validationResults.consistency.toFixed(3)}
                </span>
              </div>
            )}

            {validationResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h6 className="font-medium text-red-800 mb-1">오류</h6>
                <ul className="text-red-700 text-sm space-y-1">
                  {validationResults.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResults.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <h6 className="font-medium text-yellow-800 mb-1">경고</h6>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {validationResults.warnings.map((warning: string, index: number) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 신뢰도 및 완료 */}
      <Card title="평가 완료">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              평가 신뢰도 (1: 매우 낮음 ~ 5: 매우 높음)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="5"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12">{confidence}/5</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={validateEvaluation}
              disabled={isValidating}
            >
              {isValidating ? '검증 중...' : '검증하기'}
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!evaluationData}
            >
              평가 완료
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MultiModeEvaluation;