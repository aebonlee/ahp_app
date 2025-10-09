interface ParsedCriterion {
  name: string;
  description?: string;
  level: number;
  parent_id?: string | null;
}

interface ParseResult {
  success: boolean;
  criteria: ParsedCriterion[];
  errors: string[];
}

export class TextParser {
  /**
   * 다양한 형식의 텍스트를 파싱하여 계층구조 기준을 추출합니다.
   * 지원 형식:
   * 1. 탭/공백 들여쓰기
   * 2. 마크다운 리스트 (-, *, +)
   * 3. 번호 매기기 (1., 1-1., 1.1., etc.)
   * 4. Excel 복사-붙여넣기 (탭 구분)
   */
  static parseText(text: string): ParseResult {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const criteria: ParsedCriterion[] = [];
    const errors: string[] = [];
    const nameMap = new Map<string, boolean>(); // 중복 검사용

    if (lines.length === 0) {
      return { success: false, criteria: [], errors: ['입력된 텍스트가 없습니다.'] };
    }

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const parsed = this.parseLine(line, i + 1);
        
        if (parsed) {
          // 중복 이름 검사
          const lowerName = parsed.name.toLowerCase();
          if (nameMap.has(lowerName)) {
            errors.push(`라인 ${i + 1}: 중복된 기준명 "${parsed.name}"`);
            continue;
          }
          nameMap.set(lowerName, true);

          // 이름 길이 검사
          if (parsed.name.length < 2) {
            errors.push(`라인 ${i + 1}: 기준명은 2자 이상이어야 합니다.`);
            continue;
          }

          // 레벨 검사 (1-5까지만 허용)
          if (parsed.level > 5) {
            errors.push(`라인 ${i + 1}: 최대 5단계까지만 지원됩니다.`);
            continue;
          }

          criteria.push(parsed);
        } else {
          errors.push(`라인 ${i + 1}: 파싱할 수 없는 형식입니다. "${line}"`);
        }
      }

      // 계층구조 유효성 검사
      const structureErrors = this.validateHierarchy(criteria);
      errors.push(...structureErrors);

      return {
        success: errors.length === 0,
        criteria,
        errors
      };

    } catch (error) {
      return {
        success: false,
        criteria: [],
        errors: [`파싱 중 오류가 발생했습니다: ${error}`]
      };
    }
  }

  /**
   * 개별 라인을 파싱합니다.
   */
  private static parseLine(line: string, lineNumber: number): ParsedCriterion | null {
    // 마크다운 리스트 형식 (-, *, +로 시작하고 들여쓰기로 레벨 구분)
    const markdownMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
    if (markdownMatch) {
      const [, indent, , content] = markdownMatch;
      // 들여쓰기 깊이 계산
      let level = 1;
      if (indent.length > 0) {
        // 탭은 4칸으로 계산
        const spaces = indent.replace(/\t/g, '    ').length;
        // 2칸 또는 4칸당 1레벨 증가
        // 2칸 = 레벨 2, 4칸 = 레벨 2 or 3, 6칸 = 레벨 3, 8칸 = 레벨 4
        if (spaces >= 2) {
          level = Math.floor(spaces / 2) + 1;
        }
      }
      const [name, description] = this.extractNameAndDescription(content);
      return { name: name.trim(), description, level };
    }

    // 번호 매기기 형식 (1., 1.1., 1-1., etc.)
    const numberedMatch = line.match(/^(\s*)(\d+(?:[.-]\d+)*\.?)\s+(.+)$/);
    if (numberedMatch) {
      const [, indent, number, content] = numberedMatch;
      
      // 번호 형식으로 레벨 계산
      // "1." = 레벨 1, "1.1." 또는 "1-1." = 레벨 2, etc.
      const numberLevel = (number.match(/[.-]/g) || []).length + 1;
      
      // 번호 형식을 기준으로 레벨 결정
      // 들여쓰기는 무시하고 번호 형식만으로 레벨 결정
      const level = numberLevel;
      
      const [name, description] = this.extractNameAndDescription(content);
      return { name: name.trim(), description, level };
    }

    // 들여쓰기 형식 처리 (들여쓰기가 있는 경우)
    const indentMatch = line.match(/^(\s+)(.+)$/);
    if (indentMatch) {
      const [, indent, content] = indentMatch;
      
      // 탭과 공백을 모두 공백으로 변환하여 계산
      const spaces = indent.replace(/\t/g, '    ').length;
      
      // 4칸당 1레벨 증가 (4칸 = 레벨 2, 8칸 = 레벨 3, ...)
      const level = Math.floor(spaces / 4) + 1;

      const [name, description] = this.extractNameAndDescription(content);
      return { name: name.trim(), description, level };
    }

    // 들여쓰기가 없는 일반 텍스트는 레벨 1로 처리
    const plainMatch = line.match(/^(.+)$/);
    if (plainMatch) {
      const [, content] = plainMatch;
      const [name, description] = this.extractNameAndDescription(content);
      return { name: name.trim(), description, level: 1 };
    }

    return null;
  }

  /**
   * 텍스트에서 이름과 설명을 분리합니다.
   * 형식: "이름 - 설명" 또는 "이름: 설명" 또는 "이름 (설명)"
   */
  private static extractNameAndDescription(text: string): [string, string?] {
    // "이름 - 설명" 형식
    const dashMatch = text.match(/^([^-]+?)\s*-\s*(.+)$/);
    if (dashMatch) {
      return [dashMatch[1].trim(), dashMatch[2].trim()];
    }

    // "이름: 설명" 형식
    const colonMatch = text.match(/^([^:]+?)\s*:\s*(.+)$/);
    if (colonMatch) {
      return [colonMatch[1].trim(), colonMatch[2].trim()];
    }

    // "이름 (설명)" 형식
    const parenthesesMatch = text.match(/^([^(]+?)\s*\(([^)]+)\)\s*$/);
    if (parenthesesMatch) {
      return [parenthesesMatch[1].trim(), parenthesesMatch[2].trim()];
    }

    // 설명 없이 이름만
    return [text.trim()];
  }

  /**
   * 계층구조의 유효성을 검사합니다.
   */
  private static validateHierarchy(criteria: ParsedCriterion[]): string[] {
    const errors: string[] = [];
    
    if (criteria.length === 0) {
      return ['최소 1개 이상의 기준이 필요합니다.'];
    }

    // 레벨 1이 없으면 오류
    const level1Count = criteria.filter(c => c.level === 1).length;
    if (level1Count === 0) {
      errors.push('최상위 레벨(레벨 1) 기준이 최소 1개 필요합니다.');
    }

    // 연속된 레벨인지 확인
    const levelSet = new Set(criteria.map(c => c.level));
    const levels = Array.from(levelSet).sort((a, b) => a - b);
    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i + 1] - levels[i] > 1) {
        errors.push(`레벨 ${levels[i]}에서 레벨 ${levels[i + 1]}로 건너뛸 수 없습니다. 연속된 레벨이어야 합니다.`);
      }
    }

    return errors;
  }

  /**
   * 예제 텍스트를 생성합니다.
   */
  static getExampleTexts(): { [key: string]: string } {
    return {
      markdown: `- 재무 성과
  - 수익성 - 매출액과 순이익 증가율
  - 안정성 - 부채비율과 유동비율  
  - 성장성 - 전년 대비 성장률
- 운영 효율성
  - 생산성 - 인당 매출액과 설비 가동률
  - 품질 관리 - 불량률과 고객 만족도
  - 혁신 역량 - R&D 투자와 신제품 개발
- 지속가능성
  - 환경 경영 - 친환경 정책과 탄소 배출
  - 사회적 책임 - 사회공헌과 윤리 경영
  - 거버넌스 - 투명 경영과 소통`,

      numbered: `1. 재무 성과
  1.1. 수익성 - 매출액과 순이익 증가율
  1.2. 안정성 - 부채비율과 유동비율
  1.3. 성장성 - 전년 대비 성장률
2. 운영 효율성
  2.1. 생산성 - 인당 매출액과 설비 가동률
  2.2. 품질 관리 - 불량률과 고객 만족도
  2.3. 혁신 역량 - R&D 투자와 신제품 개발
3. 지속가능성
  3.1. 환경 경영 - 친환경 정책과 탄소 배출
  3.2. 사회적 책임 - 사회공헌과 윤리 경영
  3.3. 거버넌스 - 투명 경영과 소통`,

      indented: `재무 성과
    수익성 - 매출액과 순이익 증가율
    안정성 - 부채비율과 유동비율
    성장성 - 전년 대비 성장률
운영 효율성
    생산성 - 인당 매출액과 설비 가동률
    품질 관리 - 불량률과 고객 만족도
    혁신 역량 - R&D 투자와 신제품 개발
지속가능성
    환경 경영 - 친환경 정책과 탄소 배출
    사회적 책임 - 사회공헌과 윤리 경영
    거버넌스 - 투명 경영과 소통`
    };
  }
}

export default TextParser;