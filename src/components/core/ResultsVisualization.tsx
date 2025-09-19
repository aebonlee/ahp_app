import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Download, Eye } from 'lucide-react';

interface CriteriaWeight {
  id: string;
  name: string;
  weight: number;
}

interface AlternativeScore {
  id: string;
  name: string;
  scores: { [criteriaId: string]: number };
  totalScore: number;
}

interface ResultsVisualizationProps {
  criteriaWeights: CriteriaWeight[];
  alternativeScores: AlternativeScore[];
  consistencyRatio: number;
}

type VisualizationType = 'bar' | 'pie' | 'radial' | 'detailed';

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export const ResultsVisualization: React.FC<ResultsVisualizationProps> = ({
  criteriaWeights,
  alternativeScores,
  consistencyRatio
}) => {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('bar');
  const [showDetailed, setShowDetailed] = useState(false);

  const prepareBarChartData = () => {
    return alternativeScores.map((alternative, index) => ({
      name: alternative.name,
      score: alternative.totalScore * 100,
      fill: COLORS[index % COLORS.length]
    }));
  };

  const preparePieChartData = () => {
    return alternativeScores.map((alternative, index) => ({
      name: alternative.name,
      value: alternative.totalScore * 100,
      fill: COLORS[index % COLORS.length]
    }));
  };

  const prepareCriteriaWeightData = () => {
    return criteriaWeights.map((criteria, index) => ({
      name: criteria.name,
      weight: criteria.weight * 100,
      fill: COLORS[index % COLORS.length]
    }));
  };

  const prepareDetailedData = () => {
    return alternativeScores.map(alternative => {
      const scores = criteriaWeights.map(criteria => ({
        criteria: criteria.name,
        score: (alternative.scores[criteria.id] || 0) * criteria.weight * 100
      }));
      return {
        alternative: alternative.name,
        scores
      };
    });
  };

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      consistencyRatio,
      criteriaWeights,
      alternativeScores
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ahp-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderVisualization = () => {
    switch (visualizationType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareBarChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '점수']} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={preparePieChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {preparePieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '점수']} />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'radial':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={prepareBarChartData()}>
              <RadialBar dataKey="score" cornerRadius={10} fill="#8884d8" />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '점수']} />
            </RadialBarChart>
          </ResponsiveContainer>
        );
      
      case 'detailed':
        const detailedData = prepareDetailedData();
        return (
          <div className="space-y-4">
            {detailedData.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">{item.alternative}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={item.scores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="criteria" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, '기여도']} />
                    <Bar dataKey="score" fill={COLORS[index % COLORS.length]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">결과 시각화</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportResults}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>내보내기</span>
          </button>
          <button
            onClick={() => setShowDetailed(!showDetailed)}
            className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 flex items-center space-x-1"
          >
            <Eye className="w-4 h-4" />
            <span>상세보기</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setVisualizationType('bar')}
          className={`px-3 py-2 text-sm rounded-md flex items-center space-x-1 ${
            visualizationType === 'bar' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>막대 차트</span>
        </button>
        <button
          onClick={() => setVisualizationType('pie')}
          className={`px-3 py-2 text-sm rounded-md flex items-center space-x-1 ${
            visualizationType === 'pie' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
          }`}
        >
          <PieChartIcon className="w-4 h-4" />
          <span>원형 차트</span>
        </button>
        <button
          onClick={() => setVisualizationType('radial')}
          className={`px-3 py-2 text-sm rounded-md flex items-center space-x-1 ${
            visualizationType === 'radial' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>방사형 차트</span>
        </button>
        <button
          onClick={() => setVisualizationType('detailed')}
          className={`px-3 py-2 text-sm rounded-md flex items-center space-x-1 ${
            visualizationType === 'detailed' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>세부 분석</span>
        </button>
      </div>

      <div className="mb-6">
        {renderVisualization()}
      </div>

      {showDetailed && (
        <div className="border-t pt-6 space-y-4">
          <h4 className="font-medium">기준 가중치 분포</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={prepareCriteriaWeightData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, '가중치']} />
              <Bar dataKey="weight" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="border-t pt-4 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <span>일관성 비율: {consistencyRatio.toFixed(3)}</span>
          <span className={consistencyRatio <= 0.1 ? 'text-green-600' : 'text-red-600'}>
            {consistencyRatio <= 0.1 ? '일관성 양호' : '일관성 검토 필요'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResultsVisualization;