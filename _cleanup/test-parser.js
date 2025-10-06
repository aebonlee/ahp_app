// textParser 테스트 스크립트
const TextParser = require('./src/utils/textParser.ts');

// 테스트용 예제 텍스트들
const markdownTest = `- 기술 품질
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

const numberedTest = `1. 교육 효과성
  1.1. 학습 성과 - 학생들의 성적 향상 정도
  1.2. 이해도 증진 - 개념 이해의 깊이와 폭
  1.3. 참여도 - 수업 참여 적극성과 집중도
2. 교사 역량
  2.1. 전문성 - 해당 분야의 전문 지식과 경험
  2.2. 교수법 - 효과적인 교육 방법 활용 능력
  2.3. 소통 능력 - 학생과의 원활한 의사소통
3. 환경 요인
  3.1. 시설 환경 - 교실과 실습실의 물리적 환경
  3.2. 교육 자료 - 교재와 멀티미디어 자료의 질
  3.3. 학급 규모 - 적정한 학생 수와 개별 지도 가능성`;

const indentedTest = `기업 평가 기준
    재무 성과
        수익성 - 매출액과 순이익 증가율
        안정성 - 부채비율과 유동비율
        성장성 - 전년 대비 성장률과 시장 점유율
    운영 효율성
        생산성 - 인당 매출액과 설비 가동률
        품질 관리 - 불량률과 고객 만족도
        혁신 역량 - R&D 투자와 신제품 개발력
    지속가능성
        환경 경영 - 친환경 정책과 탄소 배출 감소
        사회적 책임 - 사회공헌 활동과 윤리 경영
        거버넌스 - 투명한 경영과 이해관계자 소통`;

console.log('=== 마크다운 리스트 테스트 ===');
const markdownResult = TextParser.parseText(markdownTest);
console.log(`성공: ${markdownResult.success}`);
console.log(`파싱된 개수: ${markdownResult.criteria.length}`);
markdownResult.criteria.forEach(c => {
  console.log(`  레벨 ${c.level}: ${c.name}`);
});
if (markdownResult.errors.length > 0) {
  console.log('에러:', markdownResult.errors);
}

console.log('\n=== 번호 매기기 테스트 ===');
const numberedResult = TextParser.parseText(numberedTest);
console.log(`성공: ${numberedResult.success}`);
console.log(`파싱된 개수: ${numberedResult.criteria.length}`);
numberedResult.criteria.forEach(c => {
  console.log(`  레벨 ${c.level}: ${c.name}`);
});
if (numberedResult.errors.length > 0) {
  console.log('에러:', numberedResult.errors);
}

console.log('\n=== 들여쓰기 테스트 ===');
const indentedResult = TextParser.parseText(indentedTest);
console.log(`성공: ${indentedResult.success}`);
console.log(`파싱된 개수: ${indentedResult.criteria.length}`);
indentedResult.criteria.forEach(c => {
  console.log(`  레벨 ${c.level}: ${c.name}`);
});
if (indentedResult.errors.length > 0) {
  console.log('에러:', indentedResult.errors);
}