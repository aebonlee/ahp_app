import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, PieChart, Pie, Cell
} from 'recharts';

interface AHPResultsVisualizationProps {
  project: any;
  results: any;
  criteriaWeights: { [key: string]: number };
  alternativeScores: { [criterionId: string]: { [alternativeId: string]: number } };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AHPResultsVisualization: React.FC<AHPResultsVisualizationProps> = ({
  project,
  results,
  criteriaWeights,
  alternativeScores
}) => {
  const [viewMode, setViewMode] = useState<'ranking' | 'criteria' | 'sensitivity'>('ranking');

  // Prepare data for ranking chart
  const rankingData = results.ranking.map((item: any, index: number) => ({
    name: item.alternativeName,
    score: item.score * 100,
    rank: item.rank,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare data for criteria weights pie chart
  const criteriaData = project.criteria.map((criterion: any, index: number) => ({
    name: criterion.name,
    value: (criteriaWeights[criterion.id] || 0) * 100,
    color: COLORS[index % COLORS.length]
  }));

  // Prepare data for radar chart
  const radarData = project.criteria.map((criterion: any) => {
    const dataPoint: any = { criterion: criterion.name };
    project.alternatives.forEach((alternative: any) => {
      dataPoint[alternative.name] = 
        (alternativeScores[criterion.id]?.[alternative.id] || 0) * 100;
    });
    return dataPoint;
  });

  // Prepare data for detailed scores table
  const tableData = project.alternatives.map((alternative: any) => {
    const scores: any = { name: alternative.name };
    let totalScore = 0;
    
    project.criteria.forEach((criterion: any) => {
      const weight = criteriaWeights[criterion.id] || 0;
      const score = alternativeScores[criterion.id]?.[alternative.id] || 0;
      scores[criterion.name] = (score * 100).toFixed(2);
      totalScore += weight * score;
    });
    
    scores.total = (totalScore * 100).toFixed(2);
    return scores;
  });

  return (
    <div className="space-y-6">
      {/* View Mode Selector */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setViewMode('ranking')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'ranking'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Final Ranking
          </button>
          <button
            onClick={() => setViewMode('criteria')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'criteria'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Criteria Analysis
          </button>
          <button
            onClick={() => setViewMode('sensitivity')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'sensitivity'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Detailed Scores
          </button>
        </div>
      </div>

      {/* Ranking View */}
      {viewMode === 'ranking' && (
        <div className="space-y-6">
          {/* Winner Card */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">🏆 Best Alternative</h3>
            <div className="text-4xl font-bold mb-2">
              {results.ranking[0].alternativeName}
            </div>
            <div className="text-xl">
              Score: {(results.ranking[0].score * 100).toFixed(2)}%
            </div>
          </div>

          {/* Ranking Bar Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Final Ranking</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={rankingData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
                <Bar dataKey="score" fill="#3B82F6">
                  {rankingData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranking List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Ranking</h3>
            <div className="space-y-3">
              {results.ranking.map((item: any, index: number) => (
                <div 
                  key={item.alternativeId}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      #{item.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {item.alternativeName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-48 bg-gray-200 rounded-full h-4">
                      <div 
                        className="h-4 rounded-full"
                        style={{ 
                          width: `${item.score * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                    <div className="font-bold text-gray-800 w-20 text-right">
                      {(item.score * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Criteria View */}
      {viewMode === 'criteria' && (
        <div className="space-y-6">
          {/* Criteria Weights */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Criteria Weights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={criteriaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${entry.value?.toFixed(1) || 0}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {criteriaData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                {criteriaData.map((criterion: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: criterion.color }}
                      />
                      <span className="font-medium">{criterion.name}</span>
                    </div>
                    <span className="font-bold">{criterion.value.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alternatives Performance by Criteria */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Alternatives Performance by Criteria
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="criterion" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                {project.alternatives.map((alternative: any, index: number) => (
                  <Radar
                    key={alternative.id}
                    name={alternative.name}
                    dataKey={alternative.name}
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Scores View */}
      {viewMode === 'sensitivity' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Score Matrix</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-3 bg-gray-100 text-left">
                    Alternative
                  </th>
                  {project.criteria.map((criterion: any) => (
                    <th key={criterion.id} className="border border-gray-300 p-3 bg-gray-100">
                      <div>{criterion.name}</div>
                      <div className="text-xs font-normal text-gray-600">
                        Weight: {(criteriaWeights[criterion.id] * 100).toFixed(1)}%
                      </div>
                    </th>
                  ))}
                  <th className="border border-gray-300 p-3 bg-blue-100 font-bold">
                    Total Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row: any, index: number) => (
                  <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
                    <td className="border border-gray-300 p-3 font-medium">
                      {row.name}
                    </td>
                    {project.criteria.map((criterion: any) => (
                      <td key={criterion.id} className="border border-gray-300 p-3 text-center">
                        {row[criterion.name]}%
                      </td>
                    ))}
                    <td className="border border-gray-300 p-3 text-center font-bold bg-blue-50">
                      {row.total}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Explanation */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Calculation Method:</h4>
            <p className="text-sm text-gray-600">
              Total Score = Σ (Criterion Weight × Alternative Score for that Criterion)
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Each alternative is evaluated against each criterion through pairwise comparisons.
              The final score is the weighted sum of all criterion scores.
            </p>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Export Results</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              // Export to JSON
              const exportData = {
                project: {
                  name: project.name,
                  goal: project.goal,
                  description: project.description
                },
                criteria: project.criteria,
                alternatives: project.alternatives,
                criteriaWeights,
                alternativeScores,
                results
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], 
                { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ahp-results-${Date.now()}.json`;
              a.click();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Export as JSON
          </button>
          <button
            onClick={() => {
              // Export to CSV
              let csv = 'Alternative,';
              csv += project.criteria.map((c: any) => c.name).join(',') + ',Total Score\n';
              
              tableData.forEach((row: any) => {
                csv += row.name + ',';
                csv += project.criteria.map((c: any) => row[c.name]).join(',') + ',';
                csv += row.total + '\n';
              });
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `ahp-results-${Date.now()}.csv`;
              a.click();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default AHPResultsVisualization;