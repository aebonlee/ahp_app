import React, { useState } from 'react';
import { BeakerIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../../services/api';

interface MonteCarloSimulationProps {
  projectId: number;
}

const MonteCarloSimulation: React.FC<MonteCarloSimulationProps> = ({ projectId }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [nSimulations, setNSimulations] = useState(1000);
  const [uncertaintyLevel, setUncertaintyLevel] = useState(0.1);

  const runSimulation = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/analysis/advanced/${projectId}/monte_carlo_simulation/`, {
        n_simulations: nSimulations,
        uncertainty_level: uncertaintyLevel
      });
      setResult(response.data.simulation_result);
    } catch (error) {
      console.error('몬테카를로 시뮬레이션 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-xl font-bold mb-4">몬테카를로 시뮬레이션 설정</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시뮬레이션 횟수
            </label>
            <input
              type="number"
              value={nSimulations}
              onChange={(e) => setNSimulations(parseInt(e.target.value))}
              min="100"
              max="10000"
              step="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              불확실성 수준
            </label>
            <input
              type="number"
              value={uncertaintyLevel}
              onChange={(e) => setUncertaintyLevel(parseFloat(e.target.value))}
              min="0.01"
              max="0.5"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={runSimulation}
              disabled={loading}
              className="btn btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  시뮬레이션 중...
                </>
              ) : (
                <>
                  <BeakerIcon className="h-5 w-5" />
                  시뮬레이션 실행
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold mb-4">시뮬레이션 결과</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {(result.overall_stability * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-700">전체 안정성</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {result.n_simulations}
                </div>
                <div className="text-sm text-purple-700">시뮬레이션 횟수</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ±{(result.uncertainty_level * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-green-700">불확실성</div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-primary/5 to-tertiary/5 rounded-lg">
              <p className="text-sm text-gray-700">
                {result.overall_stability >= 0.8
                  ? "높은 신뢰도: 불확실성 하에서도 안정적인 결과를 보입니다."
                  : result.overall_stability >= 0.6
                  ? "양호한 신뢰도: 대체로 안정적이나 일부 변동 가능성이 있습니다."
                  : "보통 신뢰도: 불확실성에 영향을 받을 수 있습니다."}
              </p>
            </div>
          </div>

          {/* Rank Stability */}
          {result.rank_stability && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">순위 안정성 분석</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(result.rank_stability).map(([key, value]: [string, any]) => (
                  <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">기준 {parseInt(key) + 1}</div>
                    <div className="text-lg font-bold text-gray-900">
                      {value.most_frequent_rank}위
                    </div>
                    <div className="text-xs text-gray-500">
                      안정성: {(value.stability * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonteCarloSimulation;