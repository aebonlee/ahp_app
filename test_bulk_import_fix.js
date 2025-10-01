/**
 * 수정된 일괄 가져오기 로직 테스트
 */

// 가져온 계층구조 기준 예제
const importedCriteria = [
    { id: 'c1', name: '기술 품질', description: '', level: 1, parent_id: null, order: 1 },
    { id: 'c2', name: '성능', description: '시스템 처리 속도와 응답 시간', level: 2, parent_id: 'c1', order: 1 },
    { id: 'c3', name: '안정성', description: '오류 발생률과 복구 능력', level: 2, parent_id: 'c1', order: 2 },
    { id: 'c4', name: '확장성', description: '향후 기능 추가 및 규모 확대 가능성', level: 2, parent_id: 'c1', order: 3 },
    { id: 'c5', name: '경제성', description: '', level: 1, parent_id: null, order: 2 },
    { id: 'c6', name: '초기 비용', description: '도입 및 구축에 필요한 투자 비용', level: 2, parent_id: 'c5', order: 1 },
    { id: 'c7', name: '운영 비용', description: '월별 유지보수 및 관리 비용', level: 2, parent_id: 'c5', order: 2 },
    { id: 'c8', name: 'ROI', description: '투자 대비 수익률과 회수 기간', level: 2, parent_id: 'c5', order: 3 },
    { id: 'c9', name: '사용자 경험', description: '', level: 1, parent_id: null, order: 3 },
    { id: 'c10', name: '사용 편의성', description: '인터페이스 직관성과 학습 용이성', level: 2, parent_id: 'c9', order: 1 },
    { id: 'c11', name: '접근성', description: '다양한 사용자층의 접근 가능성', level: 2, parent_id: 'c9', order: 2 },
    { id: 'c12', name: '만족도', description: '전반적인 사용자 만족 수준', level: 2, parent_id: 'c9', order: 3 }
];

function testBulkImportOptions() {
    console.log('🔍 수정된 일괄 가져오기 로직 테스트');
    console.log('===================================');
    
    const rootCriteria = importedCriteria.filter(c => c.level === 1);
    const subCriteria = importedCriteria.filter(c => c.level === 2);
    
    console.log('\n📊 입력 데이터 분석:');
    console.log(`- 총 기준 수: ${importedCriteria.length}개`);
    console.log(`- 주 기준: ${rootCriteria.length}개`);
    console.log(`- 하위 기준: ${subCriteria.length}개`);
    
    // 옵션 1 시뮬레이션: 주 기준만 저장
    console.log('\n🎯 옵션 1: 주 기준만 저장 (하위 기준은 설명에 포함)');
    console.log('======================================================');
    
    rootCriteria.forEach(rootCriterion => {
        const relatedSubCriteria = subCriteria.filter(c => c.parent_id === rootCriterion.id);
        
        console.log(`\n📋 기준: "${rootCriterion.name}"`);
        console.log(`   하위 기준 ${relatedSubCriteria.length}개:`, relatedSubCriteria.map(s => s.name));
        
        let description = rootCriterion.description || '';
        
        if (relatedSubCriteria.length > 0) {
            const subCriteriaText = relatedSubCriteria.map(sub => 
                sub.description ? `${sub.name}: ${sub.description}` : sub.name
            ).join(', ');
            
            description = description 
                ? `${description} [하위 기준: ${subCriteriaText}]`
                : `[하위 기준: ${subCriteriaText}]`;
        }
        
        const criterionData = {
            name: rootCriterion.name,
            description: description,
            parent_id: null,
            level: 1,
            order: rootCriterion.order
        };
        
        console.log('   💾 저장될 데이터:', {
            name: criterionData.name,
            description: criterionData.description.substring(0, 100) + (criterionData.description.length > 100 ? '...' : ''),
            level: criterionData.level
        });
    });
    
    // 옵션 2 시뮬레이션: 모든 기준을 개별 저장
    console.log('\n🎯 옵션 2: 모든 기준을 개별적으로 저장');
    console.log('==========================================');
    
    importedCriteria.forEach((criterion, index) => {
        const criterionData = {
            name: criterion.name,
            description: criterion.description || '',
            parent_id: null, // AHP에서는 평면 구조 사용
            level: 1,
            order: index + 1
        };
        
        console.log(`${index + 1}. ${criterionData.name} - ${criterionData.description || '(설명 없음)'}`);
    });
    
    // 비교 결과
    console.log('\n📈 결과 비교:');
    console.log('=============');
    console.log(`옵션 1 (주 기준만): ${rootCriteria.length}개 기준 생성`);
    console.log(`옵션 2 (모든 기준): ${importedCriteria.length}개 기준 생성`);
    
    console.log('\n💡 권장사항:');
    console.log('- AHP 평가에서는 보통 3-7개의 기준을 사용합니다.');
    console.log('- 너무 많은 기준은 쌍대비교를 복잡하게 만듭니다.');
    console.log('- 계층구조가 있는 경우 "주 기준만" 옵션을 권장합니다.');
}

testBulkImportOptions();