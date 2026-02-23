/**
 * AI 서비스 초기화 유틸리티
 * 환경변수와 로컬 스토리지를 통한 안전한 API 키 관리
 */

import { initializeAIService } from '../services/aiService';
import { encryptedLocalStorage } from './secureStorage';

// 환경변수에서 API 키 가져오기
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || 'API_KEY_NOT_SET';

/**
 * 저장된 API 키로 AI 서비스 초기화
 */
export const initializeAIFromStorage = () => {
  const savedApiKey = encryptedLocalStorage.getItem('openai_key');
  const savedProvider = encryptedLocalStorage.getItem('ai_provider') as 'openai' | 'claude' || 'openai';
  
  if (savedApiKey && savedApiKey !== 'API_KEY_NOT_SET') {
    return initializeAIService(savedApiKey, savedProvider);
  }
  
  return null;
};

/**
 * 환경변수 API 키로 AI 서비스 초기화 (개발용)
 */
export const initializeAIWithProvidedKey = () => {
  if (OPENAI_API_KEY && OPENAI_API_KEY !== 'API_KEY_NOT_SET') {
    // 환경변수 키가 있으면 암호화 스토리지에 저장
    encryptedLocalStorage.setItem('openai_key', OPENAI_API_KEY);
    encryptedLocalStorage.setItem('ai_provider', 'openai');
    return initializeAIService(OPENAI_API_KEY, 'openai');
  }

  // 환경변수 키가 없으면 저장된 키 사용
  return initializeAIFromStorage();
};

/**
 * API 키 저장 및 AI 서비스 초기화
 */
export const saveAndInitializeAI = (apiKey: string, provider: 'openai' | 'claude' = 'openai') => {
  encryptedLocalStorage.setItem('openai_key', apiKey);
  encryptedLocalStorage.setItem('ai_provider', provider);
  return initializeAIService(apiKey, provider);
};

/**
 * AI 설정 삭제
 */
export const clearAISettings = () => {
  encryptedLocalStorage.removeItem('openai_key');
  encryptedLocalStorage.removeItem('ai_provider');
};

/**
 * 현재 AI 설정 확인
 */
export const getCurrentAISettings = () => {
  return {
    apiKey: encryptedLocalStorage.getItem('openai_key'),
    provider: encryptedLocalStorage.getItem('ai_provider') || 'openai',
    hasApiKey: !!encryptedLocalStorage.getItem('openai_key')
  };
};

/**
 * API 키를 직접 설정하여 AI 서비스 초기화
 */
export const setAPIKeyDirectly = (apiKey: string, provider: 'openai' | 'claude' = 'openai') => {
  if (!apiKey || apiKey.trim() === '') {
    console.error('API 키가 비어있습니다');
    return null;
  }

  encryptedLocalStorage.setItem('openai_key', apiKey);
  encryptedLocalStorage.setItem('ai_provider', provider);
  return initializeAIService(apiKey, provider);
};