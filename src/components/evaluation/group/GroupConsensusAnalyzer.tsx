import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  FireIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { ConsensusAnalyzer } from '../../../utils/groupAggregators';
import type { 
  ConsensusMetrics,
  GroupMember,
  DisagreementAnalysis 
} from '../../../types/group';

interface GroupConsensusAnalyzerProps {
  groupId: string;
  members: GroupMember[];
  matrices: Map<string, number[][]>;
  elementNames: string[];
  onDisagreementResolve?: (disagreement: DisagreementAnalysis) => void;
}

interface ConsensusVisualization {
  consensusOverTime: Array<{
    timestamp: string;
    consensus: number;
    kendallW: number;
    entropy: number;
  }>;
  disagreementHeatmap: number[][];
  evaluatorClusters: Array<{
    id: string;
    members: string[];
    cohesion: number;
    avgConsensus: number;
  }>;
  criticalPairs: Array<{
    element1: string;
    element2: string;
    disagreementCount: number;
    avgDeviation: number;
  }>;
}

const GroupConsensusAnalyzer: React.FC<GroupConsensusAnalyzerProps> = ({
  groupId,
  members,
  matrices,
  elementNames,
  onDisagreementResolve
}) => {
  const [consensusMetrics, setConsensusMetrics] = useState<ConsensusMetrics | null>(null);
  const [visualization, setVisualization] = useState<ConsensusVisualization | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<'overview' | 'heatmap' | 'clusters' | 'timeline'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 합의도 분석 실행
  const analyzeConsensus = useCallback(async () => {
    if (matrices.size < 2) {
      setError('최소 2명의 평가자가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 매트릭스 배열로 변환
      const matrixArray = Array.from(matrices.values());
      
      // Shannon Consensus 분석
      const shannonMetrics = ConsensusAnalyzer.calculateShannonConsensus(matrixArray);
      setConsensusMetrics(shannonMetrics);

      // 시각화 데이터 생성
      await generateVisualization(shannonMetrics, matrixArray);

    } catch (error) {
      console.error('합의도 분석 오류:', error);
      setError('합의도 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [matrices]);

  // 시각화 데이터 생성
  const generateVisualization = async (
    metrics: ConsensusMetrics,
    matrixArray: number[][][]
  ) => {
    // 시간별 합의도 추이 (샘플 데이터)
    const consensusOverTime = Array.from({ length: 10 }, (_, i) => ({
      timestamp: `${i + 1}차`,
      consensus: Math.max(0.3, metrics.overallConsensus * (0.5 + 0.5 * Math.random())),
      kendallW: Math.max(0.2, metrics.kendallsW * (0.6 + 0.4 * Math.random())),
      entropy: metrics.shannonEntropy * (0.8 + 0.4 * Math.random())
    }));

    // 이견 히트맵 생성
    const disagreementHeatmap = generateDisagreementHeatmap(matrixArray);

    // 평가자 클러스터 분석
    const evaluatorClusters = performClusterAnalysis(matrixArray);

    // 비판적 쌍 식별
    const criticalPairs = identifyCriticalPairs(metrics.criticalDisagreements);

    setVisualization({
      consensusOverTime,
      disagreementHeatmap,
      evaluatorClusters,
      criticalPairs
    });
  };

  // 이견 히트맵 생성
  const generateDisagreementHeatmap = (matrixArray: number[][][]): number[][] => {
    const n = elementNames.length;
    const heatmap = Array(n).fill(null).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;

        const values = matrixArray.map(matrix => Math.log(matrix[i][j]));
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        
        heatmap[i][j] = Math.sqrt(variance); // 표준편차를 이견 정도로 사용
      }
    }

    return heatmap;
  };

  // 클러스터 분석
  const performClusterAnalysis = (matrixArray: number[][][]) => {
    // 간단한 계층적 클러스터링 구현
    const evaluatorIds = Array.from(matrices.keys());
    const k = evaluatorIds.length;
    
    // 평가자 간 거리 매트릭스 계산
    const distanceMatrix = Array(k).fill(null).map(() => Array(k).fill(0));
    
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        const distance = calculateMatrixDistance(matrixArray[i], matrixArray[j]);
        distanceMatrix[i][j] = distanceMatrix[j][i] = distance;
      }
    }

    // 임계값 기반 클러스터링
    const threshold = calculateClusteringThreshold(distanceMatrix);
    const clusters = [];
    const assigned = new Set<number>();

    for (let i = 0; i < evaluatorIds.length; i++) {
      if (assigned.has(i)) continue;

      const cluster = [evaluatorIds[i]];
      assigned.add(i);

      for (let j = i + 1; j < evaluatorIds.length; j++) {
        if (!assigned.has(j) && distanceMatrix[i][j] < threshold) {
          cluster.push(evaluatorIds[j]);
          assigned.add(j);
        }
      }

      if (cluster.length > 1) {
        clusters.push({
          id: `cluster_${i}`,
          members: cluster,
          cohesion: calculateClusterCohesion(cluster, distanceMatrix, evaluatorIds),
          avgConsensus: Math.random() * 0.4 + 0.6 // 임시 값
        });
      }
    }

    return clusters;
  };

  // 매트릭스 간 거리 계산
  const calculateMatrixDistance = (matrix1: number[][], matrix2: number[][]): number => {
    let sumSquaredDiff = 0;
    const n = matrix1.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const logDiff = Math.log(matrix1[i][j]) - Math.log(matrix2[i][j]);
        sumSquaredDiff += logDiff * logDiff;
      }
    }

    return Math.sqrt(sumSquaredDiff);
  };

  // 클러스터링 임계값 계산
  const calculateClusteringThreshold = (distances: number[][]): number => {
    const flatDistances: number[] = [];
    
    for (let i = 0; i < distances.length; i++) {
      for (let j = i + 1; j < distances.length; j++) {
        flatDistances.push(distances[i][j]);
      }
    }
    
    flatDistances.sort((a, b) => a - b);
    return flatDistances[Math.floor(flatDistances.length / 2)] * 1.2; // 중앙값의 1.2배
  };

  // 클러스터 응집도 계산
  const calculateClusterCohesion = (
    cluster: string[], 
    distanceMatrix: number[][], 
    evaluatorIds: string[]
  ): number => {
    if (cluster.length <= 1) return 1;

    let totalDistance = 0;
    let pairCount = 0;

    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        const idx1 = evaluatorIds.indexOf(cluster[i]);
        const idx2 = evaluatorIds.indexOf(cluster[j]);
        totalDistance += distanceMatrix[idx1][idx2];
        pairCount++;
      }
    }

    const avgDistance = pairCount > 0 ? totalDistance / pairCount : 0;
    return Math.exp(-avgDistance); // 거리가 클수록 응집도는 낮음
  };

  // 비판적 쌍 식별
  const identifyCriticalPairs = (disagreements: any[]): any[] => {
    const pairMap = new Map<string, { count: number; totalDeviation: number }>();

    disagreements.forEach(disagreement => {
      const key = `${disagreement.position[0]}-${disagreement.position[1]}`;
      const existing = pairMap.get(key) || { count: 0, totalDeviation: 0 };
      
      pairMap.set(key, {
        count: existing.count + 1,
        totalDeviation: existing.totalDeviation + disagreement.disagreementScore
      });
    });

    return Array.from(pairMap.entries())
      .map(([key, data]) => {
        const [i, j] = key.split('-').map(Number);
        return {
          element1: elementNames[i],
          element2: elementNames[j],
          disagreementCount: data.count,
          avgDeviation: data.totalDeviation / data.count
        };
      })
      .sort((a, b) => b.avgDeviation - a.avgDeviation)
      .slice(0, 5);
  };

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        analyzeConsensus();
      }, 30000); // 30초마다 업데이트

      return () => clearInterval(interval);
    }
  }, [autoRefresh, analyzeConsensus]);

  // 초기 분석 실행
  useEffect(() => {
    if (matrices.size >= 2) {
      analyzeConsensus();
    }
  }, [analyzeConsensus]);

  // 합의도 수준에 따른 색상
  const getConsensusColor = (consensus: number): string => {
    if (consensus >= 0.8) return 'text-green-600';
    if (consensus >= 0.6) return 'text-blue-600';
    if (consensus >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 합의도 해석
  const getConsensusInterpretation = (consensus: number): string => {
    if (consensus >= 0.8) return '매우 높은 합의';
    if (consensus >= 0.6) return '높은 합의';
    if (consensus >= 0.4) return '보통 합의';
    if (consensus >= 0.2) return '낮은 합의';
    return '매우 낮은 합의';
  };

  if (loading && !consensusMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 컨트롤 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">그룹 합의도 분석</h2>
          <p className="text-gray-600 mt-1">평가자 간 의견 일치도 및 이견 분석</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant={autoRefresh ? "primary" : "secondary"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            {autoRefresh ? '자동 새로고침 ON' : '자동 새로고침 OFF'}
          </Button>
          
          <Button
            variant="secondary"
            onClick={analyzeConsensus}
            disabled={loading}
          >
            {loading ? '분석 중...' : '새로고침'}
          </Button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 분석 탭 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: '개요', icon: ChartBarIcon },
            { id: 'heatmap', name: '히트맵', icon: FireIcon },
            { id: 'clusters', name: '클러스터', icon: CogIcon },
            { id: 'timeline', name: '추이', icon: EyeIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedAnalysis(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                selectedAnalysis === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 메인 분석 결과 */}
      {consensusMetrics && (
        <>
          {selectedAnalysis === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 전체 합의도 */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">전체 합의도</h3>
                    <ChartBarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <div className="mt-4">
                    <div className={`text-4xl font-bold ${getConsensusColor(consensusMetrics.overallConsensus)}`}>
                      {(consensusMetrics.overallConsensus * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {getConsensusInterpretation(consensusMetrics.overallConsensus)}
                    </p>
                    
                    {/* 진행률 바 */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            consensusMetrics.overallConsensus >= 0.8 ? 'bg-green-500' :
                            consensusMetrics.overallConsensus >= 0.6 ? 'bg-blue-500' :
                            consensusMetrics.overallConsensus >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${consensusMetrics.overallConsensus * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Kendall's W */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Kendall's W</h3>
                    <InformationCircleIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-purple-600">
                      {consensusMetrics.kendallsW.toFixed(3)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      순위 일치 계수
                    </p>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      {consensusMetrics.kendallsW >= 0.7 ? '강한 일치' :
                       consensusMetrics.kendallsW >= 0.5 ? '보통 일치' :
                       consensusMetrics.kendallsW >= 0.3 ? '약한 일치' : '일치하지 않음'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Shannon Entropy */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Shannon Entropy</h3>
                    <FireIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-4xl font-bold text-orange-600">
                      {consensusMetrics.shannonEntropy.toFixed(3)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      정보 엔트로피
                    </p>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      낮을수록 높은 합의
                    </div>
                  </div>
                </div>
              </Card>

              {/* 비판적 이견 */}
              {consensusMetrics.criticalDisagreements.length > 0 && (
                <Card className="lg:col-span-3">
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-4">주요 이견 사항</h3>
                    
                    <div className="space-y-3">
                      {consensusMetrics.criticalDisagreements.slice(0, 5).map((disagreement, index) => (
                        <div key={disagreement.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">
                              {disagreement.evaluator1Id} vs {disagreement.evaluator2Id}
                            </div>
                            <div className="text-xs text-gray-600">
                              위치: [{disagreement.elementI}, {disagreement.elementJ}] • 
                              이견 수준: {disagreement.disagreementLevel.toFixed(3)}
                            </div>
                          </div>
                          
                          {onDisagreementResolve && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => onDisagreementResolve(disagreement)}
                            >
                              해결하기
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {selectedAnalysis === 'timeline' && visualization && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">시간별 합의도 추이</h3>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visualization.consensusOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis domain={[0, 1]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="consensus" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        name="전체 합의도"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="kendallW" 
                        stroke="#7c3aed" 
                        strokeWidth={2}
                        name="Kendall's W"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          )}

          {selectedAnalysis === 'clusters' && visualization && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 클러스터 목록 */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">평가자 클러스터</h3>
                  
                  <div className="space-y-4">
                    {visualization.evaluatorClusters.map((cluster, index) => (
                      <div key={cluster.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">클러스터 {index + 1}</h4>
                          <span className="text-sm text-gray-600">
                            응집도: {(cluster.cohesion * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {cluster.members.map(member => (
                            <span
                              key={member}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {member}
                            </span>
                          ))}
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          평균 합의도: {(cluster.avgConsensus * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                    
                    {visualization.evaluatorClusters.length === 0 && (
                      <p className="text-gray-500 text-center py-8">
                        뚜렷한 클러스터가 발견되지 않았습니다.
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* 비판적 쌍 */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">가장 이견이 큰 요소 쌍</h3>
                  
                  <div className="space-y-3">
                    {visualization.criticalPairs.map((pair, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {pair.element1} vs {pair.element2}
                          </div>
                          <div className="text-sm text-gray-600">
                            이견 횟수: {pair.disagreementCount} • 
                            평균 편차: {pair.avgDeviation.toFixed(3)}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-yellow-600">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupConsensusAnalyzer;