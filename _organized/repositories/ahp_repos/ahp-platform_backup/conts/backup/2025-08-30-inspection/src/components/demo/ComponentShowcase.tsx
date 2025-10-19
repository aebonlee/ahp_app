/**
 * 핵심 UI 컴포넌트 쇼케이스 및 테스트 페이지
 * 모든 핵심 컴포넌트들을 테스트할 수 있는 통합 데모 페이지
 */

import React, { useState, useEffect } from 'react';
import PairwiseGrid from '../evaluation/PairwiseGrid';
import CRBadge, { CRBadgeWithActions } from '../evaluation/CRBadge';
import JudgmentHelperPanel from '../evaluation/JudgmentHelperPanel';
import HierarchyBuilder from '../project/HierarchyBuilder';
import SensitivityView from '../analysis/SensitivityView';
import BudgetingView from '../analysis/BudgetingView';
import ApiTestPage from './ApiTestPage';
import { calculateAHP, buildComparisonMatrix } from '../../utils/ahpCalculator';

// 테스트 데이터
const DEMO_ELEMENTS = [
  { id: 'C1', name: '성능', description: '엔진 성능, 연비, 주행 성능' },
  { id: 'C2', name: '디자인', description: '외관 및 내부 디자인의 만족도' },
  { id: 'C3', name: '가격', description: '구매 가격 및 유지비용' },
  { id: 'C4', name: '안전성', description: '충돌 안전도, 안전 장치' }
];

const DEMO_ALTERNATIVES = [
  { id: 'A1', name: 'K5', description: '기아 K5', ahpScore: 0.45 },
  { id: 'A2', name: 'SM5', description: '르노삼성 SM5', ahpScore: 0.30 },
  { id: 'A3', name: '소나타', description: '현대 소나타', ahpScore: 0.25 }
];

const DEMO_HIERARCHY = [
  {
    id: 'goal',
    name: '최적 중형 세단 선택',
    description: '종합적으로 가장 적합한 차량 선택',
    type: 'criterion' as const,
    level: 0,
    parentId: null,
    children: [
      {
        id: 'C1',
        name: '성능',
        description: '엔진 성능, 연비',
        type: 'criterion' as const,
        level: 1,
        parentId: 'goal',
        children: [],
        order: 0,
        evalMethod: 'pairwise' as const
      },
      {
        id: 'C2',
        name: '디자인',
        description: '외관 및 내부 디자인',
        type: 'criterion' as const,
        level: 1,
        parentId: 'goal',
        children: [
          {
            id: 'C2-1',
            name: '실내 디자인',
            description: '대시보드, 시트',
            type: 'criterion' as const,
            level: 2,
            parentId: 'C2',
            children: [],
            order: 0,
            evalMethod: 'pairwise' as const
          },
          {
            id: 'C2-2',
            name: '실외 디자인',
            description: '외관, 휠',
            type: 'criterion' as const,
            level: 2,
            parentId: 'C2',
            children: [],
            order: 1,
            evalMethod: 'pairwise' as const
          }
        ],
        order: 1,
        evalMethod: 'pairwise' as const
      },
      {
        id: 'C3',
        name: '가격',
        description: '구매 가격 및 유지비용',
        type: 'criterion' as const,
        level: 1,
        parentId: 'goal',
        children: [],
        order: 2,
        evalMethod: 'direct' as const
      }
    ],
    order: 0
  }
];

// CR>0.1을 만드는 비일관적 데이터
const INCONSISTENT_COMPARISONS = [
  { i: 0, j: 1, value: 3 },   // 성능 > 디자인 (3배)
  { i: 0, j: 2, value: 2 },   // 성능 > 가격 (2배)  
  { i: 0, j: 3, value: 4 },   // 성능 > 안전성 (4배)
  { i: 1, j: 2, value: 5 },   // 디자인 > 가격 (5배) - 비일관적!
  { i: 1, j: 3, value: 2 },   // 디자인 > 안전성 (2배)
  { i: 2, j: 3, value: 1/2 }  // 가격 < 안전성 (1/2배)
];

const ComponentShowcase: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string>('pairwise');
  const [comparisons, setComparisons] = useState(INCONSISTENT_COMPARISONS);
  const [consistencyRatio, setConsistencyRatio] = useState<number>(0);
  const [showHelper, setShowHelper] = useState(false);
  const [hierarchy, setHierarchy] = useState(DEMO_HIERARCHY);

  useEffect(() => {
    // 초기 CR 계산
    calculateConsistencyRatio();
  }, []);

  const calculateConsistencyRatio = () => {
    try {
      const matrix = Array(DEMO_ELEMENTS.length).fill(null).map(() => Array(DEMO_ELEMENTS.length).fill(1));
      
      // 비교값 적용
      comparisons.forEach(comp => {
        if (comp.i < DEMO_ELEMENTS.length && comp.j < DEMO_ELEMENTS.length) {
          matrix[comp.i][comp.j] = comp.value;
          matrix[comp.j][comp.i] = 1 / comp.value;
        }
      });

      const result = calculateAHP(matrix);
      setConsistencyRatio(result.consistencyRatio || 0);
    } catch (error) {
      console.error('CR calculation error:', error);
      setConsistencyRatio(999);
    }
  };

  const handleComparisonChange = (newComparisons: any[]) => {
    setComparisons(newComparisons);
    // CR 재계산
    setTimeout(calculateConsistencyRatio, 100);
  };

  const handleConsistencyChange = (cr: number, isConsistent: boolean) => {
    setConsistencyRatio(cr);
  };

  const components = [
    { id: 'pairwise', name: 'PairwiseGrid', icon: '⚖️', description: 'n×n 쌍대비교 격자' },
    { id: 'crbadge', name: 'CRBadge', icon: '🎯', description: '일관성 비율 배지' },
    { id: 'helper', name: 'JudgmentHelper', icon: '📋', description: '판단 도우미 패널' },
    { id: 'hierarchy', name: 'HierarchyBuilder', icon: '🌳', description: '계층구조 편집기' },
    { id: 'sensitivity', name: 'SensitivityView', icon: '📊', description: '민감도 분석' },
    { id: 'budgeting', name: 'BudgetingView', icon: '💰', description: '예산배분 최적화' },
    { id: 'apitest', name: 'API Test', icon: '🧪', description: 'API 통합 테스트' }
  ];

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'pairwise':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">⚖️ PairwiseGrid 컴포넌트</h3>
            <p className="text-gray-600">4×4 매트릭스에서 상삼각만 활성화, Saaty 9점 척도</p>
            
            <PairwiseGrid
              elements={DEMO_ELEMENTS}
              initialComparisons={comparisons}
              onComparisonChange={handleComparisonChange}
              onConsistencyChange={handleConsistencyChange}
              showProgress={true}
            />
          </div>
        );

      case 'crbadge':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">🎯 CRBadge 컴포넌트</h3>
            <p className="text-gray-600">일관성 비율을 색상과 상태로 시각화</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 다양한 CR 값 테스트 */}
              {[
                { cr: 0.03, label: '매우 일관적' },
                { cr: 0.07, label: '일관성 양호' },
                { cr: 0.09, label: '허용 가능' },
                { cr: 0.12, label: '일관성 부족' },
                { cr: 0.25, label: '매우 비일관적' },
                { cr: consistencyRatio, label: '현재 상태' }
              ].map(({ cr, label }) => (
                <div key={cr} className="p-4 border border-gray-200 rounded-lg">
                  <div className="mb-2 text-sm font-medium text-gray-700">{label}</div>
                  <CRBadge 
                    consistencyRatio={cr} 
                    isComplete={true}
                    showTooltip={true}
                    size="md"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">액션 버튼 포함 버전</h4>
              <CRBadgeWithActions
                consistencyRatio={consistencyRatio}
                isComplete={true}
                onShowHelper={() => setShowHelper(true)}
                onShowDetails={() => alert('상세 정보 표시')}
                showTooltip={true}
              />
            </div>
          </div>
        );

      case 'helper':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">📋 JudgmentHelperPanel 컴포넌트</h3>
            <p className="text-gray-600">비일관성 개선을 위한 맞춤형 제안</p>
            
            <div className="flex items-center justify-between p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium text-yellow-800">현재 CR: {consistencyRatio.toFixed(3)}</div>
                <div className="text-sm text-yellow-700">
                  {consistencyRatio > 0.1 ? '일관성 개선이 필요합니다' : '일관성이 양호합니다'}
                </div>
              </div>
              <button
                onClick={() => setShowHelper(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                disabled={consistencyRatio <= 0.1}
              >
                📋 판단 도우미 열기
              </button>
            </div>

            {showHelper && (
              <JudgmentHelperPanel
                matrix={(() => {
                  const matrix = Array(DEMO_ELEMENTS.length).fill(null).map(() => Array(DEMO_ELEMENTS.length).fill(1));
                  comparisons.forEach(comp => {
                    if (comp.i < DEMO_ELEMENTS.length && comp.j < DEMO_ELEMENTS.length) {
                      matrix[comp.i][comp.j] = comp.value;
                      matrix[comp.j][comp.i] = 1 / comp.value;
                    }
                  });
                  return matrix;
                })()}
                elementNames={DEMO_ELEMENTS.map(e => e.name)}
                onSuggestionApply={(i, j, value) => {
                  const newComparisons = [...comparisons];
                  const existingIndex = newComparisons.findIndex(c => c.i === i && c.j === j);
                  
                  if (existingIndex >= 0) {
                    newComparisons[existingIndex].value = value;
                  } else {
                    newComparisons.push({ i, j, value });
                  }
                  
                  handleComparisonChange(newComparisons);
                }}
                onClose={() => setShowHelper(false)}
                isVisible={showHelper}
              />
            )}
          </div>
        );

      case 'hierarchy':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">🌳 HierarchyBuilder 컴포넌트</h3>
            <p className="text-gray-600">드래그&드롭으로 계층구조 편집</p>
            
            <HierarchyBuilder
              initialHierarchy={hierarchy as any}
              onHierarchyChange={(newHierarchy) => setHierarchy(newHierarchy as any)}
              maxLevels={4}
              allowAlternatives={true}
            />
          </div>
        );

      case 'sensitivity':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">📊 SensitivityView 컴포넌트</h3>
            <p className="text-gray-600">가중치 변화에 따른 민감도 분석</p>
            
            <SensitivityView
              criteria={[
                {
                  id: 'C1',
                  name: '성능',
                  originalWeight: 0.4,
                  currentWeight: 0.4,
                  minWeight: 0.1,
                  maxWeight: 0.7,
                  isLocked: false
                },
                {
                  id: 'C2',
                  name: '디자인',
                  originalWeight: 0.3,
                  currentWeight: 0.3,
                  minWeight: 0.1,
                  maxWeight: 0.6,
                  isLocked: false
                },
                {
                  id: 'C3',
                  name: '가격',
                  originalWeight: 0.3,
                  currentWeight: 0.3,
                  minWeight: 0.1,
                  maxWeight: 0.6,
                  isLocked: false
                }
              ]}
              alternatives={[
                {
                  id: 'A1',
                  name: 'K5',
                  originalScore: 0.45,
                  currentScore: 0.45,
                  originalRank: 1,
                  currentRank: 1,
                  scoresByCategory: { 'C1': 0.5, 'C2': 0.4, 'C3': 0.4 }
                },
                {
                  id: 'A2',
                  name: 'SM5',
                  originalScore: 0.30,
                  currentScore: 0.30,
                  originalRank: 2,
                  currentRank: 2,
                  scoresByCategory: { 'C1': 0.3, 'C2': 0.3, 'C3': 0.3 }
                },
                {
                  id: 'A3',
                  name: '소나타',
                  originalScore: 0.25,
                  currentScore: 0.25,
                  originalRank: 3,
                  currentRank: 3,
                  scoresByCategory: { 'C1': 0.2, 'C2': 0.3, 'C3': 0.3 }
                }
              ]}
              onWeightChange={(criterionId, newWeight) => {
                console.log(`가중치 변경: ${criterionId} = ${newWeight}`);
              }}
              onReset={() => {
                console.log('가중치 초기화');
              }}
            />
          </div>
        );

      case 'budgeting':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">💰 BudgetingView 컴포넌트</h3>
            <p className="text-gray-600">예산 제약 하에서 최적 배분 계획</p>
            
            <BudgetingView
              alternatives={DEMO_ALTERNATIVES}
              initialBudget={1000000}
              onOptimize={(result) => {
                console.log('최적화 결과:', result);
              }}
              onExport={(data) => {
                console.log('분석 내보내기:', data);
              }}
            />
          </div>
        );

      case 'apitest':
        return <ApiTestPage />;

      default:
        return <div>컴포넌트를 선택하세요.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">🎛️ AHP 핵심 컴포넌트 쇼케이스</h1>
            <p className="mt-2 text-gray-600">
              실제 AHP 쌍대비교 설문 시스템의 핵심 UI 컴포넌트들을 테스트해보세요
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 사이드바 - 컴포넌트 선택 */}
          <div className="lg:w-64">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
              <h2 className="font-bold text-gray-900 mb-4">컴포넌트 목록</h2>
              <nav className="space-y-2">
                {components.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => setActiveComponent(component.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeComponent === component.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{component.icon}</span>
                      <div>
                        <div className="font-medium">{component.name}</div>
                        <div className="text-xs text-gray-500">{component.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* 상태 정보 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">현재 상태</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>비교 개수:</span>
                    <span className="font-medium">{comparisons.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>일관성 비율:</span>
                    <span className={`font-medium ${
                      consistencyRatio <= 0.1 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {consistencyRatio.toFixed(3)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>계층 노드:</span>
                    <span className="font-medium">
                      {hierarchy.reduce((count, node) => count + 1 + node.children.length, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {renderActiveComponent()}
            </div>
          </div>
        </div>
      </div>

      {/* 테스트 데이터 정보 */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🎯 테스트 요소</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {DEMO_ELEMENTS.map(elem => (
                  <li key={elem.id}>• {elem.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🚗 테스트 대안</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {DEMO_ALTERNATIVES.map(alt => (
                  <li key={alt.id}>• {alt.name} ({(alt.ahpScore * 100).toFixed(1)}%)</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📊 특징</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 의도적 비일관성 데이터</li>
                <li>• 실시간 CR 계산</li>
                <li>• 드래그&드롭 지원</li>
                <li>• 반응형 차트</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcase;