/**
 * 테스트 시나리오용 데모 데이터
 * 기준: 성능/디자인/가격, 디자인 하위: 실내/실외
 * 대안: K5/SM5/소나타
 */

export const TEST_PROJECT = {
  id: 'test-project-cars',
  title: '중형 세단 구매 의사결정',
  description: '성능, 디자인, 가격을 고려한 중형 세단 선택',
  objective: '가족용 중형 세단 중에서 종합적으로 가장 적합한 차량을 선택한다',
  created_by: 'admin',
  status: 'active'
};

export const TEST_CRITERIA = [
  // 1레벨 기준들
  {
    id: 'C1',
    name: '성능',
    description: '엔진 성능, 연비, 주행 성능 등',
    parent_id: null,
    level: 1,
    order_index: 1,
    project_id: 'test-project-cars',
    eval_method: 'pairwise'
  },
  {
    id: 'C2', 
    name: '디자인',
    description: '외관 및 내부 디자인의 만족도',
    parent_id: null,
    level: 1,
    order_index: 2,
    project_id: 'test-project-cars',
    eval_method: 'pairwise'
  },
  {
    id: 'C3',
    name: '가격',
    description: '구매 가격 및 유지비용',
    parent_id: null,
    level: 1,
    order_index: 3,
    project_id: 'test-project-cars',
    eval_method: 'direct' // 가격은 직접입력으로 설정
  },
  
  // 2레벨 기준들 (디자인 하위)
  {
    id: 'C2-1',
    name: '실내 디자인',
    description: '대시보드, 시트, 내부 공간 디자인',
    parent_id: 'C2',
    level: 2,
    order_index: 1,
    project_id: 'test-project-cars',
    eval_method: 'pairwise'
  },
  {
    id: 'C2-2',
    name: '실외 디자인', 
    description: '외관, 휠, 전체적인 스타일링',
    parent_id: 'C2',
    level: 2,
    order_index: 2,
    project_id: 'test-project-cars',
    eval_method: 'pairwise'
  }
];

export const TEST_ALTERNATIVES = [
  {
    id: 'A1',
    name: 'K5',
    description: '기아 K5 - 스포티한 디자인과 우수한 성능',
    order_index: 1,
    project_id: 'test-project-cars'
  },
  {
    id: 'A2', 
    name: 'SM5',
    description: '르노삼성 SM5 - 편안한 승차감과 실용성',
    order_index: 2,
    project_id: 'test-project-cars'
  },
  {
    id: 'A3',
    name: '소나타',
    description: '현대 소나타 - 균형잡힌 성능과 브랜드 신뢰성',
    order_index: 3,
    project_id: 'test-project-cars'
  }
];

// 테스트용 평가자 데이터
export const TEST_EVALUATORS = [
  {
    id: 'eval-001',
    code: 'P001',
    name: '김평가',
    email: 'p001@test.com',
    weight: 0.7,
    access_key: 'P001-TEST1234',
    project_id: 'test-project-cars'
  },
  {
    id: 'eval-002', 
    code: 'P002',
    name: '박평가',
    email: 'p002@test.com', 
    weight: 0.3,
    access_key: 'P002-TEST1234',
    project_id: 'test-project-cars'
  }
];

// CR > 0.1을 만들기 위한 비일관성 쌍대비교 데이터
export const INCONSISTENT_PAIRWISE_DATA = {
  // 기준 간 비교 (성능 vs 디자인 vs 가격) - 의도적으로 비일관적
  'C:root': [
    { i: 0, j: 1, value: 3 },   // 성능 > 디자인 (3배)
    { i: 0, j: 2, value: 2 },   // 성능 > 가격 (2배)  
    { i: 1, j: 2, value: 5 }    // 디자인 > 가격 (5배) - 비일관적! 3*5=15 ≠ 2
  ],
  
  // 디자인 하위기준 비교 (실내 vs 실외)
  'C:C2': [
    { i: 0, j: 1, value: 2 }    // 실내 > 실외 (2배)
  ],
  
  // 성능 기준에서 대안 비교
  'A:C1': [
    { i: 0, j: 1, value: 2 },   // K5 > SM5 (성능)
    { i: 0, j: 2, value: 1.5 }, // K5 > 소나타 (성능)
    { i: 1, j: 2, value: 0.5 }  // SM5 < 소나타 (성능)
  ],
  
  // 실내 디자인에서 대안 비교
  'A:C2-1': [
    { i: 0, j: 1, value: 1.5 }, // K5 > SM5 (실내)
    { i: 0, j: 2, value: 0.8 }, // K5 < 소나타 (실내)
    { i: 1, j: 2, value: 0.6 }  // SM5 < 소나타 (실내)
  ],
  
  // 실외 디자인에서 대안 비교  
  'A:C2-2': [
    { i: 0, j: 1, value: 3 },   // K5 > SM5 (실외)
    { i: 0, j: 2, value: 2 },   // K5 > 소나타 (실외)
    { i: 1, j: 2, value: 0.7 }  // SM5 < 소나타 (실외)
  ]
};

// 일관성 있는 쌍대비교 데이터 (비교용)
export const CONSISTENT_PAIRWISE_DATA = {
  'C:root': [
    { i: 0, j: 1, value: 2 },   // 성능 > 디자인 (2배)
    { i: 0, j: 2, value: 3 },   // 성능 > 가격 (3배)
    { i: 1, j: 2, value: 1.5 }  // 디자인 > 가격 (1.5배) - 일관적: 2*1.5=3
  ],
  'C:C2': [
    { i: 0, j: 1, value: 1.5 }  // 실내 > 실외 (1.5배)
  ],
  'A:C1': [
    { i: 0, j: 1, value: 2 },   // K5 > SM5
    { i: 0, j: 2, value: 1.5 }, // K5 > 소나타
    { i: 1, j: 2, value: 0.75 } // SM5 < 소나타 (일관적: 2*0.75=1.5)
  ],
  'A:C2-1': [
    { i: 0, j: 1, value: 1.2 },
    { i: 0, j: 2, value: 0.8 },
    { i: 1, j: 2, value: 0.67 } // 일관적
  ],
  'A:C2-2': [
    { i: 0, j: 1, value: 2.5 },
    { i: 0, j: 2, value: 2 },
    { i: 1, j: 2, value: 0.8 }  // 일관적
  ]
};

// 직접입력 테스트 데이터 (가격 - 비용형)
export const DIRECT_INPUT_DATA = {
  'alternative:A1@criterion:C3': { value: 3000, is_benefit: false }, // K5: 3000만원
  'alternative:A2@criterion:C3': { value: 2500, is_benefit: false }, // SM5: 2500만원  
  'alternative:A3@criterion:C3': { value: 2800, is_benefit: false }  // 소나타: 2800만원
};

// 역수 토글 후 기대 결과 (비용형 → 편익형)
export const REVERSED_DIRECT_INPUT = {
  'alternative:A1@criterion:C3': { value: 3000, is_benefit: true },  // 높은 값이 좋음
  'alternative:A2@criterion:C3': { value: 2500, is_benefit: true },  
  'alternative:A3@criterion:C3': { value: 2800, is_benefit: true }
};

// 예산배분 테스트 데이터
export const BUDGET_TEST_DATA = {
  total_budget: 10000000, // 1억원
  items: [
    {
      alternativeId: 'A1',
      alternativeName: 'K5',
      cost: 3000000,    // 3000만원
      utility: 0.45,    // AHP 결과 가정
      efficiency: 0.45 / 3000000
    },
    {
      alternativeId: 'A2', 
      alternativeName: 'SM5',
      cost: 2500000,    // 2500만원
      utility: 0.30,    // AHP 결과 가정
      efficiency: 0.30 / 2500000
    },
    {
      alternativeId: 'A3',
      alternativeName: '소나타', 
      cost: 2800000,    // 2800만원
      utility: 0.25,    // AHP 결과 가정
      efficiency: 0.25 / 2800000
    }
  ]
};

// 민감도 분석 테스트 데이터
export const SENSITIVITY_TEST_DATA = {
  criteria_hierarchy: [
    {
      id: 'C1',
      name: '성능',
      level: 1,
      parentId: null,
      localWeight: 0.5,
      globalWeight: 0.5,
      children: []
    },
    {
      id: 'C2', 
      name: '디자인',
      level: 1,
      parentId: null,
      localWeight: 0.3,
      globalWeight: 0.3,
      children: [
        {
          id: 'C2-1',
          name: '실내 디자인',
          level: 2,
          parentId: 'C2',
          localWeight: 0.6,
          globalWeight: 0.18, // 0.3 * 0.6
          children: []
        },
        {
          id: 'C2-2',
          name: '실외 디자인',
          level: 2, 
          parentId: 'C2',
          localWeight: 0.4,
          globalWeight: 0.12, // 0.3 * 0.4
          children: []
        }
      ]
    },
    {
      id: 'C3',
      name: '가격', 
      level: 1,
      parentId: null,
      localWeight: 0.2,
      globalWeight: 0.2,
      children: []
    }
  ],
  alternative_scores: [
    {
      alternativeId: 'A1',
      alternativeName: 'K5',
      scoresByCriterion: {
        'C1': 0.45,   // 성능
        'C2-1': 0.35, // 실내
        'C2-2': 0.50, // 실외
        'C3': 0.25    // 가격
      },
      totalScore: 0.405, // 가중 합계
      rank: 1
    },
    {
      alternativeId: 'A2',
      alternativeName: 'SM5', 
      scoresByCriterion: {
        'C1': 0.25,
        'C2-1': 0.40, 
        'C2-2': 0.20,
        'C3': 0.45
      },
      totalScore: 0.315,
      rank: 2
    },
    {
      alternativeId: 'A3',
      alternativeName: '소나타',
      scoresByCriterion: {
        'C1': 0.30,
        'C2-1': 0.25,
        'C2-2': 0.30, 
        'C3': 0.30
      },
      totalScore: 0.285,
      rank: 3
    }
  ]
};

export const TEST_SCENARIOS = {
  // 시나리오 1: 기본 모델 작성
  scenario1_model_creation: {
    project: TEST_PROJECT,
    criteria: TEST_CRITERIA,
    alternatives: TEST_ALTERNATIVES
  },
  
  // 시나리오 2: 비일관성 평가 입력
  scenario2_inconsistent_evaluation: {
    pairwise_data: INCONSISTENT_PAIRWISE_DATA,
    expected_cr_over_threshold: true
  },
  
  // 시나리오 3: 직접입력 비용형
  scenario3_direct_cost_input: {
    original: DIRECT_INPUT_DATA,
    reversed: REVERSED_DIRECT_INPUT
  },
  
  // 시나리오 4: 그룹 평가
  scenario4_group_evaluation: {
    evaluators: TEST_EVALUATORS,
    group_weights: {
      'P001': 0.7,
      'P002': 0.3
    }
  },
  
  // 시나리오 5: 민감도 분석
  scenario5_sensitivity: SENSITIVITY_TEST_DATA,
  
  // 시나리오 6: 예산배분
  scenario6_budget_allocation: BUDGET_TEST_DATA
};

export default {
  TEST_PROJECT,
  TEST_CRITERIA, 
  TEST_ALTERNATIVES,
  TEST_EVALUATORS,
  TEST_SCENARIOS,
  INCONSISTENT_PAIRWISE_DATA,
  CONSISTENT_PAIRWISE_DATA,
  DIRECT_INPUT_DATA,
  BUDGET_TEST_DATA,
  SENSITIVITY_TEST_DATA
};