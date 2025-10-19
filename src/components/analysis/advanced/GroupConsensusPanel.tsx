import React, { useState } from 'react';
import { UsersIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../../services/api';

interface GroupConsensusResult {
  consensus_level: number;
  disagreement_index: number;
  outliers: string[];
  weighted_priorities: number[];
  confidence_interval: [number, number];
}

interface GroupConsensusPanelProps {
  projectId: number;
}

const GroupConsensusPanel: React.FC<GroupConsensusPanelProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroupConsensusResult | null>(null);
  const [aggregationMethod, setAggregationMethod] = useState('geometric_mean');
  const [evaluators, setEvaluators] = useState<any[]>([]);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/analysis/advanced/${projectId}/group_consensus_analysis/`, {
        aggregation_method: aggregationMethod
      });

      setResult({
        consensus_level: response.data.consensus_level,
        disagreement_index: response.data.disagreement_index,
        outliers: response.data.outliers,
        weighted_priorities: response.data.weighted_priorities,
        confidence_interval: response.data.confidence_interval
      });
      setEvaluators(response.data.evaluators || []);
    } catch (error) {
      console.error('그룹 합의 분석 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const consensusData = result ? [
    { name: '합의', value: result.consensus_level * 100, color: '#6366f1' },
    { name: '불일치', value: (1 - result.consensus_level) * 100, color: '#f59e0b' }
  ] : [];

  const getConsensusColor = (level: number) => {
    if (level >= 0.8) return 'text-green-600';
    if (level >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-bold mb-4">그룹 합의 분석 설정</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              통합 방법
            </label>
            <select
              value={aggregationMethod}
              onChange={(e) => setAggregationMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="geometric_mean">기하평균</option>
              <option value="arithmetic_mean">산술평균</option>
              <option value="weighted">가중평균</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={performAnalysis}
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  분석 중...
                </>
              ) : (
                <>
                  <UsersIcon className="h-5 w-5" />
                  분석 실행
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Consensus Overview */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold mb-4">합의 수준 분석</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">전체 합의 수준</span>
                    <span className={`text-2xl font-bold ${getConsensusColor(result.consensus_level)}`}>
                      {(result.consensus_level * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-primary to-tertiary"
                      style={{ width: `${result.consensus_level * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">불일치 지수</span>
                    <span className="font-medium">{result.disagreement_index.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">신뢰구간</span>
                    <span className="font-medium">
                      [{result.confidence_interval[0].toFixed(2)}, {result.confidence_interval[1].toFixed(2)}]
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={consensusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {consensusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Outliers */}
          {result.outliers.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-semibold">이상치 탐지</h3>
              </div>
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  다음 평가자들의 의견이 그룹 평균과 크게 다릅니다:
                </p>
                <ul className="mt-2 list-disc list-inside text-sm text-orange-700">
                  {result.outliers.map((outlier, index) => (
                    <li key={index}>{outlier}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Evaluator Details */}
          {evaluators.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">평가자별 상세</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">평가자</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">일관성 비율</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {evaluators.map((evaluator, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900">{evaluator.name}</td>
                        <td className="px-4 py-4 text-sm">
                          <span className={evaluator.consistency_ratio <= 0.1 ? 'text-green-600' : 'text-red-600'}>
                            {evaluator.consistency_ratio?.toFixed(3) || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {evaluator.consistency_ratio <= 0.1 ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupConsensusPanel;