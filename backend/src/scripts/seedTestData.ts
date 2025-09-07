/**
 * 테스트 데모 데이터 시더 스크립트
 * K5/SM5/소나타 차량 선택 AHP 시나리오 데이터 생성
 */

import { query } from '../database/connection';

interface TestDataSet {
  project: any;
  criteria: any[];
  alternatives: any[];
  evaluators: any[];
  pairwiseData: any;
  directInputData: any;
}

const TEST_DATA: TestDataSet = {
  project: {
    title: '중형 세단 구매 의사결정',
    description: '성능, 디자인, 가격을 고려한 중형 세단 선택',
    objective: '가족용 중형 세단 중에서 종합적으로 가장 적합한 차량을 선택한다',
    status: 'active'
  },

  criteria: [
    // 1레벨 기준들
    {
      name: '성능',
      description: '엔진 성능, 연비, 주행 성능 등',
      parent_id: null,
      level: 1,
      order_index: 1,
      eval_method: 'pairwise'
    },
    {
      name: '디자인',
      description: '외관 및 내부 디자인의 만족도',
      parent_id: null,
      level: 1,
      order_index: 2,
      eval_method: 'pairwise'
    },
    {
      name: '가격',
      description: '구매 가격 및 유지비용',
      parent_id: null,
      level: 1,
      order_index: 3,
      eval_method: 'direct'
    },
    // 2레벨 기준들 (디자인 하위)
    {
      name: '실내 디자인',
      description: '대시보드, 시트, 내부 공간 디자인',
      level: 2,
      order_index: 1,
      eval_method: 'pairwise'
    },
    {
      name: '실외 디자인',
      description: '외관, 휠, 전체적인 스타일링',
      level: 2,
      order_index: 2,
      eval_method: 'pairwise'
    }
  ],

  alternatives: [
    {
      name: 'K5',
      description: '기아 K5 - 스포티한 디자인과 우수한 성능',
      order_index: 1
    },
    {
      name: 'SM5',
      description: '르노삼성 SM5 - 편안한 승차감과 실용성',
      order_index: 2
    },
    {
      name: '소나타',
      description: '현대 소나타 - 균형잡힌 성능과 브랜드 신뢰성',
      order_index: 3
    }
  ],

  evaluators: [
    {
      code: 'P001',
      name: '김평가',
      email: 'p001@test.com',
      weight: 0.7,
      access_key: 'P001-TEST1234'
    },
    {
      code: 'P002',
      name: '박평가',
      email: 'p002@test.com',
      weight: 0.3,
      access_key: 'P002-TEST1234'
    }
  ],

  // CR > 0.1을 만들기 위한 비일관성 쌍대비교 데이터
  pairwiseData: {
    'C:root': [
      { i: 0, j: 1, value: 3 },   // 성능 > 디자인 (3배)
      { i: 0, j: 2, value: 2 },   // 성능 > 가격 (2배)  
      { i: 1, j: 2, value: 5 }    // 디자인 > 가격 (5배) - 비일관적!
    ],
    'C:C2': [
      { i: 0, j: 1, value: 2 }    // 실내 > 실외 (2배)
    ],
    'A:C1': [
      { i: 0, j: 1, value: 2 },   // K5 > SM5 (성능)
      { i: 0, j: 2, value: 1.5 }, // K5 > 소나타 (성능)
      { i: 1, j: 2, value: 0.5 }  // SM5 < 소나타 (성능)
    ],
    'A:C2-1': [
      { i: 0, j: 1, value: 1.5 }, // K5 > SM5 (실내)
      { i: 0, j: 2, value: 0.8 }, // K5 < 소나타 (실내)
      { i: 1, j: 2, value: 0.6 }  // SM5 < 소나타 (실내)
    ],
    'A:C2-2': [
      { i: 0, j: 1, value: 3 },   // K5 > SM5 (실외)
      { i: 0, j: 2, value: 2 },   // K5 > 소나타 (실외)
      { i: 1, j: 2, value: 0.7 }  // SM5 < 소나타 (실외)
    ]
  },

  // 직접입력 테스트 데이터 (가격 - 비용형)
  directInputData: [
    { alternativeIndex: 0, criterionName: '가격', value: 3000, is_benefit: false }, // K5: 3000만원
    { alternativeIndex: 1, criterionName: '가격', value: 2500, is_benefit: false }, // SM5: 2500만원  
    { alternativeIndex: 2, criterionName: '가격', value: 2800, is_benefit: false }  // 소나타: 2800만원
  ]
};

export async function seedTestData(adminUserId: number): Promise<void> {
  console.log('🌱 Starting test data seeding...');
  
  try {
    // 1. 프로젝트 생성
    console.log('📊 Creating test project...');
    const projectResult = await query(
      `INSERT INTO projects (title, description, objective, status, created_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        TEST_DATA.project.title,
        TEST_DATA.project.description,
        TEST_DATA.project.objective,
        TEST_DATA.project.status,
        adminUserId
      ]
    );
    const projectId = projectResult.rows[0].id;
    console.log(`✅ Project created with ID: ${projectId}`);

    // 2. 기준 생성
    console.log('🎯 Creating criteria...');
    const criteriaIds: any = {};
    
    // 1레벨 기준 생성
    for (const criterion of TEST_DATA.criteria.filter(c => c.level === 1)) {
      const result = await query(
        `INSERT INTO criteria (name, description, parent_id, level, order_index, project_id, eval_method) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          criterion.name,
          criterion.description,
          criterion.parent_id,
          criterion.level,
          criterion.order_index,
          projectId,
          criterion.eval_method
        ]
      );
      criteriaIds[criterion.name] = result.rows[0].id;
      console.log(`  ✅ ${criterion.name}: ID ${result.rows[0].id}`);
    }

    // 2레벨 기준 생성 (디자인 하위)
    for (const criterion of TEST_DATA.criteria.filter(c => c.level === 2)) {
      const result = await query(
        `INSERT INTO criteria (name, description, parent_id, level, order_index, project_id, eval_method) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          criterion.name,
          criterion.description,
          criteriaIds['디자인'], // 부모 ID
          criterion.level,
          criterion.order_index,
          projectId,
          criterion.eval_method
        ]
      );
      criteriaIds[criterion.name] = result.rows[0].id;
      console.log(`  ✅ ${criterion.name}: ID ${result.rows[0].id}`);
    }

    // 3. 대안 생성
    console.log('🚗 Creating alternatives...');
    const alternativeIds: any = {};
    for (const alternative of TEST_DATA.alternatives) {
      const result = await query(
        `INSERT INTO alternatives (name, description, order_index, project_id) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          alternative.name,
          alternative.description,
          alternative.order_index,
          projectId
        ]
      );
      alternativeIds[alternative.name] = result.rows[0].id;
      console.log(`  ✅ ${alternative.name}: ID ${result.rows[0].id}`);
    }

    // 4. 평가자 생성
    console.log('👥 Creating evaluators...');
    const evaluatorIds: any = {};
    
    for (const evaluator of TEST_DATA.evaluators) {
      // 사용자 계정 생성
      const userResult = await query(
        `INSERT INTO users (email, name, role, password_hash) 
         VALUES ($1, $2, 'evaluator', '$2b$10$dummy_hash') RETURNING id`,
        [evaluator.email, evaluator.name]
      );
      const userId = userResult.rows[0].id;
      evaluatorIds[evaluator.code] = userId;

      // 프로젝트 평가자로 추가
      await query(
        `INSERT INTO project_evaluators (project_id, evaluator_id, evaluator_code, access_key) 
         VALUES ($1, $2, $3, $4)`,
        [projectId, userId, evaluator.code, evaluator.access_key]
      );

      // 평가자 가중치 설정
      await query(
        `INSERT INTO evaluator_weights (project_id, evaluator_id, weight) 
         VALUES ($1, $2, $3)`,
        [projectId, userId, evaluator.weight]
      );

      console.log(`  ✅ ${evaluator.name} (${evaluator.code}): ID ${userId}`);
    }

    // 5. 쌍대비교 데이터 생성 (P001 평가자용)
    console.log('⚖️  Creating pairwise comparison data...');
    const evaluatorId = evaluatorIds['P001'];
    
    // 기준 간 비교 (성능 vs 디자인 vs 가격)
    const rootCriteria = [criteriaIds['성능'], criteriaIds['디자인'], criteriaIds['가격']];
    for (const comparison of TEST_DATA.pairwiseData['C:root']) {
      await query(
        `INSERT INTO pairwise_comparisons 
         (project_id, evaluator_id, element1_id, element2_id, comparison_value, matrix_key, element_type) 
         VALUES ($1, $2, $3, $4, $5, $6, 'criteria')`,
        [
          projectId,
          evaluatorId,
          rootCriteria[comparison.i],
          rootCriteria[comparison.j],
          comparison.value,
          'C:root'
        ]
      );
    }

    // 디자인 하위기준 비교 (실내 vs 실외)
    const designSubCriteria = [criteriaIds['실내 디자인'], criteriaIds['실외 디자인']];
    for (const comparison of TEST_DATA.pairwiseData['C:C2']) {
      await query(
        `INSERT INTO pairwise_comparisons 
         (project_id, evaluator_id, element1_id, element2_id, comparison_value, matrix_key, element_type) 
         VALUES ($1, $2, $3, $4, $5, $6, 'criteria')`,
        [
          projectId,
          evaluatorId,
          designSubCriteria[comparison.i],
          designSubCriteria[comparison.j],
          comparison.value,
          `C:${criteriaIds['디자인']}`
        ]
      );
    }

    // 대안 간 비교들
    const alternatives = [alternativeIds['K5'], alternativeIds['SM5'], alternativeIds['소나타']];
    
    // 성능 기준에서 대안 비교
    for (const comparison of TEST_DATA.pairwiseData['A:C1']) {
      await query(
        `INSERT INTO pairwise_comparisons 
         (project_id, evaluator_id, element1_id, element2_id, comparison_value, matrix_key, element_type) 
         VALUES ($1, $2, $3, $4, $5, $6, 'alternatives')`,
        [
          projectId,
          evaluatorId,
          alternatives[comparison.i],
          alternatives[comparison.j],
          comparison.value,
          `A:${criteriaIds['성능']}`
        ]
      );
    }

    // 실내 디자인에서 대안 비교
    for (const comparison of TEST_DATA.pairwiseData['A:C2-1']) {
      await query(
        `INSERT INTO pairwise_comparisons 
         (project_id, evaluator_id, element1_id, element2_id, comparison_value, matrix_key, element_type) 
         VALUES ($1, $2, $3, $4, $5, $6, 'alternatives')`,
        [
          projectId,
          evaluatorId,
          alternatives[comparison.i],
          alternatives[comparison.j],
          comparison.value,
          `A:${criteriaIds['실내 디자인']}`
        ]
      );
    }

    // 실외 디자인에서 대안 비교
    for (const comparison of TEST_DATA.pairwiseData['A:C2-2']) {
      await query(
        `INSERT INTO pairwise_comparisons 
         (project_id, evaluator_id, element1_id, element2_id, comparison_value, matrix_key, element_type) 
         VALUES ($1, $2, $3, $4, $5, $6, 'alternatives')`,
        [
          projectId,
          evaluatorId,
          alternatives[comparison.i],
          alternatives[comparison.j],
          comparison.value,
          `A:${criteriaIds['실외 디자인']}`
        ]
      );
    }

    console.log('  ✅ Pairwise comparisons created');

    // 6. 직접입력 데이터 생성 (가격 기준)
    console.log('💰 Creating direct input data...');
    for (const directInput of TEST_DATA.directInputData) {
      const alternativeName = TEST_DATA.alternatives[directInput.alternativeIndex].name;
      const alternativeId = alternativeIds[alternativeName];
      const criterionId = criteriaIds[directInput.criterionName];
      
      await query(
        `INSERT INTO direct_entries (project_id, evaluator_id, target_key, value, is_benefit) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          projectId,
          evaluatorId,
          `alternative:${alternativeId}@criterion:${criterionId}`,
          directInput.value,
          directInput.is_benefit
        ]
      );
    }
    console.log('  ✅ Direct input data created');

    // 7. 평가자 진행상황 초기화
    console.log('📈 Initializing evaluator progress...');
    for (const evaluatorCode of Object.keys(evaluatorIds)) {
      await query(
        `INSERT INTO evaluator_progress 
         (project_id, evaluator_id, completion_rate, is_completed, total_tasks, completed_tasks) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          projectId,
          evaluatorIds[evaluatorCode],
          evaluatorCode === 'P001' ? 80.0 : 0.0, // P001은 80% 완료
          evaluatorCode === 'P001' ? true : false,
          10, // 총 10개 작업
          evaluatorCode === 'P001' ? 8 : 0 // P001은 8개 완료
        ]
      );
    }
    console.log('  ✅ Progress tracking initialized');

    console.log(`\n🎉 Test data seeding completed successfully!`);
    console.log(`📝 Summary:`);
    console.log(`   - Project ID: ${projectId}`);
    console.log(`   - Criteria: ${Object.keys(criteriaIds).length}`);
    console.log(`   - Alternatives: ${Object.keys(alternativeIds).length}`);
    console.log(`   - Evaluators: ${Object.keys(evaluatorIds).length}`);
    console.log(`   - Access Keys: P001-TEST1234, P002-TEST1234`);
    console.log(`   - Test Features: CR>0.1, Cost-type direct input, Group evaluation`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

// CLI 실행을 위한 스크립트
if (require.main === module) {
  const adminUserId = process.argv[2] ? parseInt(process.argv[2]) : 1;
  
  seedTestData(adminUserId)
    .then(() => {
      console.log('✅ Seeding completed. You can now test with:');
      console.log('   - Admin login to see the project');
      console.log('   - Evaluator access with keys: P001-TEST1234, P002-TEST1234');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export default seedTestData;