import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import ScreenID from '../common/ScreenID';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// LineChart, Line - 현재 미사용
import { MESSAGES } from '../../constants/messages';
import { SCREEN_IDS } from '../../constants/screenIds';

interface SensitivityAnalysisProps {
  projectId: string;
  onBack?: () => void;
}

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({ projectId, onBack }) => {
  const [selectedCriterion, setSelectedCriterion] = useState('');
  const [selectedSubCriterion, setSelectedSubCriterion] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const criteria = [
    { id: 'productivity', name: '개발 생산성 효율화', weight: 0.40386 },
    { id: 'quality', name: '코딩 실무 품질 적합화', weight: 0.30101 },
    { id: 'automation', name: '개발 프로세스 자동화', weight: 0.29513 }
  ];

  const subCriteria = {
    productivity: [
      { id: 'coding-speed', name: '코딩 작성 속도 향상', weight: 0.4199 },
      { id: 'debugging', name: '디버깅 시간 단축', weight: 0.2487 },
      { id: 'repetitive', name: '반복 작업 최소화', weight: 0.3314 }
    ],
    quality: [
      { id: 'code-quality', name: '코드 품질 개선 및 최적화', weight: 0.5206 },
      { id: 'ai-reliability', name: 'AI생성 코딩의 신뢰성', weight: 0.2228 },
      { id: 'learning', name: '신규 기술/언어 학습지원', weight: 0.2566 }
    ],
    automation: [
      { id: 'test-gen', name: '테스트 케이스 자동 생성', weight: 0.2932 },
      { id: 'documentation', name: '기술 문서/주석 자동화', weight: 0.3141 },
      { id: 'deployment', name: '형상관리 및 배포 지원', weight: 0.3927 }
    ]
  };

  const getCurrentSubCriteria = () => {
    return selectedCriterion ? subCriteria[selectedCriterion as keyof typeof subCriteria] || [] : [];
  };

  const handleAnalysis = async () => {
    if (!selectedCriterion || !selectedSubCriterion || !newValue) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setResults({
      original: {
        alternatives: [
          { name: '코딩 작성 속도 향상', score: 0.16959, rank: 1 },
          { name: '코드 품질 개선 및 최적화', score: 0.15672, rank: 2 },
          { name: '반복 작업 최소화', score: 0.13382, rank: 3 },
          { name: '형상관리 및 배포 지원', score: 0.11591, rank: 4 },
          { name: '디버깅 시간 단축', score: 0.10044, rank: 5 }
        ]
      },
      modified: {
        alternatives: [
          { name: '코딩 작성 속도 향상', score: 0.14520, rank: 2 },
          { name: '코드 품질 개선 및 최적화', score: 0.15672, rank: 1 },
          { name: '반복 작업 최소화', score: 0.15821, rank: 1 },
          { name: '형상관리 및 배포 지원', score: 0.11591, rank: 4 },
          { name: '디버깅 시간 단축', score: 0.12483, rank: 3 }
        ]
      },
      changes: [
        { criterion: selectedSubCriterion, from: getCurrentSubCriteria().find(c => c.id === selectedSubCriterion)?.weight || 0, to: parseFloat(newValue) }
      ]
    });
    
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setResults(null);
    setSelectedCriterion('');
    setSelectedSubCriterion('');
    setNewValue('');
  };

  const captureResults = () => {
    alert('화면 캡처 기능 (구현 예정) - 서버에 저장되지 않으니 캡처하여 보관하세요.');
  };

  return (
    <div className="space-y-6">
      <ScreenID id={SCREEN_IDS.ADMIN.STEP3_SENS} />
      <Card title="서브 기능 2) 민감도 분석">
        <div className="space-y-6">
          {/* 주의 배지 - 상시 표시 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="text-yellow-500 mr-2">⚠️</div>
              <span className="text-sm text-yellow-800 font-medium">
                {MESSAGES.RESULTS_NOT_SAVED}
              </span>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">📊 민감도 분석</h4>
            <p className="text-sm text-purple-700">
              기준 가중치 변경에 따른 대안 순위 변화를 분석합니다.
            </p>
          </div>

          {/* Help Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 text-lg">❓</span>
              <div>
                <h5 className="font-medium text-blue-900 mb-2">📊 민감도 분석 흐름</h5>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>민감도 분석 버튼 클릭</li>
                  <li>변경하려는 기준의 상위기준 선택(예: '코딩 작성 속도 향상' 변경 시 상위 '개발 생산성 효율화' 클릭)</li>
                  <li>변경할 기준 클릭</li>
                  <li>우측에 변경값 입력 칸 표시</li>
                  <li>분석 시작 클릭</li>
                  <li>대안 최종 중요도 변화 확인</li>
                </ol>
                <p className="text-xs text-blue-600 mt-2">
                  💡 <strong>결과는 서버에 저장되지 않음</strong> — 사진촬영/캡쳐로 보관하세요.
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Steps */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">📋 분석 설정</h4>
            
            {/* Step 1: Select Top Criterion */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ① 상위기준 선택
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {criteria.map((criterion) => (
                  <button
                    key={criterion.id}
                    onClick={() => {
                      setSelectedCriterion(criterion.id);
                      setSelectedSubCriterion('');
                      setNewValue('');
                      setResults(null);
                    }}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedCriterion === criterion.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h5 className="font-medium">{criterion.name}</h5>
                    <p className="text-sm text-gray-600">
                      현재 가중치: {(criterion.weight * 100).toFixed(1)}%
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Sub Criterion */}
            {selectedCriterion && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ② 변경 기준 클릭
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getCurrentSubCriteria().map((subCriterion) => (
                    <button
                      key={subCriterion.id}
                      onClick={() => {
                        setSelectedSubCriterion(subCriterion.id);
                        setNewValue(subCriterion.weight.toString());
                        setResults(null);
                      }}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedSubCriterion === subCriterion.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h6 className="font-medium">{subCriterion.name}</h6>
                      <p className="text-sm text-gray-600">
                        현재: {(subCriterion.weight * 100).toFixed(1)}%
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Input New Value */}
            {selectedSubCriterion && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ③ 새로운 가중치 값 입력 (0.0 ~ 1.0)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0 - 1.0"
                  />
                  <span className="text-sm text-gray-600">
                    ({(parseFloat(newValue || '0') * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}

            {/* Step 4: Start Analysis */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleAnalysis}
                  variant="primary"
                  loading={isAnalyzing}
                  disabled={!selectedCriterion || !selectedSubCriterion || !newValue || isAnalyzing}
                >
                  {isAnalyzing ? '④ 분석 중...' : '④ 분석 시작'}
                </Button>
                
                {results && (
                  <Button onClick={resetAnalysis} variant="secondary">
                    다시 설정
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Step 5: Results */}
          {results && (
            <div className="border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">⑤ 분석 결과</h4>
              
              {/* Chart Visualization */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-800 mb-3">결과 변화 차트</h5>
                <div className="h-80 bg-white border border-gray-200 rounded-lg p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: '코딩 속도',
                          기존: Math.round(results.original.alternatives[0].score * 100),
                          변경후: Math.round(results.modified.alternatives[0].score * 100)
                        },
                        {
                          name: '코드 품질',
                          기존: Math.round(results.original.alternatives[1].score * 100),
                          변경후: Math.round(results.modified.alternatives[1].score * 100)
                        },
                        {
                          name: '반복 작업',
                          기존: Math.round(results.original.alternatives[2].score * 100),
                          변경후: Math.round(results.modified.alternatives[2].score * 100)
                        },
                        {
                          name: '형상관리',
                          기존: Math.round(results.original.alternatives[3].score * 100),
                          변경후: Math.round(results.modified.alternatives[3].score * 100)
                        },
                        {
                          name: '디버깅',
                          기존: Math.round(results.original.alternatives[4].score * 100),
                          변경후: Math.round(results.modified.alternatives[4].score * 100)
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`${value}점`, '']} />
                      <Legend />
                      <Bar dataKey="기존" fill="#94a3b8" />
                      <Bar dataKey="변경후" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Original Results */}
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">기존 결과</h5>
                  <div className="space-y-2">
                    {results.original.alternatives.map((alternative: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-gray-500 text-white rounded-full text-xs flex items-center justify-center">
                            {alternative.rank}
                          </span>
                          <span className="font-medium">{alternative.name}</span>
                        </div>
                        <span className="text-gray-700">
                          {(alternative.score * 100).toFixed(1)}점
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modified Results */}
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">변경 후 결과</h5>
                  <div className="space-y-2">
                    {results.modified.alternatives.map((alternative: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                            alternative.rank !== results.original.alternatives[index].rank
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          }`}>
                            {alternative.rank}
                          </span>
                          <span className="font-medium">{alternative.name}</span>
                        </div>
                        <span className="text-orange-700">
                          {(alternative.score * 100).toFixed(1)}점
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Changes Summary */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-yellow-900 mb-2">📋 변경 내용</h5>
                {results.changes.map((change: any, index: number) => (
                  <p key={index} className="text-sm text-yellow-700">
                    <strong>{getCurrentSubCriteria().find(c => c.id === change.criterion)?.name}</strong> 
                    가중치: {(change.from * 100).toFixed(1)}% → {(change.to * 100).toFixed(1)}%
                  </p>
                ))}
              </div>

              {/* Save Notice */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-red-900">⚠️ 중요 안내</h5>
                    <p className="text-sm text-red-700 mt-1">
                      {MESSAGES.RESULTS_NOT_SAVED}
                    </p>
                  </div>
                  <Button onClick={captureResults} variant="primary">
                    결과 캡처
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SensitivityAnalysis;