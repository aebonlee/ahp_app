import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DecisionSupportSystem from '../../components/decision/DecisionSupportSystem';

// Mock the scenario analysis utilities
jest.mock('../../utils/scenarioAnalysis', () => ({
  runScenarioAnalysis: jest.fn(() => [
    {
      scenarioId: 'base',
      scenarioName: '기준 시나리오',
      finalScores: { a1: 0.681, a2: 0.782, a3: 0.537 },
      ranking: [
        { alternativeId: 'a2', name: '클라우드 컴퓨팅', score: 0.782, rank: 1 },
        { alternativeId: 'a1', name: 'AI/머신러닝', score: 0.681, rank: 2 },
        { alternativeId: 'a3', name: 'IoT 시스템', score: 0.537, rank: 3 }
      ],
      rankingChanges: { a1: 0, a2: 0, a3: 0 }
    }
  ]),
  performSensitivityAnalysis: jest.fn(() => [
    {
      criteriaId: 'c1',
      criteriaName: '비용 효율성',
      sensitivityScore: 0.3,
      rankingStability: 0.7
    }
  ]),
  runMonteCarloSimulation: jest.fn(() => ({
    iterations: 1000,
    alternativeStability: {
      a1: { mean: 0.681, std: 0.05, confidence95: [0.6, 0.76] },
      a2: { mean: 0.782, std: 0.04, confidence95: [0.7, 0.86] },
      a3: { mean: 0.537, std: 0.06, confidence95: [0.42, 0.65] }
    },
    rankingProbability: {
      a1: { 1: 0.2, 2: 0.6, 3: 0.2 },
      a2: { 1: 0.7, 2: 0.2, 3: 0.1 },
      a3: { 1: 0.1, 2: 0.2, 3: 0.7 }
    },
    bestAlternative: 'a2',
    confidence: 0.7
  })),
  assessRisk: jest.fn(() => [
    {
      alternativeId: 'a1',
      riskScore: 0.45,
      riskFactors: {
        implementationRisk: 0.3,
        costRisk: 0.5,
        timeRisk: 0.4,
        qualityRisk: 0.5
      },
      mitigationStrategies: ['구현 가능성 검토 및 파일럿 프로젝트 실시']
    }
  ]),
  generateWhatIfScenarios: jest.fn(() => ({
    id: 'whatif_test',
    name: 'What-If 시나리오',
    description: '가정 변경에 따른 결과 분석',
    criteriaWeights: { c1: 0.6, c2: 0.2, c3: 0.1, c4: 0.1 },
    alternativeScores: {
      a1: { c1: 0.8, c2: 0.6, c3: 0.4, c4: 0.9 },
      a2: { c1: 0.9, c2: 0.9, c3: 0.8, c4: 0.7 },
      a3: { c1: 0.6, c2: 0.5, c3: 0.3, c4: 0.6 }
    }
  })),
  calculateAHPScores: jest.fn(() => ({ a1: 0.681, a2: 0.782, a3: 0.537 })),
  calculateRanking: jest.fn(() => [
    { alternativeId: 'a2', name: '클라우드 컴퓨팅', score: 0.782, rank: 1 },
    { alternativeId: 'a1', name: 'AI/머신러닝', score: 0.681, rank: 2 },
    { alternativeId: 'a3', name: 'IoT 시스템', score: 0.537, rank: 3 }
  ])
}));

describe('DecisionSupportSystem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with initial problem definition step', () => {
    render(<DecisionSupportSystem />);
    
    expect(screen.getByText('문제정의')).toBeInTheDocument();
    expect(screen.getByText('구조화')).toBeInTheDocument();
    expect(screen.getByText('평가')).toBeInTheDocument();
    expect(screen.getByText('고급분석')).toBeInTheDocument();
    expect(screen.getByText('검증')).toBeInTheDocument();
  });

  test('allows filling out problem definition form', async () => {
    render(<DecisionSupportSystem />);
    
    const titleInput = screen.getByPlaceholderText('의사결정이 필요한 문제를 간단히 설명하세요');
    const descriptionInput = screen.getByPlaceholderText('문제의 배경과 현재 상황을 자세히 설명하세요');
    
    await userEvent.type(titleInput, '신기술 도입 결정');
    await userEvent.type(descriptionInput, '디지털 전환을 위한 기술 선택');
    
    expect(titleInput).toHaveValue('신기술 도입 결정');
    expect(descriptionInput).toHaveValue('디지털 전환을 위한 기술 선택');
  });

  test('navigates between steps correctly', async () => {
    render(<DecisionSupportSystem />);
    
    // Navigate to structuring step
    const structuringButton = screen.getByText('구조화');
    await userEvent.click(structuringButton);
    
    expect(screen.getByText('AHP 계층구조')).toBeInTheDocument();
    expect(screen.getByText('이해관계자 분석')).toBeInTheDocument();
  });

  test('displays hierarchical structure in structuring step', async () => {
    render(<DecisionSupportSystem />);
    
    // Navigate to structuring step
    const structuringButton = screen.getByText('구조화');
    await userEvent.click(structuringButton);
    
    // Check if criteria are displayed
    expect(screen.getByText('비용 효율성')).toBeInTheDocument();
    expect(screen.getByText('기술 성숙도')).toBeInTheDocument();
    expect(screen.getByText('구현 복잡도')).toBeInTheDocument();
    expect(screen.getByText('전략적 중요성')).toBeInTheDocument();
    
    // Check if alternatives are displayed
    expect(screen.getByText('AI/머신러닝')).toBeInTheDocument();
    expect(screen.getByText('클라우드 컴퓨팅')).toBeInTheDocument();
    expect(screen.getByText('IoT 시스템')).toBeInTheDocument();
  });

  test('shows evaluation status and sample results', async () => {
    render(<DecisionSupportSystem />);
    
    // Navigate to evaluation step
    const evaluationButton = screen.getByText('평가');
    await userEvent.click(evaluationButton);
    
    expect(screen.getByText('AHP 평가 수행')).toBeInTheDocument();
    expect(screen.getByText('평가 프로세스')).toBeInTheDocument();
    expect(screen.getByText('기준 간 쌍대비교 (4개 기준)')).toBeInTheDocument();
    expect(screen.getByText('1위: 클라우드 컴퓨팅')).toBeInTheDocument();
  });

  test('enables advanced analysis after evaluation', async () => {
    render(<DecisionSupportSystem />);
    
    // Navigate to evaluation and trigger analysis preparation
    const evaluationButton = screen.getByText('평가');
    await userEvent.click(evaluationButton);
    
    const advancedAnalysisButton = screen.getByText('고급 분석으로 진행');
    await userEvent.click(advancedAnalysisButton);
    
    expect(screen.getByText('고급 의사결정 분석')).toBeInTheDocument();
    expect(screen.getByText('전체 분석 실행')).toBeInTheDocument();
  });

  test('runs complete advanced analysis', async () => {
    render(<DecisionSupportSystem />);
    
    // Navigate to evaluation step and prepare for analysis
    const evaluationButton = screen.getByText('평가');
    await userEvent.click(evaluationButton);
    
    const advancedAnalysisButton = screen.getByText('고급 분석으로 진행');
    await userEvent.click(advancedAnalysisButton);
    
    // Run advanced analysis
    const runAnalysisButton = screen.getByText('전체 분석 실행');
    await userEvent.click(runAnalysisButton);
    
    // Wait for analysis to complete
    await waitFor(() => {
      expect(screen.queryByText('분석 중...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Check if analysis results are displayed
    expect(screen.getByText('🎭 시나리오 분석')).toBeInTheDocument();
    expect(screen.getByText('📈 민감도 분석')).toBeInTheDocument();
    expect(screen.getByText('🎲 확률 분석')).toBeInTheDocument();
    expect(screen.getByText('⚠️ 리스크 평가')).toBeInTheDocument();
  });

  test('displays scenario analysis results', async () => {
    render(<DecisionSupportSystem />);
    
    // Setup for analysis
    const evaluationButton = screen.getByText('평가');
    await userEvent.click(evaluationButton);
    
    const advancedAnalysisButton = screen.getByText('고급 분석으로 진행');
    await userEvent.click(advancedAnalysisButton);
    
    const runAnalysisButton = screen.getByText('전체 분석 실행');
    await userEvent.click(runAnalysisButton);
    
    await waitFor(() => {
      expect(screen.queryByText('분석 중...')).not.toBeInTheDocument();
    });
    
    // Check scenario analysis tab
    const scenarioTab = screen.getByText('🎭 시나리오 분석');
    await userEvent.click(scenarioTab);
    
    expect(screen.getByText('🎭 시나리오 분석 결과')).toBeInTheDocument();
    expect(screen.getByText('기준 시나리오')).toBeInTheDocument();
  });

  test('displays sensitivity analysis results', async () => {
    render(<DecisionSupportSystem />);
    
    // Setup for analysis
    const evaluationButton = screen.getByText('평가');
    await userEvent.click(evaluationButton);
    
    const advancedAnalysisButton = screen.getByText('고급 분석으로 진행');
    await userEvent.click(advancedAnalysisButton);
    
    const runAnalysisButton = screen.getByText('전체 분석 실행');
    await userEvent.click(runAnalysisButton);
    
    await waitFor(() => {
      expect(screen.queryByText('분석 중...')).not.toBeInTheDocument();
    });
    
    // Check sensitivity analysis tab
    const sensitivityTab = screen.getByText('📈 민감도 분석');
    await userEvent.click(sensitivityTab);
    
    expect(screen.getByText('📈 민감도 분석 결과')).toBeInTheDocument();
    expect(screen.getByText('비용 효율성')).toBeInTheDocument();
    expect(screen.getByText('낮은 민감도')).toBeInTheDocument();
  });

  test('displays monte carlo simulation results', async () => {
    render(<DecisionSupportSystem />);
    
    // Setup for analysis
    const evaluationButton = screen.getByText('평가');
    await userEvent.click(evaluationButton);
    
    const advancedAnalysisButton = screen.getByText('고급 분석으로 진행');
    await userEvent.click(advancedAnalysisButton);
    
    const runAnalysisButton = screen.getByText('전체 분석 실행');
    await userEvent.click(runAnalysisButton);
    
    await waitFor(() => {
      expect(screen.queryByText('분석 중...')).not.toBeInTheDocument();
    });
    
    // Check Monte Carlo analysis tab
    const monteCarloTab = screen.getByText('🎲 확률 분석');
    await userEvent.click(monteCarloTab);
    
    expect(screen.getByText('🎲 몬테카를로 확률 분석')).toBeInTheDocument();
    expect(screen.getByText('최적 대안 추천')).toBeInTheDocument();
    expect(screen.getByText('클라우드 컴퓨팅')).toBeInTheDocument();
    expect(screen.getByText('신뢰도: 70.0%')).toBeInTheDocument();
  });

  test('displays risk assessment results', async () => {
    render(<DecisionSupportSystem />);
    
    // Setup for analysis
    const evaluationButton = screen.getByText('평가');
    await userEvent.click(evaluationButton);
    
    const advancedAnalysisButton = screen.getByText('고급 분석으로 진행');
    await userEvent.click(advancedAnalysisButton);
    
    const runAnalysisButton = screen.getByText('전체 분석 실행');
    await userEvent.click(runAnalysisButton);
    
    await waitFor(() => {
      expect(screen.queryByText('분석 중...')).not.toBeInTheDocument();
    });
    
    // Check risk analysis tab
    const riskTab = screen.getByText('⚠️ 리스크 평가');
    await userEvent.click(riskTab);
    
    expect(screen.getByText('⚠️ 리스크 평가 결과')).toBeInTheDocument();
    expect(screen.getByText('AI/머신러닝')).toBeInTheDocument();
    expect(screen.getByText('보통 위험')).toBeInTheDocument();
    expect(screen.getByText('위험 완화 전략:')).toBeInTheDocument();
  });

  test('shows validation report when analysis is complete', async () => {
    render(<DecisionSupportSystem />);
    
    // Setup and run complete analysis
    const evaluationButton = screen.getByText('평가');
    await userEvent.click(evaluationButton);
    
    const advancedAnalysisButton = screen.getByText('고급 분석으로 진행');
    await userEvent.click(advancedAnalysisButton);
    
    const runAnalysisButton = screen.getByText('전체 분석 실행');
    await userEvent.click(runAnalysisButton);
    
    await waitFor(() => {
      expect(screen.queryByText('분석 중...')).not.toBeInTheDocument();
    });
    
    // Navigate to validation step
    const validationButton = screen.getByText('검증');
    await userEvent.click(validationButton);
    
    expect(screen.getByText('결과 검증 및 의사결정 보고서')).toBeInTheDocument();
    expect(screen.getByText('📋 의사결정 권고안')).toBeInTheDocument();
    expect(screen.getByText('추천 대안:')).toBeInTheDocument();
    expect(screen.getByText('클라우드 컴퓨팅')).toBeInTheDocument();
    expect(screen.getByText('신뢰도:')).toBeInTheDocument();
    expect(screen.getByText('70.0%')).toBeInTheDocument();
  });

  test('handles previous/next navigation correctly', async () => {
    render(<DecisionSupportSystem />);
    
    // Test next button
    const nextButton = screen.getByText('다음 단계');
    await userEvent.click(nextButton);
    
    expect(screen.getByText('AHP 계층구조')).toBeInTheDocument();
    
    // Test previous button
    const prevButton = screen.getByText('이전 단계');
    await userEvent.click(prevButton);
    
    expect(screen.getByText('의사결정 문제 정의')).toBeInTheDocument();
  });

  test('validates required fields and enables/disables buttons appropriately', () => {
    render(<DecisionSupportSystem />);
    
    // Initially next button should be enabled (problem definition has sample data)
    const nextButton = screen.getByText('다음 단계');
    expect(nextButton).not.toBeDisabled();
    
    // Previous button should be disabled on first step
    const prevButton = screen.getByText('이전 단계');
    expect(prevButton).toBeDisabled();
  });

  test('displays SMART principle guide in problem definition', () => {
    render(<DecisionSupportSystem />);
    
    expect(screen.getByText('🎯 효과적인 문제 정의를 위한 가이드')).toBeInTheDocument();
    expect(screen.getByText('SMART 원칙 적용:')).toBeInTheDocument();
    expect(screen.getByText('Specific')).toBeInTheDocument();
    expect(screen.getByText('Measurable')).toBeInTheDocument();
    expect(screen.getByText('Achievable')).toBeInTheDocument();
    expect(screen.getByText('Relevant')).toBeInTheDocument();
    expect(screen.getByText('Time-bound')).toBeInTheDocument();
  });

  test('shows stakeholder analysis with influence and interest metrics', async () => {
    render(<DecisionSupportSystem />);
    
    // Navigate to structuring step
    const structuringButton = screen.getByText('구조화');
    await userEvent.click(structuringButton);
    
    expect(screen.getByText('이해관계자 분석')).toBeInTheDocument();
    expect(screen.getByText('CTO')).toBeInTheDocument();
    expect(screen.getByText('CFO')).toBeInTheDocument();
    expect(screen.getByText('영향력: 90%')).toBeInTheDocument();
    expect(screen.getByText('관심도: 80%')).toBeInTheDocument();
  });
});