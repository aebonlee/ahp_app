// 세 번째 예제 파싱 테스트
const testText = `기업 평가 기준
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

// 각 줄 분석
const lines = testText.split('\n');
lines.forEach((line, index) => {
  const spaces = line.match(/^(\s*)/)[1].length;
  const level = spaces === 0 ? 1 : Math.floor(spaces / 4) + 1;
  const content = line.trim();
  console.log(`Line ${index + 1}: "${content}" - Spaces: ${spaces}, Level: ${level}`);
});

console.log(`\n총 ${lines.length}개 항목`);