/**
 * AI 서비스 React Hook
 * AI 서비스 초기화 및 상태 관리
 */

import { useEffect, useState } from 'react';
import { getAIService } from '../services/aiService';
import { initializeAIWithProvidedKey, getCurrentAISettings } from '../utils/aiInitializer';

export const useAIService = () => {
  const [isAIConfigured, setIsAIConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        // 환경변수 또는 저장된 키로 AI 서비스 초기화
        const aiService = initializeAIWithProvidedKey();
        
        if (aiService) {
          // API 키 유효성 검증 (선택적)
          const isValid = await aiService.validateAPIKey();
          setIsAIConfigured(isValid);
        } else {
          setIsAIConfigured(false);
        }
      } catch (error) {
        console.error('AI 서비스 초기화 실패:', error);
        setIsAIConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAI();
  }, []);

  const refreshAIStatus = () => {
    const settings = getCurrentAISettings();
    setIsAIConfigured(settings.hasApiKey);
  };

  return {
    isAIConfigured,
    isLoading,
    aiService: getAIService(),
    refreshAIStatus
  };
};