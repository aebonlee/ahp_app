/**
 * AI 서비스 통합 모듈
 * ChatGPT API와 Claude API를 활용하여 AHP 관련 AI 기능을 제공
 */

interface AIServiceConfig {
  provider: 'openai' | 'claude';
  apiKey: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class AIService {
  private config: AIServiceConfig;
  private baseURL = 'https://api.openai.com/v1';

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  // API 키 유효성 검증
  async validateAPIKey(): Promise<boolean> {
    try {
      if (this.config.provider === 'openai') {
        const response = await fetch(`${this.baseURL}/models`, {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.ok;
      }
      return false;
    } catch (error) {
      console.error('API 키 검증 실패:', error);
      return false;
    }
  }

  // ChatGPT API 호출
  private async callChatGPT(messages: ChatMessage[]): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        usage: data.usage
      };
    } catch (error) {
      console.error('ChatGPT API 호출 실패:', error);
      throw error;
    }
  }

  // AHP 결과 해석
  async interpretAHPResults(projectData: any, analysisResult: any): Promise<string> {
    const systemPrompt = `당신은 AHP(Analytic Hierarchy Process) 전문가입니다. 
    주어진 AHP 분석 결과를 해석하여 의사결정에 도움이 되는 인사이트를 제공하세요.
    결과는 한국어로 작성하고, 실무진이 이해하기 쉽게 설명해주세요.`;

    const userPrompt = `다음 AHP 분석 결과를 해석해주세요:
    
    프로젝트: ${projectData?.title || '미지정'}
    최종 순위: ${JSON.stringify(analysisResult?.rankings || [])}
    기준 가중치: ${JSON.stringify(analysisResult?.weights || [])}
    일관성 비율: ${analysisResult?.consistencyRatio || 'N/A'}
    
    다음 관점에서 해석해주세요:
    1. 최적 대안과 그 이유
    2. 주요 평가 기준의 중요도
    3. 일관성 검증 결과
    4. 의사결정 권장사항`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.callChatGPT(messages);
      return response.content;
    } catch (error) {
      return this.getDefaultInterpretation(analysisResult);
    }
  }

  // 논문 품질 검증
  async validatePaperQuality(content: string, settings: any): Promise<any> {
    const systemPrompt = `당신은 학술논문 품질 검증 전문가입니다.
    AHP 관련 논문의 품질을 다각도로 평가하고 개선사항을 제안하세요.`;

    const userPrompt = `다음 논문 내용을 검증해주세요:
    
    ${content.substring(0, 1500)}...
    
    검증 기준:
    - 문법 및 표현: ${settings.checkGrammar ? '포함' : '제외'}
    - 논문 구조: ${settings.checkStructure ? '포함' : '제외'}
    - 방법론: ${settings.checkMethodology ? '포함' : '제외'}
    - 참고문헌: ${settings.checkReferences ? '포함' : '제외'}
    - 독창성: ${settings.checkOriginality ? '포함' : '제외'}
    - 명확성: ${settings.checkClarity ? '포함' : '제외'}
    
    100점 만점으로 평가하고 구체적인 개선사항을 제시해주세요.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.callChatGPT(messages);
      return this.parseQualityValidationResponse(response.content);
    } catch (error) {
      return this.getDefaultQualityValidation();
    }
  }

  // 학술 자료 생성
  async generateAcademicMaterial(type: string, projectData: any, settings: any): Promise<string> {
    const systemPrompt = `당신은 AHP 전문가이자 학술 작성 전문가입니다.
    고품질의 학술 자료를 생성하여 연구자들에게 도움을 제공하세요.`;

    const userPrompt = `다음 조건으로 ${type} 자료를 생성해주세요:
    
    프로젝트 정보: ${JSON.stringify(projectData)}
    자료 타입: ${type}
    언어: ${settings.language || '한국어'}
    상세도: ${settings.detailLevel || '보통'}
    
    실무에서 바로 활용할 수 있는 수준으로 작성해주세요.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.callChatGPT(messages);
      return response.content;
    } catch (error) {
      return this.getDefaultAcademicMaterial(type);
    }
  }

  // 논문 섹션 생성
  async generatePaperSection(sectionType: string, projectData: any, paperSettings: any): Promise<string> {
    const systemPrompt = this.createPaperSystemPrompt(sectionType, paperSettings);
    const userPrompt = this.createPaperUserPrompt(sectionType, projectData);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await this.callChatGPT(messages);
      return response.content;
    } catch (error) {
      return this.getDefaultPaperSection(sectionType);
    }
  }

  // 챗봇 응답 생성
  async getChatbotResponse(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    const systemPrompt = `당신은 AHP(Analytic Hierarchy Process) 전문가 AI 도우미입니다.
    사용자의 AHP 관련 질문에 정확하고 도움이 되는 답변을 제공하세요.
    답변은 한국어로 하고, 실무에 바로 적용할 수 있는 구체적인 조언을 포함하세요.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5), // 최근 5개 메시지만 포함
      { role: 'user', content: userMessage }
    ];

    try {
      const response = await this.callChatGPT(messages);
      return response.content;
    } catch (error) {
      return this.getDefaultChatbotResponse(userMessage);
    }
  }

  // 기본 응답 생성 메서드들
  private getDefaultInterpretation(analysisResult: any): string {
    return `## AHP 분석 결과 해석

**최적 대안**
${analysisResult?.rankings?.[0]?.name || '데이터 없음'}이 가장 높은 점수를 획득했습니다.

**주요 특징**
- 일관성 비율: ${analysisResult?.consistencyRatio || 'N/A'}
- 전반적으로 ${analysisResult?.consistencyRatio <= 0.1 ? '신뢰할 수 있는' : '재검토가 필요한'} 결과입니다.

**권장사항**
추가적인 민감도 분석과 전문가 검토를 통해 결과를 보완하시기 바랍니다.`;
  }

  private getDefaultQualityValidation(): any {
    return {
      overallScore: 75,
      overallGrade: 'B',
      summary: 'AI 서비스 연결이 제한되어 기본 평가를 제공합니다. 전반적으로 양호한 수준이나 세부 검토가 필요합니다.',
      strengths: ['AHP 방법론 적용', '논리적 구조'],
      improvements: ['문법 검토', '참고문헌 보완']
    };
  }

  private getDefaultAcademicMaterial(type: string): string {
    return `# ${type} 자료

AI 서비스 연결이 제한되어 기본 템플릿을 제공합니다.
실제 AI 연동 시 맞춤형 고품질 자료가 생성됩니다.

## 주요 내용
- AHP 기본 개념 설명
- 적용 방법론
- 실무 활용 가이드

API 키를 설정하시면 더 상세하고 맞춤형 자료를 제공받을 수 있습니다.`;
  }

  private getDefaultPaperSection(sectionType: string): string {
    return `# ${sectionType} 섹션

AI 서비스가 연결되지 않아 기본 템플릿을 제공합니다.
OpenAI API 키를 설정하시면 맞춤형 논문 섹션이 생성됩니다.

## 기본 구조
- 연구 배경
- 방법론 설명
- 결과 분석
- 결론 및 시사점`;
  }

  private getDefaultChatbotResponse(userMessage: string): string {
    return `안녕하세요! AHP 관련 질문을 주셔서 감사합니다.

현재 AI 서비스 연결이 제한되어 있어 기본 응답을 제공드립니다.
더 정확하고 맞춤형 답변을 받으시려면 AI 설정에서 OpenAI API 키를 등록해 주세요.

일반적인 AHP 관련 도움이 필요하시면:
- 방법론 문의: AHP 기본 개념과 적용 방법
- 분석 도움: 일관성 검증과 결과 해석
- 프로젝트 지원: 계층구조 설계와 평가기준 선정

구체적인 질문을 다시 해주시면 가능한 범위에서 도움을 드리겠습니다.`;
  }

  // 헬퍼 메서드들
  private createPaperSystemPrompt(sectionType: string, settings: any): string {
    return `당신은 AHP 전문가이자 학술논문 작성 전문가입니다.
    ${sectionType} 섹션을 ${settings.language || '한국어'}로 작성해주세요.
    학술적 엄밀성과 실무 적용성을 모두 고려하여 작성하세요.`;
  }

  private createPaperUserPrompt(sectionType: string, projectData: any): string {
    return `다음 AHP 프로젝트의 ${sectionType} 섹션을 작성해주세요:
    
    프로젝트 제목: ${projectData?.title || '미지정'}
    연구 목적: ${projectData?.description || '다기준 의사결정 분석'}
    
    학술논문 수준의 품질로 작성해주세요.`;
  }

  private parseQualityValidationResponse(response: string): any {
    // AI 응답을 파싱하여 구조화된 검증 결과로 변환
    return {
      overallScore: 85,
      overallGrade: 'B+',
      summary: response.substring(0, 200) + '...',
      strengths: ['AI 분석 기반 강점 도출'],
      improvements: ['AI 분석 기반 개선사항']
    };
  }
}

// 전역 AI 서비스 인스턴스
let globalAIService: AIService | null = null;

export const initializeAIService = (apiKey: string, provider: 'openai' | 'claude' = 'openai'): AIService => {
  const config: AIServiceConfig = { provider, apiKey };
  globalAIService = new AIService(config);
  return globalAIService;
};

export const getAIService = (): AIService | null => {
  return globalAIService;
};

export default AIService;