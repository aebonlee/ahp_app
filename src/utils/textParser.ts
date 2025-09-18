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
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
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
      const level = Math.floor(indent.length / 2) + 1; // 2칸 들여쓰기당 1레벨
      const [name, description] = this.extractNameAndDescription(content);
      return { name: name.trim(), description, level };
    }

    // 번호 매기기 형식 (1., 1.1., 1-1., etc.)
    const numberedMatch = line.match(/^(\s*)(\d+(?:[.-]\d+)*\.?)\s+(.+)$/);
    if (numberedMatch) {
      const [, , number, content] = numberedMatch;
      const level = (number.match(/[.-]/g) || []).length + 1;
      const [name, description] = this.extractNameAndDescription(content);
      return { name: name.trim(), description, level };
    }

    // 탭/공백 들여쓰기 형식
    const indentMatch = line.match(/^(\s*)(.+)$/);
    if (indentMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [, indent, content] = indentMatch;
      let level = 1;
      
      // 탭 문자로 레벨 계산
      if (indent.includes('\t')) {
        level = indent.split('\t').length;
      } else {
        // 공백으로 레벨 계산 (4칸당 1레벨)
        level = Math.floor(indent.length / 4) + 1;
      }

      const [name, description] = this.extractNameAndDescription(content);
      return { name: name.trim(), description, level };
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
      markdown: `# 마크다운 형식 예제
- 기술적 요소
  - 성능 - 시스템의 처리 속도와 응답 시간
  - 안정성 - 시스템의 오류 발생률과 복구 능력
  - 확장성 - 향후 기능 추가 및 규모 확대 가능성
- 경제적 요소
  - 초기 비용 - 시스템 구축에 필요한 초기 투자 비용
  - 운영 비용 - 시스템 운영 및 유지보수 비용
- 사용자 요소
  - 사용 편의성 - 사용자 인터페이스의 직관성과 학습 용이성
  - 접근성 - 다양한 사용자층의 접근 가능성`,

      numbered: `# 번호 매기기 형식 예제
1. 교육 품질
  1.1. 강의 내용의 전문성
  1.2. 교수법의 효과성
  1.3. 실습 기회의 충분성
2. 시설 환경
  2.1. 강의실 환경
  2.2. 실습실 장비
  2.3. 도서관 및 학습 공간
3. 지원 서비스
  3.1. 학습 지원 프로그램
  3.2. 진로 상담 서비스`,

      indented: `# 들여쓰기 형식 예제
제품 평가 기준
    기능성
        핵심 기능 완성도
        추가 기능의 유용성
        기능 간 연동성
    품질
        내구성 - 제품의 수명과 견고함
        신뢰성 - 일관된 성능 제공 능력
    사용자 경험
        직관성 - 사용법의 이해 용이성
        만족도 - 전반적인 사용자 만족도`
    };
  }
}

export default TextParser;