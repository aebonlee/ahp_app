// TextParser 테스트
const testText = `- 기술 품질
  - 성능 - 시스템 처리 속도와 응답 시간
  - 안정성 - 오류 발생률과 복구 능력  
  - 확장성 - 향후 기능 추가 및 규모 확대 가능성
- 경제성
  - 초기 비용 - 도입 및 구축에 필요한 투자 비용
  - 운영 비용 - 월별 유지보수 및 관리 비용
  - ROI - 투자 대비 수익률과 회수 기간
- 사용자 경험
  - 사용 편의성 - 인터페이스 직관성과 학습 용이성
  - 접근성 - 다양한 사용자층의 접근 가능성
  - 만족도 - 전반적인 사용자 만족 수준`;

console.log('🔍 마크다운 파싱 테스트');
console.log('========================');

const lines = testText.split('\n');
lines.forEach((line, index) => {
    console.log(`라인 ${index + 1}: "${line}"`);
    
    // 마크다운 패턴 매칭 테스트
    const markdownMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
    if (markdownMatch) {
        const [, indent, marker, content] = markdownMatch;
        const level = Math.floor(indent.length / 2) + 1;
        console.log(`  - 들여쓰기: "${indent}" (길이: ${indent.length})`);
        console.log(`  - 마커: "${marker}"`);
        console.log(`  - 내용: "${content}"`);
        console.log(`  - 계산된 레벨: ${level}`);
        
        // 이름과 설명 분리
        const dashMatch = content.match(/^([^-]+?)\s*-\s*(.+)$/);
        if (dashMatch) {
            console.log(`  - 이름: "${dashMatch[1].trim()}"`);
            console.log(`  - 설명: "${dashMatch[2].trim()}"`);
        } else {
            console.log(`  - 이름: "${content.trim()}" (설명 없음)`);
        }
    } else {
        console.log('  - 매칭 실패');
    }
    console.log('');
});

console.log('\n🎯 예상 결과:');
console.log('- 기술 품질 (레벨 1)');
console.log('  - 성능 (레벨 2)');
console.log('  - 안정성 (레벨 2)');
console.log('  - 확장성 (레벨 2)');