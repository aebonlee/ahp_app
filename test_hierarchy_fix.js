/**
 * 수정된 계층구조 변환 로직 테스트
 */

// 파싱된 기준 예제 (TextParser 결과와 동일한 구조)
const parsedCriteria = [
    { name: '기술 품질', description: undefined, level: 1 },
    { name: '성능', description: '시스템 처리 속도와 응답 시간', level: 2 },
    { name: '안정성', description: '오류 발생률과 복구 능력', level: 2 },
    { name: '확장성', description: '향후 기능 추가 및 규모 확대 가능성', level: 2 },
    { name: '경제성', description: undefined, level: 1 },
    { name: '초기 비용', description: '도입 및 구축에 필요한 투자 비용', level: 2 },
    { name: '운영 비용', description: '월별 유지보수 및 관리 비용', level: 2 },
    { name: 'ROI', description: '투자 대비 수익률과 회수 기간', level: 2 },
    { name: '사용자 경험', description: undefined, level: 1 },
    { name: '사용 편의성', description: '인터페이스 직관성과 학습 용이성', level: 2 },
    { name: '접근성', description: '다양한 사용자층의 접근 가능성', level: 2 },
    { name: '만족도', description: '전반적인 사용자 만족 수준', level: 2 }
];

// 수정된 convertParsedCriteria 함수
function convertParsedCriteria(parsedCriteria) {
    const criteria = [];
    const parentStack = []; // 각 레벨의 현재 부모를 추적

    // 원본 순서 유지 (정렬하지 않음)
    parsedCriteria.forEach((parsed, index) => {
        const id = `criterion-${Date.now()}-${index}`;

        // 부모 ID 찾기
        let parent_id = null;
        if (parsed.level > 1) {
            // 현재 레벨보다 낮은 레벨들만 스택에 유지
            while (parentStack.length > 0 && parentStack[parentStack.length - 1].level >= parsed.level) {
                parentStack.pop();
            }
            
            // 스택에서 가장 최근의 부모(현재 레벨보다 1 낮은 레벨) 찾기
            const targetParentLevel = parsed.level - 1;
            for (let i = parentStack.length - 1; i >= 0; i--) {
                if (parentStack[i].level === targetParentLevel) {
                    parent_id = parentStack[i].id;
                    break;
                }
            }
        }

        const criterion = {
            id,
            name: parsed.name,
            description: parsed.description,
            parent_id,
            level: parsed.level,
            children: [],
            weight: 1
        };

        criteria.push(criterion);
        
        // 현재 기준을 스택에 추가 (잠재적 부모가 될 수 있음)
        parentStack.push(criterion);
    });

    return criteria;
}

// buildHierarchy 함수
function buildHierarchy(flatCriteria) {
    const criteriaMap = new Map();
    const rootCriteria = [];

    // 모든 기준을 맵에 저장
    flatCriteria.forEach(criterion => {
        criteriaMap.set(criterion.id, { ...criterion, children: [] });
    });

    // 계층구조 구성
    flatCriteria.forEach(criterion => {
        const criterionObj = criteriaMap.get(criterion.id);
        
        if (criterion.parent_id) {
            const parent = criteriaMap.get(criterion.parent_id);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(criterionObj);
            }
        } else {
            rootCriteria.push(criterionObj);
        }
    });

    return rootCriteria;
}

console.log('🔍 수정된 계층구조 변환 테스트');
console.log('===============================');

console.log('\n📥 입력 데이터:');
parsedCriteria.forEach((item, index) => {
    const indent = '  '.repeat(item.level - 1);
    console.log(`${index + 1}. ${indent}${item.name} (레벨 ${item.level})`);
});

console.log('\n🔄 변환 과정:');
const flatCriteria = convertParsedCriteria(parsedCriteria);

flatCriteria.forEach((criterion, index) => {
    const indent = '  '.repeat(criterion.level - 1);
    const parentInfo = criterion.parent_id ? ` → 부모: ${flatCriteria.find(c => c.id === criterion.parent_id)?.name}` : ' → 최상위';
    console.log(`${index + 1}. ${indent}${criterion.name} (레벨 ${criterion.level})${parentInfo}`);
});

console.log('\n🏗️ 계층구조 구성:');
const hierarchy = buildHierarchy(flatCriteria);

function printHierarchy(criteria, depth = 0) {
    criteria.forEach((criterion, index) => {
        const indent = '  '.repeat(depth);
        console.log(`${indent}${index + 1}. ${criterion.name} (${criterion.children.length}개 하위 기준)`);
        if (criterion.children.length > 0) {
            printHierarchy(criterion.children, depth + 1);
        }
    });
}

printHierarchy(hierarchy);

console.log('\n✅ 검증 결과:');
console.log(`- 최상위 기준 수: ${hierarchy.length}개`);
hierarchy.forEach((root, index) => {
    console.log(`  ${index + 1}. "${root.name}": ${root.children.length}개 하위 기준`);
    root.children.forEach((child, childIndex) => {
        console.log(`     - ${child.name}`);
    });
});

// 기대 결과와 비교
const expectedStructure = {
    '기술 품질': ['성능', '안정성', '확장성'],
    '경제성': ['초기 비용', '운영 비용', 'ROI'],
    '사용자 경험': ['사용 편의성', '접근성', '만족도']
};

console.log('\n🎯 기대 결과와 비교:');
let isCorrect = true;
hierarchy.forEach(root => {
    const expected = expectedStructure[root.name];
    const actual = root.children.map(child => child.name);
    
    if (JSON.stringify(expected) === JSON.stringify(actual)) {
        console.log(`✅ "${root.name}": 정확`);
    } else {
        console.log(`❌ "${root.name}": 불일치`);
        console.log(`   기대: [${expected.join(', ')}]`);
        console.log(`   실제: [${actual.join(', ')}]`);
        isCorrect = false;
    }
});

console.log(`\n🎉 전체 결과: ${isCorrect ? '성공' : '실패'}`);