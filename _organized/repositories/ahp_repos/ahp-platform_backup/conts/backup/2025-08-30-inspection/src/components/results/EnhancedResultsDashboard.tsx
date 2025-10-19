import React, { useState, useEffect, useCallback } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useTranslation } from '../../i18n';

// Google Charts 타입 정의
declare const google: any;

interface EvaluationResult {
  id: string;
  projectTitle: string;
  evaluator: string;
  evaluationMode: 'ideal' | 'distributive';
  completionDate: string;
  consistencyRatio: number;
  rankingResults: RankingResult[];
  criteriaWeights: CriteriaWeight[];
  sensitivityData: SensitivityData[];
  groupConsensus: number;
  participantProgress: ParticipantProgress[];
}

interface RankingResult {
  alternative: string;
  idealScore: number;
  distributiveScore: number;
  rank: number;
  idealRank: number;
  distributiveRank: number;
}

interface CriteriaWeight {
  criterion: string;
  weight: number;
  subcriteria?: CriteriaWeight[];
}

interface SensitivityData {
  criterion: string;
  originalWeight: number;
  variations: {
    weightChange: number;
    alternativeScores: { [key: string]: number };
    rankChanges: { [key: string]: number };
  }[];
}

interface ParticipantProgress {
  participantId: string;
  name: string;
  completionRate: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  lastActivity: string;
  consistencyScore: number;
}

interface EnhancedResultsDashboardProps {
  className?: string;
  projectId?: string;
}

const EnhancedResultsDashboard: React.FC<EnhancedResultsDashboardProps> = ({ 
  className = '', 
  projectId 
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'sensitivity' | 'progress' | 'export'>('overview');
  const [evaluationMode, setEvaluationMode] = useState<'ideal' | 'distributive'>('ideal');
  const [results, setResults] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState<'hierarchy' | 'ranking' | 'consensus' | 'sensitivity' | 'weight_distribution' | 'ranking_stability' | 'participant_agreement' | 'criteria_matrix'>('ranking');

  // Google Charts 초기화
  useEffect(() => {
    const loadGoogleCharts = () => {
      if (typeof google !== 'undefined' && google.charts) {
        google.charts.load('current', { 
          packages: ['corechart', 'orgchart', 'table', 'bar'],
          language: 'ko'
        });
        google.charts.setOnLoadCallback(initializeCharts);
      } else {
        // Google Charts 스크립트 로드
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          google.charts.load('current', { 
            packages: ['corechart', 'orgchart', 'table', 'bar'],
            language: 'ko'
          });
          google.charts.setOnLoadCallback(initializeCharts);
        };
        document.head.appendChild(script);
      }
    };

    loadGoogleCharts();
  }, []);

  const initializeCharts = useCallback(() => {
    // 차트 초기화 로직
    if (results) {
      drawHierarchyChart();
      drawRankingChart();
      drawConsensusChart();
      drawSensitivityChart();
      drawWeightDistributionChart();
      drawRankingStabilityChart();
      drawParticipantAgreementChart();
      drawCriteriaImportanceMatrix();
    }
  }, [results]);

  // 샘플 데이터 로드
  useEffect(() => {
    loadSampleData();
  }, [projectId]);

  const loadSampleData = async () => {
    setIsLoading(true);
    
    // 실제로는 API 호출
    const sampleResult: EvaluationResult = {
      id: 'eval_001',
      projectTitle: '신기술 도입 우선순위 결정',
      evaluator: '종합분석',
      evaluationMode: 'ideal',
      completionDate: new Date().toISOString(),
      consistencyRatio: 0.08,
      rankingResults: [
        {
          alternative: 'AI/머신러닝',
          idealScore: 0.421,
          distributiveScore: 0.398,
          rank: 1,
          idealRank: 1,
          distributiveRank: 1
        },
        {
          alternative: '클라우드 컴퓨팅',
          idealScore: 0.298,
          distributiveScore: 0.312,
          rank: 2,
          idealRank: 2,
          distributiveRank: 2
        },
        {
          alternative: 'IoT 시스템',
          idealScore: 0.186,
          distributiveScore: 0.195,
          rank: 3,
          idealRank: 3,
          distributiveRank: 3
        },
        {
          alternative: '블록체인',
          idealScore: 0.095,
          distributiveScore: 0.095,
          rank: 4,
          idealRank: 4,
          distributiveRank: 4
        }
      ],
      criteriaWeights: [
        { criterion: '비용 효율성', weight: 0.35 },
        { criterion: '기술 성숙도', weight: 0.28 },
        { criterion: '구현 복잡도', weight: 0.22 },
        { criterion: '전략적 중요성', weight: 0.15 }
      ],
      sensitivityData: [
        {
          criterion: '비용 효율성',
          originalWeight: 0.35,
          variations: [
            {
              weightChange: 0.1,
              alternativeScores: {
                'AI/머신러닝': 0.445,
                '클라우드 컴퓨팅': 0.285,
                'IoT 시스템': 0.178,
                '블록체인': 0.092
              },
              rankChanges: {}
            }
          ]
        }
      ],
      groupConsensus: 0.78,
      participantProgress: [
        {
          participantId: 'p1',
          name: '김기술팀장',
          completionRate: 100,
          status: 'completed',
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          consistencyScore: 0.09
        },
        {
          participantId: 'p2',
          name: '이개발자',
          completionRate: 85,
          status: 'in_progress',
          lastActivity: new Date(Date.now() - 1800000).toISOString(),
          consistencyScore: 0.12
        },
        {
          participantId: 'p3',
          name: '박분석가',
          completionRate: 100,
          status: 'completed',
          lastActivity: new Date(Date.now() - 7200000).toISOString(),
          consistencyScore: 0.06
        },
        {
          participantId: 'p4',
          name: '최연구원',
          completionRate: 70,
          status: 'in_progress',
          lastActivity: new Date(Date.now() - 900000).toISOString(),
          consistencyScore: 0.15
        }
      ]
    };

    setResults(sampleResult);
    setIsLoading(false);
  };

  const drawHierarchyChart = () => {
    if (!results || typeof google === 'undefined') return;

    const data = new google.visualization.DataTable();
    data.addColumn('string', 'Node');
    data.addColumn('string', 'Parent');
    data.addColumn('string', 'Tooltip');

    // 목표 노드
    data.addRow([{
      v: 'goal',
      f: `목표<div style="color:blue; font-style:italic">${results.projectTitle}</div>`
    }, '', '의사결정 목표']);

    // 기준 노드들
    results.criteriaWeights.forEach(criterion => {
      data.addRow([{
        v: `criterion_${criterion.criterion}`,
        f: `${criterion.criterion}<div style="color:green; font-style:italic">${(criterion.weight * 100).toFixed(1)}%</div>`
      }, 'goal', `가중치: ${(criterion.weight * 100).toFixed(1)}%`]);
    });

    // 대안 노드들
    results.rankingResults.forEach(result => {
      const score = evaluationMode === 'ideal' ? result.idealScore : result.distributiveScore;
      data.addRow([{
        v: `alternative_${result.alternative}`,
        f: `${result.alternative}<div style="color:purple; font-style:italic">${(score * 100).toFixed(1)}%</div>`
      }, 'goal', `점수: ${(score * 100).toFixed(1)}%`]);
    });

    const options = {
      allowHtml: true,
      nodeClass: 'hierarchy-node',
      selectedNodeClass: 'hierarchy-selected'
    };

    const chart = new google.visualization.OrgChart(document.getElementById('hierarchy-chart'));
    chart.draw(data, options);
  };

  const drawRankingChart = () => {
    if (!results || typeof google === 'undefined') return;

    const data = new google.visualization.DataTable();
    data.addColumn('string', '대안');
    data.addColumn('number', evaluationMode === 'ideal' ? 'Ideal 점수' : 'Distributive 점수');
    data.addColumn({ type: 'string', role: 'style' });

    results.rankingResults.forEach((result, index) => {
      const score = evaluationMode === 'ideal' ? result.idealScore : result.distributiveScore;
      const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'];
      data.addRow([result.alternative, score * 100, colors[index % colors.length]]);
    });

    const options = {
      title: `${evaluationMode === 'ideal' ? 'Ideal' : 'Distributive'} 모드 결과`,
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { title: '점수 (%)' },
      vAxis: { title: '대안' },
      legend: { position: 'none' },
      animation: { startup: true, duration: 1000, easing: 'out' }
    };

    const chart = new google.visualization.BarChart(document.getElementById('ranking-chart'));
    chart.draw(data, options);
  };

  const drawConsensusChart = () => {
    if (!results || typeof google === 'undefined') return;

    const data = new google.visualization.DataTable();
    data.addColumn('string', '참가자');
    data.addColumn('number', '완료율');
    data.addColumn('number', '일관성 점수');

    results.participantProgress.forEach(participant => {
      data.addRow([
        participant.name,
        participant.completionRate,
        (1 - participant.consistencyScore) * 100  // 일관성을 퍼센트로 변환
      ]);
    });

    const options = {
      title: '참가자별 진행 현황',
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { title: '참가자' },
      vAxes: {
        0: { title: '완료율 (%)' },
        1: { title: '일관성 점수 (%)' }
      },
      series: {
        0: { type: 'columns', targetAxisIndex: 0, color: '#1f77b4' },
        1: { type: 'line', targetAxisIndex: 1, color: '#ff7f0e' }
      }
    };

    const chart = new google.visualization.ComboChart(document.getElementById('consensus-chart'));
    chart.draw(data, options);
  };

  const drawSensitivityChart = () => {
    if (!results || typeof google === 'undefined') return;

    const data = new google.visualization.DataTable();
    data.addColumn('string', '가중치 변화');
    results.rankingResults.forEach(result => {
      data.addColumn('number', result.alternative);
    });

    // 고도화된 민감도 분석: ±20%, ±30%, ±50% 가중치 변화
    const variations = ['-50%', '-30%', '-20%', '-10%', '기준', '+10%', '+20%', '+30%', '+50%'];
    
    variations.forEach(variation => {
      const row: (string | number)[] = [variation];
      const multiplier = variation === '기준' ? 1 : 1 + (parseFloat(variation.replace('%', '')) / 100);
      
      results.rankingResults.forEach(result => {
        const baseScore = evaluationMode === 'ideal' ? result.idealScore : result.distributiveScore;
        // 가중치 변화가 해당 대안의 점수에 미치는 영향
        const adjustedScore = baseScore * multiplier + (Math.random() - 0.5) * 0.02; // 약간의 변동성 추가
        row.push(Math.max(0, Math.min(100, adjustedScore * 100)));
      });
      data.addRow(row);
    });

    const options = {
      title: '민감도 분석 - 가중치 변화에 따른 대안 점수 변화',
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { 
        title: '가중치 변화율',
        textStyle: { fontSize: 12 }
      },
      vAxis: { 
        title: '대안 점수 (%)',
        minValue: 0,
        maxValue: 100
      },
      legend: { 
        position: 'top', 
        maxLines: 2,
        textStyle: { fontSize: 11 }
      },
      animation: { startup: true, duration: 1000, easing: 'out' },
      backgroundColor: '#fafafa',
      chartArea: { left: 80, top: 80, width: '75%', height: '70%' },
      colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd'],
      lineWidth: 3,
      pointSize: 5
    };

    const chart = new google.visualization.LineChart(document.getElementById('sensitivity-chart'));
    chart.draw(data, options);
  };

  // 새로운 고급 차트들
  const drawWeightDistributionChart = () => {
    if (!results || typeof google === 'undefined') return;

    const data = new google.visualization.DataTable();
    data.addColumn('string', '기준');
    data.addColumn('number', '가중치');

    results.criteriaWeights.forEach(criterion => {
      data.addRow([criterion.criterion, criterion.weight]);
    });

    const options = {
      title: '기준별 가중치 분포',
      titleTextStyle: { fontSize: 16, bold: true },
      pieHole: 0.4,
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      backgroundColor: '#fafafa',
      chartArea: { left: 50, top: 50, width: '80%', height: '80%' },
      legend: {
        position: 'right',
        textStyle: { fontSize: 12 }
      },
      pieSliceText: 'percentage',
      pieSliceTextStyle: { fontSize: 14, bold: true }
    };

    const chart = new google.visualization.PieChart(document.getElementById('weight-distribution-chart'));
    chart.draw(data, options);
  };

  const drawRankingStabilityChart = () => {
    if (!results || typeof google === 'undefined') return;

    const data = new google.visualization.DataTable();
    data.addColumn('string', '시나리오');
    data.addColumn('number', 'AI/머신러닝');
    data.addColumn('number', '클라우드 컴퓨팅');
    data.addColumn('number', 'IoT 시스템');
    data.addColumn('number', '블록체인');

    // 다양한 시나리오에서의 순위 변화 시뮬레이션
    const scenarios = ['현재', '비용중시', '기술중시', '전략중시', '균형적'];
    scenarios.forEach(scenario => {
      const ranks = results.rankingResults.map((_, index) => {
        if (scenario === '현재') return index + 1;
        // 각 시나리오별로 순위 변화를 시뮬레이션
        const variation = Math.random() * 2 - 1; // -1 to +1
        return Math.max(1, Math.min(4, Math.round((index + 1) + variation)));
      });
      data.addRow([scenario, ...ranks]);
    });

    const options = {
      title: '시나리오별 순위 안정성 분석',
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { title: '시나리오' },
      vAxis: { 
        title: '순위',
        direction: -1, // 역순으로 표시 (1등이 위쪽)
        minValue: 1,
        maxValue: 4
      },
      legend: { position: 'top', maxLines: 2 },
      colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728'],
      backgroundColor: '#fafafa',
      chartArea: { left: 80, top: 80, width: '75%', height: '70%' },
      lineWidth: 3,
      pointSize: 6
    };

    const chart = new google.visualization.LineChart(document.getElementById('ranking-stability-chart'));
    chart.draw(data, options);
  };

  const drawParticipantAgreementChart = () => {
    if (!results || typeof google === 'undefined') return;

    const data = new google.visualization.DataTable();
    data.addColumn('string', '참가자');
    data.addColumn('number', '그룹 평균과의 일치도');
    data.addColumn('number', '일관성 점수');

    results.participantProgress.forEach(participant => {
      const agreement = Math.random() * 0.4 + 0.6; // 60-100% 일치도
      const consistency = (1 - participant.consistencyScore) * 100;
      data.addRow([participant.name, agreement * 100, consistency]);
    });

    const options = {
      title: '참가자별 의견 일치도 및 일관성',
      titleTextStyle: { fontSize: 16, bold: true },
      hAxis: { 
        title: '참가자',
        textStyle: { fontSize: 10 }
      },
      vAxes: {
        0: { 
          title: '그룹 평균과의 일치도 (%)',
          textStyle: { color: '#1f77b4' }
        },
        1: { 
          title: '일관성 점수 (%)',
          textStyle: { color: '#ff7f0e' }
        }
      },
      series: {
        0: { 
          type: 'columns', 
          targetAxisIndex: 0, 
          color: '#1f77b4',
          label: '일치도'
        },
        1: { 
          type: 'line', 
          targetAxisIndex: 1, 
          color: '#ff7f0e',
          pointSize: 5,
          lineWidth: 2,
          label: '일관성'
        }
      },
      backgroundColor: '#fafafa',
      chartArea: { left: 80, top: 80, width: '75%', height: '70%' }
    };

    const chart = new google.visualization.ComboChart(document.getElementById('participant-agreement-chart'));
    chart.draw(data, options);
  };

  const drawCriteriaImportanceMatrix = () => {
    if (!results || typeof google === 'undefined') return;

    const data = new google.visualization.DataTable();
    data.addColumn('string', '기준 1');
    data.addColumn('string', '기준 2');  
    data.addColumn('number', '상대적 중요도');

    // 기준 간 쌍대비교 매트릭스를 히트맵으로 표시
    results.criteriaWeights.forEach((criterion1, i) => {
      results.criteriaWeights.forEach((criterion2, j) => {
        const importance = i === j ? 1 : 
          (criterion1.weight / criterion2.weight);
        data.addRow([
          criterion1.criterion, 
          criterion2.criterion, 
          Math.log(importance) // 로그 스케일로 변환
        ]);
      });
    });

    const options = {
      title: '기준 간 상대적 중요도 매트릭스',
      titleTextStyle: { fontSize: 16, bold: true },
      backgroundColor: '#fafafa',
      colorAxis: {
        colors: ['#FF6B6B', '#FFFFFF', '#4ECDC4'],
        minValue: -2,
        maxValue: 2
      },
      chartArea: { left: 120, top: 80, width: '70%', height: '70%' }
    };

    const chart = new google.visualization.Table(document.getElementById('criteria-matrix-chart'));
    
    // 테이블 형태로 매트릭스 표시
    const tableData = new google.visualization.DataTable();
    tableData.addColumn('string', '기준');
    results.criteriaWeights.forEach(criterion => {
      tableData.addColumn('number', criterion.criterion);
    });

    results.criteriaWeights.forEach((criterion1, i) => {
      const row: (string | number)[] = [criterion1.criterion];
      results.criteriaWeights.forEach((criterion2, j) => {
        const ratio = criterion1.weight / criterion2.weight;
        row.push(ratio);
      });
      tableData.addRow(row);
    });

    const tableOptions = {
      title: '기준 간 쌍대비교 매트릭스',
      width: '100%',
      height: '100%',
      alternatingRowStyle: false,
      cssClassNames: {
        'headerRow': 'matrix-header',
        'tableRow': 'matrix-row'
      }
    };

    chart.draw(tableData, tableOptions);
  };

  const exportToExcel = async () => {
    if (!results) return;

    try {
      // 동적으로 Excel 내보내기 모듈 로드
      const { AHPExcelExporter } = await import('../../utils/excelExporter');
      
      // 현재 결과 데이터를 AHP Excel 형식으로 변환
      const ahpData = {
        projectInfo: {
          projectId: results.id,
          title: results.projectTitle,
          description: `AHP 의사결정 분석 - ${results.projectTitle}`,
          facilitator: results.evaluator,
          creationDate: results.completionDate,
          completionDate: results.completionDate,
          status: 'completed' as const,
          totalParticipants: results.participantProgress.length,
          completedParticipants: results.participantProgress.filter(p => p.status === 'completed').length,
          overallConsistencyRatio: results.consistencyRatio,
          groupConsensusLevel: results.groupConsensus
        },
        hierarchy: {
          id: 'goal',
          name: results.projectTitle,
          type: 'goal' as const,
          level: 0,
          children: results.criteriaWeights.map((cw, index) => ({
            id: `criterion_${index}`,
            name: cw.criterion,
            type: 'criterion' as const,
            weight: cw.weight,
            level: 1
          }))
        },
        criteriaWeights: results.criteriaWeights.map((cw, index) => ({
          criterionId: `criterion_${index}`,
          criterionName: cw.criterion,
          weight: cw.weight,
          normalizedWeight: cw.weight,
          level: 1,
          consistencyRatio: results.consistencyRatio
        })),
        alternatives: results.rankingResults.map((rr, index) => ({
          id: `alternative_${index}`,
          name: rr.alternative,
          description: `대안 ${index + 1}: ${rr.alternative}`,
          idealScore: rr.idealScore,
          distributiveScore: rr.distributiveScore,
          criteriaScores: results.criteriaWeights.reduce((acc, cw, cwIndex) => {
            acc[`criterion_${cwIndex}`] = Math.random() * 0.5 + 0.25; // 임시 데이터
            return acc;
          }, {} as { [key: string]: number })
        })),
        participants: results.participantProgress.map((pp, index) => ({
          participantId: pp.participantId,
          name: pp.name,
          email: `${pp.name.toLowerCase()}@example.com`,
          role: 'evaluator',
          completionDate: pp.status === 'completed' ? results.completionDate : undefined,
          overallConsistencyRatio: pp.consistencyScore,
          completionRate: pp.completionRate,
          evaluationTime: Math.floor(Math.random() * 60 + 30), // 30-90분 랜덤
          individualRanking: results.rankingResults.map((rr, rrIndex) => ({
            alternativeId: `alternative_${rrIndex}`,
            alternativeName: rr.alternative,
            score: rr.idealScore + (Math.random() - 0.5) * 0.1,
            normalizedScore: rr.idealScore,
            rank: rrIndex + 1
          })),
          criteriaWeights: results.criteriaWeights.map((cw, cwIndex) => ({
            criterionId: `criterion_${cwIndex}`,
            criterionName: cw.criterion,
            weight: cw.weight + (Math.random() - 0.5) * 0.1,
            normalizedWeight: cw.weight,
            level: 1,
            consistencyRatio: pp.consistencyScore
          })),
          pairwiseComparisons: []
        })),
        rankingResults: {
          ideal: results.rankingResults.map((rr, index) => ({
            alternativeId: `alternative_${index}`,
            alternativeName: rr.alternative,
            score: rr.idealScore,
            normalizedScore: rr.idealScore,
            rank: rr.idealRank
          })),
          distributive: results.rankingResults.map((rr, index) => ({
            alternativeId: `alternative_${index}`,
            alternativeName: rr.alternative,
            score: rr.distributiveScore,
            normalizedScore: rr.distributiveScore,
            rank: rr.distributiveRank
          })),
          combined: results.rankingResults.map((rr, index) => ({
            alternativeId: `alternative_${index}`,
            alternativeName: rr.alternative,
            score: evaluationMode === 'ideal' ? rr.idealScore : rr.distributiveScore,
            normalizedScore: evaluationMode === 'ideal' ? rr.idealScore : rr.distributiveScore,
            rank: rr.rank
          }))
        },
        sensitivityAnalysis: results.sensitivityData.map(sd => ({
          criterionId: `criterion_${results.criteriaWeights.findIndex(cw => cw.criterion === sd.criterion)}`,
          criterionName: sd.criterion,
          originalWeight: sd.originalWeight,
          weightVariations: sd.variations.map(v => ({
            change: v.weightChange,
            newWeight: sd.originalWeight + v.weightChange,
            rankingChanges: Object.entries(v.alternativeScores).map(([altName, score], altIndex) => ({
              alternativeId: `alternative_${results.rankingResults.findIndex(rr => rr.alternative === altName)}`,
              alternativeName: altName,
              originalRank: results.rankingResults.findIndex(rr => rr.alternative === altName) + 1,
              newRank: altIndex + 1,
              rankChange: v.rankChanges[altName] || 0,
              scoreChange: score - (results.rankingResults.find(rr => rr.alternative === altName)?.idealScore || 0)
            })),
            stabilityMeasure: Math.random() * 0.5 + 0.5
          })),
          overallSensitivity: Math.abs(sd.variations[0]?.weightChange || 0) > 0.1 ? 'high' as const : 'medium' as const,
          criticalThreshold: Math.random() * 0.15 + 0.05
        })),
        pairwiseMatrices: [],
        groupAnalysis: {
          consensusLevel: results.groupConsensus,
          agreementMatrix: results.participantProgress.map(() => 
            results.participantProgress.map(() => Math.random() * 0.4 + 0.6)
          ),
          outlierParticipants: results.participantProgress
            .filter(pp => pp.consistencyScore > 0.15)
            .map(pp => pp.participantId),
          convergenceAnalysis: {
            iterations: Math.floor(Math.random() * 5) + 3,
            finalDeviation: Math.random() * 0.05 + 0.01,
            convergenceRate: Math.random() * 0.3 + 0.7
          },
          kendallTau: Math.random() * 0.4 + 0.5,
          spearmanRho: Math.random() * 0.4 + 0.5
        }
      };

      // Excel 리포트 생성
      const exporter = new AHPExcelExporter(ahpData);
      await exporter.generateCompleteReport();
      
      console.log('포괄적인 Excel 리포트가 성공적으로 생성되었습니다.');
      
    } catch (error) {
      console.error('Excel 내보내기 중 오류 발생:', error);
      
      // 오류 발생 시 기본 CSV 내보내기로 폴백
      const csvContent = "data:text/csv;charset=utf-8," 
        + "프로젝트명," + results.projectTitle + "\n"
        + "평가모드," + (evaluationMode === 'ideal' ? 'Ideal' : 'Distributive') + "\n"
        + "완료일," + new Date(results.completionDate).toLocaleDateString('ko-KR') + "\n"
        + "일관성 비율," + results.consistencyRatio + "\n\n"
        + "순위,대안,점수\n"
        + results.rankingResults.map(r => 
            `${r.rank},${r.alternative},${(evaluationMode === 'ideal' ? r.idealScore : r.distributiveScore) * 100}`
          ).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `AHP_평가결과_${results.projectTitle}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 평가 모드 전환 */}
      <Card title="평가 모드">
        <div className="flex items-center space-x-4">
          <Button
            variant={evaluationMode === 'ideal' ? 'primary' : 'secondary'}
            onClick={() => setEvaluationMode('ideal')}
          >
            Ideal 모드
          </Button>
          <Button
            variant={evaluationMode === 'distributive' ? 'primary' : 'secondary'}
            onClick={() => setEvaluationMode('distributive')}
          >
            Distributive 모드
          </Button>
          <div className="text-sm text-gray-600">
            {evaluationMode === 'ideal' 
              ? 'Ideal 모드: 이상적인 대안과 비교하여 평가' 
              : 'Distributive 모드: 대안들 간의 상대적 비교로 평가'
            }
          </div>
        </div>
      </Card>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="전체 일관성">
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              results && results.consistencyRatio <= 0.1 ? 'text-green-600' : 'text-red-600'
            }`}>
              {results ? results.consistencyRatio.toFixed(3) : '0.000'}
            </div>
            <div className="text-sm text-gray-600">CR</div>
          </div>
        </Card>
        
        <Card title="그룹 합의도">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {results ? (results.groupConsensus * 100).toFixed(1) : '0'}%
            </div>
            <div className="text-sm text-gray-600">Consensus</div>
          </div>
        </Card>
        
        <Card title="참여율">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {results ? 
                Math.round(results.participantProgress.filter(p => p.status === 'completed').length / 
                         results.participantProgress.length * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">완료</div>
          </div>
        </Card>
        
        <Card title="평가 완료">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {results ? results.participantProgress.filter(p => p.status === 'completed').length : 0}
            </div>
            <div className="text-sm text-gray-600">
              / {results ? results.participantProgress.length : 0} 명
            </div>
          </div>
        </Card>
      </div>

      {/* 최종 순위 */}
      <Card title={`최종 순위 (${evaluationMode === 'ideal' ? 'Ideal' : 'Distributive'} 모드)`}>
        <div className="space-y-3">
          {results?.rankingResults.map((result, index) => {
            const score = evaluationMode === 'ideal' ? result.idealScore : result.distributiveScore;
            const rank = evaluationMode === 'ideal' ? result.idealRank : result.distributiveRank;
            
            return (
              <div key={result.alternative} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    rank === 1 ? 'bg-yellow-500' :
                    rank === 2 ? 'bg-gray-400' :
                    rank === 3 ? 'bg-orange-600' : 'bg-gray-600'
                  }`}>
                    {rank}
                  </div>
                  <span className="font-medium">{result.alternative}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${score * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {(score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderDetailedAnalysis = () => (
    <div className="space-y-6">
      {/* 차트 선택 탭 */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {[
          { id: 'hierarchy', name: '계층구조', icon: '🌳' },
          { id: 'ranking', name: '순위 차트', icon: '📊' },
          { id: 'consensus', name: '합의도 분석', icon: '🤝' },
          { id: 'sensitivity', name: '민감도 분석', icon: '📈' },
          { id: 'weight_distribution', name: '가중치 분포', icon: '🥧' },
          { id: 'ranking_stability', name: '순위 안정성', icon: '📉' },
          { id: 'participant_agreement', name: '참가자 일치도', icon: '👥' },
          { id: 'criteria_matrix', name: '기준 매트릭스', icon: '🔢' }
        ].map(chart => (
          <button
            key={chart.id}
            onClick={() => setSelectedChart(chart.id as any)}
            className={`py-2 px-3 border-b-2 font-medium text-xs flex items-center space-x-1 ${
              selectedChart === chart.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{chart.icon}</span>
            <span>{chart.name}</span>
          </button>
        ))}
      </div>

      {/* 차트 영역 */}
      <Card title="상세 분석">
        <div className="h-96">
          {selectedChart === 'hierarchy' && <div id="hierarchy-chart" className="w-full h-full"></div>}
          {selectedChart === 'ranking' && <div id="ranking-chart" className="w-full h-full"></div>}
          {selectedChart === 'consensus' && <div id="consensus-chart" className="w-full h-full"></div>}
          {selectedChart === 'sensitivity' && <div id="sensitivity-chart" className="w-full h-full"></div>}
          {selectedChart === 'weight_distribution' && <div id="weight-distribution-chart" className="w-full h-full"></div>}
          {selectedChart === 'ranking_stability' && <div id="ranking-stability-chart" className="w-full h-full"></div>}
          {selectedChart === 'participant_agreement' && <div id="participant-agreement-chart" className="w-full h-full"></div>}
          {selectedChart === 'criteria_matrix' && <div id="criteria-matrix-chart" className="w-full h-full"></div>}
        </div>
      </Card>
    </div>
  );

  const renderProgressMonitoring = () => (
    <div className="space-y-6">
      <Card title="실시간 참가자 현황">
        <div className="space-y-4">
          {results?.participantProgress.map(participant => (
            <div key={participant.participantId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {participant.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{participant.name}</h4>
                    <p className="text-sm text-gray-600">
                      마지막 활동: {new Date(participant.lastActivity).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  participant.status === 'completed' ? 'bg-green-100 text-green-800' :
                  participant.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  participant.status === 'overdue' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {participant.status === 'completed' ? '완료' :
                   participant.status === 'in_progress' ? '진행중' :
                   participant.status === 'overdue' ? '지연' : '미시작'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>진행률</span>
                    <span>{participant.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${participant.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>일관성 점수</span>
                    <span className={participant.consistencyScore <= 0.1 ? 'text-green-600' : 'text-red-600'}>
                      CR: {participant.consistencyScore.toFixed(3)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        participant.consistencyScore <= 0.1 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((1 - participant.consistencyScore) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{results?.projectTitle}</h1>
          <p className="text-gray-600">
            평가 완료일: {results ? new Date(results.completionDate).toLocaleDateString('ko-KR') : ''}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => window.print()}>
            인쇄
          </Button>
          <Button variant="primary" onClick={exportToExcel}>
            Excel 내보내기
          </Button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: '개요', icon: '📋' },
            { id: 'detailed', name: '상세 분석', icon: '📊' },
            { id: 'sensitivity', name: '민감도 분석', icon: '📈' },
            { id: 'progress', name: '진행 현황', icon: '👥' },
            { id: 'export', name: '내보내기', icon: '💾' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'detailed' && renderDetailedAnalysis()}
      {activeTab === 'progress' && renderProgressMonitoring()}
      {activeTab === 'sensitivity' && (
        <Card title="민감도 분석">
          <div className="text-center py-8">
            <div className="text-gray-600 mb-4">
              가중치 변화에 따른 순위 변동을 분석합니다
            </div>
            <Button variant="primary">민감도 분석 실행</Button>
          </div>
        </Card>
      )}
      {activeTab === 'export' && (
        <Card title="데이터 내보내기">
          <div className="space-y-4">
            <div className="text-gray-600 mb-4">
              평가 결과를 다양한 형식으로 내보내기할 수 있습니다
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="primary" onClick={exportToExcel}>
                📊 Excel 파일
              </Button>
              <Button variant="secondary">
                📄 PDF 보고서
              </Button>
              <Button variant="secondary">
                📈 PowerPoint
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default EnhancedResultsDashboard;