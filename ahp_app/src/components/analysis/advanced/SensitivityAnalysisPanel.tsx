import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import api from '../../../services/api';

interface SensitivityResult {
  criterion: string;
  original_weight: number;
  sensitivity_range: [number, number];
  rank_reversal_points: number[];
  stability_index: number;
  impact_score: number;
}

interface SensitivityAnalysisPanelProps {
  projectId: number;
}

const SensitivityAnalysisPanel: React.FC<SensitivityAnalysisPanelProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SensitivityResult[]>([]);
  const [overallStability, setOverallStability] = useState(0);
  const [interpretation, setInterpretation] = useState('');
  const [variationRange, setVariationRange] = useState(0.3);
  const [selectedCriteria, setSelectedCriteria] = useState<number[]>([0, 1, 2]);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/analysis/advanced/${projectId}/sensitivity_analysis/`, {
        target_criteria: selectedCriteria,
        variation_range: variationRange
      });

      setResults(response.data.results || []);
      setOverallStability(response.data.overall_stability || 0);
      setInterpretation(response.data.interpretation || '');
    } catch (error) {
      console.error('민감도 분석 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 차트 데이터 준비
  const stabilityData = results.map(r => ({
    name: r.criterion,
    stability: r.stability_index * 100,
    impact: r.impact_score * 100,
    weight: r.original_weight * 100
  }));

  const sensitivityRangeData = results.map(r => ({
    criterion: r.criterion,
    min: r.sensitivity_range[0] * 100,
    max: r.sensitivity_range[1] * 100,
    current: r.original_weight * 100
  }));

  const radarData = results.map(r => ({
    criterion: r.criterion,
    stability: r.stability_index * 100,
    robustness: (1 - r.impact_score) * 100
  }));

  const getStabilityColor = (value: number) => {
    if (value >= 0.8) return 'text-green-600';
    if (value >= 0.6) return 'text-yellow-600';
    if (value >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStabilityBadge = (value: number) => {
    if (value >= 0.8) return { text: '매우 안정', color: 'bg-green-100 text-green-800' };
    if (value >= 0.6) return { text: '안정', color: 'bg-yellow-100 text-yellow-800' };
    if (value >= 0.4) return { text: '보통', color: 'bg-orange-100 text-orange-800' };
    return { text: '불안정', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-bold mb-4">민감도 분석 설정</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              변동 범위
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.1"
                max="0.5"
                step="0.1"
                value={variationRange}
                onChange={(e) => setVariationRange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="px-3 py-1 bg-gray-100 rounded-lg font-mono text-sm">
                ±{(variationRange * 100).toFixed(0)}%
              </span>
            </div>
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
                  <ChartBarIcon className="h-5 w-5" />
                  분석 실행
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Overall Status */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">전체 안정성 평가</h2>
              {getStabilityBadge(overallStability).text && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStabilityBadge(overallStability).color}`}>
                  {getStabilityBadge(overallStability).text}
                </span>
              )}
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">전체 안정성 지수</span>
                <span className={`text-2xl font-bold ${getStabilityColor(overallStability)}`}>
                  {(overallStability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-primary to-tertiary transition-all duration-500"
                  style={{ width: `${overallStability * 100}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-primary/5 to-tertiary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-gray-700">{interpretation}</p>
            </div>
          </div>

          {/* Stability Chart */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold mb-4">기준별 안정성 지수</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="stability" name="안정성" fill="url(#colorGradient1)" />
                <Bar dataKey="impact" name="영향도" fill="url(#colorGradient2)" />
                <defs>
                  <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#f97316" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Sensitivity Range */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold mb-4">가중치 변동 범위</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={sensitivityRangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="criterion" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Legend />
                <Area type="monotone" dataKey="max" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} name="최대값" />
                <Area type="monotone" dataKey="min" stackId="2" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} name="최소값" />
                <Line type="monotone" dataKey="current" stroke="#f97316" strokeWidth={2} name="현재값" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold mb-4">안정성-견고성 분석</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="criterion" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="안정성" dataKey="stability" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                <Radar name="견고성" dataKey="robustness" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Results Table */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold mb-4">상세 분석 결과</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      기준
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      원본 가중치
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      변동 범위
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      순위 역전점
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      안정성
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.criterion}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(result.original_weight * 100).toFixed(2)}%
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(result.sensitivity_range[0] * 100).toFixed(1)}% - {(result.sensitivity_range[1] * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.rank_reversal_points.length === 0 ? (
                          <span className="text-green-600">없음</span>
                        ) : (
                          <span className="text-orange-600">{result.rank_reversal_points.length}개</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-primary to-tertiary"
                              style={{ width: `${result.stability_index * 100}%` }}
                            />
                          </div>
                          <span className={`text-sm font-medium ${getStabilityColor(result.stability_index)}`}>
                            {(result.stability_index * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {result.stability_index >= 0.7 ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <ExclamationCircleIcon className="h-5 w-5 text-orange-600" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SensitivityAnalysisPanel;