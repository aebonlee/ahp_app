/**
 * AI 챗봇 도우미 페이지
 * AHP 연구와 분석에 대한 실시간 질의응답과 전문적 상담을 제공하는 AI 챗봇 시스템
 */

import React, { useState, useRef, useEffect } from 'react';
import PageHeader from '../common/PageHeader';
import { getAIService } from '../../services/aiService';
import { getCurrentAISettings } from '../../utils/aiInitializer';
import AIConfiguration from '../settings/AIConfiguration';
import UIIcon, { AddIcon, DeleteIcon, SettingsIcon } from '../common/UIIcon';
import type { User } from '../../types';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdated: Date;
}

interface QuickPrompt {
  id: string;
  category: 'methodology' | 'analysis' | 'project' | 'academic';
  title: string;
  prompt: string;
  icon: string;
}

interface AIChatbotAssistantPageProps {
  user?: User;
}

const AIChatbotAssistantPage: React.FC<AIChatbotAssistantPageProps> = ({ user }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isAssistantTyping, setIsAssistantTyping] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showAIConfig, setShowAIConfig] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const quickPrompts: QuickPrompt[] = [
    {
      id: 'ahp-basics',
      category: 'methodology',
      title: 'AHP 기본 개념',
      prompt: 'AHP(Analytic Hierarchy Process)의 기본 개념과 특징에 대해 설명해주세요.',
      icon: '⚖️'
    },
    {
      id: 'consistency-ratio',
      category: 'analysis',
      title: '일관성 검증',
      prompt: '일관성 비율(Consistency Ratio)이 0.1을 초과했을 때 어떻게 해야 하나요?',
      icon: '🎯'
    },
    {
      id: 'project-setup',
      category: 'project',
      title: '프로젝트 설계',
      prompt: 'AHP 프로젝트를 설계할 때 고려해야 할 주요 요소들을 알려주세요.',
      icon: '🏗️'
    },
    {
      id: 'paper-writing',
      category: 'academic',
      title: '논문 작성 팁',
      prompt: 'AHP를 활용한 연구논문 작성 시 주의해야 할 점들을 알려주세요.',
      icon: '📝'
    },
    {
      id: 'fuzzy-ahp',
      category: 'methodology',
      title: '퍼지 AHP',
      prompt: '퍼지 AHP와 기존 AHP의 차이점과 언제 사용해야 하는지 설명해주세요.',
      icon: '🌟'
    },
    {
      id: 'expert-selection',
      category: 'project',
      title: '전문가 선정',
      prompt: 'AHP 평가를 위한 전문가는 어떻게 선정하고 몇 명이 적절한가요?',
      icon: '👥'
    },
    {
      id: 'data-analysis',
      category: 'analysis',
      title: '결과 해석',
      prompt: 'AHP 분석 결과를 어떻게 해석하고 검증해야 하나요?',
      icon: '📊'
    },
    {
      id: 'common-errors',
      category: 'methodology',
      title: '자주하는 실수',
      prompt: 'AHP 적용 시 연구자들이 자주 하는 실수들과 해결방법을 알려주세요.',
      icon: '⚠️'
    }
  ];

  // 컴포넌트 마운트 시 초기 세션 생성
  useEffect(() => {
    createNewSession();
  }, []);

  // 메시지 추가 시 스크롤 하단으로 이동
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 새 채팅 세션 생성
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: '새로운 대화',
      messages: [
        {
          id: `msg_${Date.now()}`,
          type: 'assistant',
          content: `안녕하세요! 👋 AHP 연구 전문 AI 도우미입니다.

저는 다음과 같은 도움을 드릴 수 있습니다:

🔹 **AHP 방법론 상담**: 기본 개념부터 고급 기법까지
🔹 **프로젝트 설계 지원**: 계층구조 설계, 평가기준 선정
🔹 **분석 결과 해석**: 일관성 검증, 가중치 분석
🔹 **논문 작성 가이드**: 연구방법론, 결과 기술 방법
🔹 **문제 해결**: 오류 해결, 개선 방안 제시

궁금한 것이 있으시면 언제든 물어보세요! 아래 버튼으로 빠른 질문도 가능합니다.`,
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    setCurrentSession(newSession);
    setChatSessions(prev => [newSession, ...prev]);
  };

  // 메시지 전송
  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage.trim();
    if (!content || !currentSession) return;

    // 사용자 메시지 추가
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      type: 'user',
      content,
      timestamp: new Date()
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      lastUpdated: new Date()
    };

    // 세션 제목 업데이트 (첫 번째 사용자 메시지 기준)
    if (currentSession.messages.length === 1) {
      updatedSession.title = content.length > 30 ? content.substring(0, 30) + '...' : content;
    }

    setCurrentSession(updatedSession);
    setChatSessions(prev => 
      prev.map(session => 
        session.id === currentSession.id ? updatedSession : session
      )
    );

    setInputMessage('');
    setIsAssistantTyping(true);

    // AI 응답 시뮬레이션
    setTimeout(async () => {
      const assistantResponse = await generateAIResponse(content);
      
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        lastUpdated: new Date()
      };

      setCurrentSession(finalSession);
      setChatSessions(prev => 
        prev.map(session => 
          session.id === currentSession.id ? finalSession : session
        )
      );
      setIsAssistantTyping(false);
    }, 1500 + Math.random() * 2000); // 1.5~3.5초 지연
  };

  // AI 응답 생성
  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // 실제 AI 서비스 호출 시도
    const aiService = getAIService();
    
    if (aiService) {
      try {
        // 대화 기록을 AI 서비스에 전달
        const conversationHistory = currentSession?.messages.slice(-10).map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })) || [];
        
        const aiResponse = await aiService.getChatbotResponse(userMessage, conversationHistory);
        return aiResponse;
      } catch (error) {
        console.error('AI 응답 생성 실패:', error);
      }
    }
    
    // AI 서비스가 없거나 실패한 경우 기본 응답 사용
    const message = userMessage.toLowerCase();

    // 키워드 기반 응답 시뮬레이션
    if (message.includes('ahp') && (message.includes('기본') || message.includes('개념'))) {
      return `📚 **AHP(Analytic Hierarchy Process) 기본 개념**

AHP는 복잡한 의사결정 문제를 해결하기 위한 다기준 의사결정 기법입니다.

**🔹 주요 특징:**
• 계층적 구조를 통한 문제 분해
• 쌍대비교를 통한 정량적 평가
• 일관성 검증으로 신뢰성 확보
• 전문가의 주관적 판단 체계화

**🔹 적용 분야:**
• 사업 전략 수립
• 정책 우선순위 결정
• 기술 평가 및 선택
• 공급업체 선정

더 구체적인 질문이 있으시면 언제든 말씀해 주세요! 🤖`;
    }

    if (message.includes('일관성') || message.includes('consistency')) {
      return `🎯 **일관성 비율(CR) 관리 방법**

일관성 비율이 0.1을 초과하는 경우 다음 단계를 따르세요:

**🔹 1단계: 원인 분석**
• 평가자가 평가기준을 명확히 이해했는지 확인
• 너무 많은 평가기준으로 인한 복잡성 검토
• 평가 척도 사용의 적절성 점검

**🔹 2단계: 개선 방법**
• 가장 일관성이 낮은 비교 쌍 재평가
• 평가기준의 정의를 더 명확히 제시
• 필요시 평가기준 수 축소 고려
• 추가적인 전문가 의견 수렴

**🔹 3단계: 재검증**
• 수정 후 CR 재계산
• 여전히 0.1 초과시 단계별 재평가
• 최종 CR < 0.1 달성까지 반복

도움이 더 필요하시면 구체적인 상황을 알려주세요! ⚖️`;
    }

    if (message.includes('프로젝트') && (message.includes('설계') || message.includes('계획'))) {
      return `🏗️ **AHP 프로젝트 설계 가이드**

성공적인 AHP 프로젝트를 위한 핵심 요소들입니다:

**🔹 1. 문제 정의**
• 의사결정 목표 명확화
• 해결해야 할 핵심 질문 설정
• 이해관계자 식별 및 요구사항 파악

**🔹 2. 계층구조 설계**
• 목표(Goal) - 기준(Criteria) - 대안(Alternatives)
• 평가기준 수는 7±2개 이내 권장
• 기준 간 독립성 및 완전성 확보

**🔹 3. 전문가 선정**
• 해당 분야 전문성 보유자
• 5~15명 내외 적정 규모
• 다양한 관점 반영 가능한 구성

**🔹 4. 평가 방법**
• 9점 척도 쌍대비교 활용
• 평가 지침서 및 교육 제공
• 개별 평가 후 그룹 합의 도출

프로젝트 특성에 맞는 세부 조언이 필요하시면 말씀해 주세요! 📋`;
    }

    if (message.includes('논문') || message.includes('paper')) {
      return `📝 **AHP 논문 작성 가이드**

학술논문에서 AHP를 효과적으로 활용하는 방법입니다:

**🔹 연구방법론 기술**
• AHP 선택 근거 명확히 제시
• 계층구조 설계 과정 상세 기술
• 전문가 선정 기준 및 프로필 제시
• 일관성 검증 방법 설명

**🔹 결과 제시**
• 가중치 및 순위 결과 명시
• 일관성 비율 보고 (CR < 0.1)
• 민감도 분석 결과 포함
• 그래프/표를 통한 시각적 제시

**🔹 논의 및 해석**
• 결과의 실무적 의미 해석
• 기존 연구와의 비교 분석
• 연구의 한계점 솔직히 기술
• 향후 연구 방향 제안

**🔹 참고사항**
• Saaty의 원저 반드시 인용
• 최신 AHP 연구동향 반영
• 통계적 유의성 검정 고려

구체적인 논문 분야나 질문이 있으시면 더 자세히 도와드리겠습니다! 📚`;
    }

    if (message.includes('퍼지') || message.includes('fuzzy')) {
      return `🌟 **퍼지 AHP vs 전통적 AHP**

두 방법론의 차이점과 활용 가이드입니다:

**🔹 전통적 AHP**
• 명확한 수치 기반 쌍대비교
• 계산이 상대적으로 간단
• 확실한 판단이 가능한 경우 적합
• 널리 검증된 방법론

**🔹 퍼지 AHP**
• 불확실성과 모호성 반영 가능
• 삼각퍼지수 또는 사다리꼴 퍼지수 사용
• 복잡한 계산 과정 필요
• 주관적 판단의 불확실성 표현

**🔹 사용 권장 상황**
**전통적 AHP**: 기준이 명확하고 전문가 의견이 일치하는 경우
**퍼지 AHP**: 평가기준이 모호하거나 전문가 의견이 분산되는 경우

**🔹 선택 기준**
• 연구 목적과 데이터 특성
• 계산 복잡도 허용 수준
• 결과 해석의 용이성
• 학술적 기여도

어떤 방법이 더 적합한지 구체적인 상황을 알려주시면 맞춤 조언 드리겠습니다! ⚖️`;
    }

    // 기본 응답
    const responses = [
      `좋은 질문이네요! 🤔 

AHP와 관련된 구체적인 내용에 대해 더 자세히 알려주시면, 보다 정확하고 유용한 답변을 드릴 수 있습니다.

다음과 같은 정보가 있으면 더 도움이 됩니다:
• 현재 진행 중인 연구나 프로젝트의 배경
• 구체적으로 어려움을 겪고 있는 부분
• 원하는 결과나 목표

아니면 아래 빠른 질문 버튼들을 활용해보세요! 🎯`,

      `네, 도와드리겠습니다! 💡

AHP는 다양한 분야에서 활용되는 강력한 도구입니다. 구체적인 상황이나 문제를 알려주시면:

✅ 맞춤형 해결방안 제시
✅ 실무 적용 가이드 제공  
✅ 학술적 근거와 사례 공유
✅ 단계별 실행 계획 수립

어떤 도움이 필요한지 더 자세히 설명해 주세요! 🚀`,

      `흥미로운 주제네요! 🎓

AHP 연구에서는 이론적 이해와 실무 적용이 모두 중요합니다. 

현재 어떤 단계에서 도움이 필요하신가요?
🔸 이론적 배경과 개념 이해
🔸 연구 설계 및 방법론 선택  
🔸 데이터 수집 및 분석 과정
🔸 결과 해석 및 활용 방안

구체적인 질문이나 상황을 알려주시면 더 정확한 답변을 드릴 수 있습니다! 📊`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 키 입력 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 빠른 질문 선택
  const handleQuickPrompt = (prompt: QuickPrompt) => {
    sendMessage(prompt.prompt);
  };

  // 세션 선택
  const selectSession = (session: ChatSession) => {
    setCurrentSession(session);
  };

  // 세션 삭제
  const deleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSession?.id === sessionId) {
      if (chatSessions.length > 1) {
        const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
        setCurrentSession(remainingSessions[0]);
      } else {
        createNewSession();
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <PageHeader
        title="AI 챗봇 도우미"
        description="AHP 연구와 분석에 대한 실시간 질의응답과 전문적 상담을 제공합니다"
        icon="💬"
        onBack={() => window.history.back()}
        actions={
          <button
            onClick={() => setShowAIConfig(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor: 'var(--border-light)' }}
          >
            <UIIcon emoji="⚙️" size="sm" />
            <span>AI 설정</span>
          </button>
        }
      />
      
      <div className="flex" style={{ height: 'calc(100vh - 120px)', backgroundColor: 'var(--bg-primary)' }}>
      {/* 사이드바 */}
      {showSidebar && (
        <div 
          className="w-80 border-r flex flex-col"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-light)'
          }}
        >
          {/* 대화 목록 헤더 */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                대화 목록
              </h3>
              <button
                onClick={createNewSession}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
                title="새 대화"
              >
                <AddIcon size="lg" hover />
              </button>
            </div>
          </div>

          {/* 세션 목록 */}
          <div className="flex-1 overflow-y-auto p-4">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => selectSession(session)}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors group ${
                  currentSession?.id === session.id ? 'bg-blue-100' : ''
                }`}
                style={{
                  backgroundColor: currentSession?.id === session.id 
                    ? 'var(--accent-pastel)' 
                    : 'transparent'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div 
                      className="font-medium truncate"
                      style={{ 
                        color: currentSession?.id === session.id 
                          ? 'var(--accent-dark)' 
                          : 'var(--text-primary)'
                      }}
                    >
                      {session.title}
                    </div>
                    <div 
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {formatTime(session.lastUpdated)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 ml-2"
                    title="삭제"
                  >
                    <DeleteIcon size="sm" hover />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 채팅 헤더 */}
        <div 
          className="p-4 border-b flex items-center justify-between"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-light)'
          }}
        >
          <div className="flex items-center">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="mr-3 p-2 rounded"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              ☰
            </button>
            <div>
              <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                🤖 AHP 연구 AI 도우미
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                전문적인 AHP 상담과 연구 지원
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAIConfig(true)}
              className="p-2 rounded transition-colors"
              style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
              title="AI 설정"
            >
              <SettingsIcon size="lg" hover />
            </button>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getCurrentAISettings().hasApiKey ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {getCurrentAISettings().hasApiKey ? 'AI 연결됨' : 'AI 설정 필요'}
              </span>
            </div>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border'
                }`}
                style={{
                  backgroundColor: message.type === 'user'
                    ? 'var(--accent-primary)'
                    : 'var(--bg-primary)',
                  color: message.type === 'user'
                    ? 'white'
                    : 'var(--text-primary)',
                  borderColor: message.type === 'assistant' ? 'var(--border-light)' : 'transparent'
                }}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                  style={{
                    color: message.type === 'user'
                      ? 'rgba(255,255,255,0.7)'
                      : 'var(--text-muted)'
                  }}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {isAssistantTyping && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-light)'
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    AI가 답변을 작성 중입니다...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 빠른 질문 영역 */}
        {currentSession?.messages.length === 1 && (
          <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
            <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              <UIIcon emoji="🚀" size="lg" color="primary" className="inline mr-2" />
              빠른 질문
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {quickPrompts.slice(0, 8).map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="p-2 text-left rounded-lg border transition-colors hover:shadow-sm"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-light)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <UIIcon emoji={prompt.icon} preset="button" hover />
                    <span className="text-xs font-medium">{prompt.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <div 
          className="p-4 border-t"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-light)'
          }}
        >
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="AHP에 대해 궁금한 것을 물어보세요... (Shift+Enter: 줄바꿈)"
                className="w-full p-3 border rounded-lg resize-none"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                  minHeight: '44px',
                  maxHeight: '120px'
                }}
                rows={1}
                disabled={isAssistantTyping}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim() || isAssistantTyping}
              className="p-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <UIIcon emoji="📤" size="lg" color="white" className="inline mr-2" />
              전송
            </button>
          </div>
          
          <div className="mt-2 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            AI 도우미는 참고용 정보를 제공합니다. 중요한 결정은 전문가와 상의하세요.
          </div>
        </div>
      </div>

      {/* AI 설정 모달 */}
      {showAIConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <AIConfiguration onClose={() => setShowAIConfig(false)} />
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AIChatbotAssistantPage;