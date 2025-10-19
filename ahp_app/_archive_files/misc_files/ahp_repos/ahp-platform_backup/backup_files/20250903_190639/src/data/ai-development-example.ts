// AI 개발 활용 방안 중요도 분석 예시 데이터
export interface AIDevelopmentCriteria {
  id: string;
  category: string;
  name: string;
  description: string;
  weight?: number;
}

export interface AIDevelopmentAlternative {
  id: string;
  name: string;
  company: string;
  description: string;
  features: string[];
  pricing: string;
  scores?: Record<string, number>;
}

// 평가 기준 예시 데이터
export const aiDevelopmentCriteria: AIDevelopmentCriteria[] = [
  {
    id: 'c1',
    category: '생산성',
    name: '코딩 작성 속도',
    description: 'AI 도구를 통한 코드 작성 속도 향상 정도',
    weight: 0.35
  },
  {
    id: 'c2',
    category: '생산성',
    name: '코드 자동 완성',
    description: '컨텍스트 기반 지능형 코드 자동 완성 기능',
    weight: 0.25
  },
  {
    id: 'c3',
    category: '품질',
    name: '코드 품질 개선',
    description: '버그 감소 및 베스트 프랙티스 적용 지원',
    weight: 0.20
  },
  {
    id: 'c4',
    category: '학습',
    name: '학습 지원',
    description: '새로운 기술 스택 학습 및 문서화 지원',
    weight: 0.10
  },
  {
    id: 'c5',
    category: '협업',
    name: '팀 협업 강화',
    description: '코드 리뷰 및 팀 표준화 지원',
    weight: 0.10
  }
];

// AI 개발 도구 대안 예시 데이터
export const aiDevelopmentAlternatives: AIDevelopmentAlternative[] = [
  {
    id: 'a1',
    name: 'Claude Code',
    company: 'Anthropic',
    description: '터미널 기반 AI 코딩 어시스턴트',
    features: [
      '파일 시스템 직접 접근',
      '코드 작성 및 수정',
      '프로젝트 전체 이해',
      '테스트 코드 생성',
      '문서화 자동화'
    ],
    pricing: '$20/월 (Pro)',
    scores: {
      c1: 0.387,
      c2: 0.352,
      c3: 0.425,
      c4: 0.390,
      c5: 0.368
    }
  },
  {
    id: 'a2',
    name: 'GitHub Copilot',
    company: 'GitHub/Microsoft',
    description: 'IDE 통합형 AI 페어 프로그래머',
    features: [
      'IDE 실시간 통합',
      '코드 자동 완성',
      '다중 언어 지원',
      '컨텍스트 인식',
      'Chat 기능'
    ],
    pricing: '$10/월 (Individual)',
    scores: {
      c1: 0.285,
      c2: 0.318,
      c3: 0.275,
      c4: 0.280,
      c5: 0.295
    }
  },
  {
    id: 'a3',
    name: 'Cursor AI',
    company: 'Cursor',
    description: 'AI 중심 코드 에디터',
    features: [
      'AI 우선 에디터',
      '코드베이스 이해',
      'Chat & Edit 모드',
      '멀티파일 편집',
      'AI 명령어'
    ],
    pricing: '$20/월 (Pro)',
    scores: {
      c1: 0.198,
      c2: 0.205,
      c3: 0.185,
      c4: 0.195,
      c5: 0.202
    }
  },
  {
    id: 'a4',
    name: 'Tabnine',
    company: 'Tabnine',
    description: '로컬 AI 코드 완성 도구',
    features: [
      '로컬 모델 실행',
      '보안 중심',
      '팀 학습 모델',
      '다중 IDE 지원',
      '커스텀 모델'
    ],
    pricing: '$12/월 (Pro)',
    scores: {
      c1: 0.130,
      c2: 0.125,
      c3: 0.115,
      c4: 0.135,
      c5: 0.135
    }
  }
];

// CSV 형식 변환 함수
export const exportToCSV = () => {
  // 평가 기준 CSV
  const criteriaCSV = [
    ['ID', '카테고리', '평가기준', '설명', '가중치'],
    ...aiDevelopmentCriteria.map(c => [
      c.id,
      c.category,
      c.name,
      c.description,
      c.weight?.toString() || ''
    ])
  ];

  // 대안 CSV
  const alternativesCSV = [
    ['ID', '도구명', '회사', '설명', '주요기능', '가격'],
    ...aiDevelopmentAlternatives.map(a => [
      a.id,
      a.name,
      a.company,
      a.description,
      a.features.join('; '),
      a.pricing
    ])
  ];

  // 평가 점수 매트릭스 CSV
  const scoresCSV = [
    ['도구/기준', ...aiDevelopmentCriteria.map(c => c.name)],
    ...aiDevelopmentAlternatives.map(a => [
      a.name,
      ...aiDevelopmentCriteria.map(c => a.scores?.[c.id]?.toString() || '0')
    ])
  ];

  return {
    criteria: criteriaCSV,
    alternatives: alternativesCSV,
    scores: scoresCSV
  };
};

// 쌍대비교 매트릭스 예시
export const pairwiseComparisonExample = {
  criteria: [
    [1, 3, 5, 7, 7],     // 코딩 작성 속도
    [1/3, 1, 3, 5, 5],   // 코드 자동 완성
    [1/5, 1/3, 1, 3, 3], // 코드 품질 개선
    [1/7, 1/5, 1/3, 1, 1], // 학습 지원
    [1/7, 1/5, 1/3, 1, 1]  // 팀 협업 강화
  ],
  alternatives: {
    c1: [ // 코딩 작성 속도 기준
      [1, 3, 5, 7],
      [1/3, 1, 3, 5],
      [1/5, 1/3, 1, 3],
      [1/7, 1/5, 1/3, 1]
    ],
    c2: [ // 코드 자동 완성 기준
      [1, 2, 4, 6],
      [1/2, 1, 3, 5],
      [1/4, 1/3, 1, 3],
      [1/6, 1/5, 1/3, 1]
    ]
    // ... 다른 기준들
  }
};

// AHP 분석 결과 예시
export const ahpAnalysisResult = {
  consistencyRatio: 0.058,
  criteriaWeights: {
    c1: 0.35,
    c2: 0.25,
    c3: 0.20,
    c4: 0.10,
    c5: 0.10
  },
  finalScores: [
    { name: 'Claude Code', score: 0.387, rank: 1 },
    { name: 'GitHub Copilot', score: 0.285, rank: 2 },
    { name: 'Cursor AI', score: 0.198, rank: 3 },
    { name: 'Tabnine', score: 0.130, rank: 4 }
  ],
  sensitivityAnalysis: {
    c1: { // 코딩 작성 속도 가중치 변화
      '0.2': ['Claude Code', 'GitHub Copilot', 'Cursor AI', 'Tabnine'],
      '0.3': ['Claude Code', 'GitHub Copilot', 'Cursor AI', 'Tabnine'],
      '0.4': ['Claude Code', 'GitHub Copilot', 'Cursor AI', 'Tabnine'],
      '0.5': ['Claude Code', 'GitHub Copilot', 'Cursor AI', 'Tabnine']
    }
  }
};