/**
 * AI 서비스 초기화 유틸리티
 * 환경변수와 로컬 스토리지를 통한 안전한 API 키 관리
 */

import { initializeAIService } from '../services/aiService';

// 환경변수에서 API 키 설정 (보안을 위해 하드코딩 제거)
const FIXED_OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || 'API_KEY_NOT_SET';

// 환경변수에서 API 키 가져오기 (개발 환경용 - 폴백)
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || FIXED_OPENAI_API_KEY;

/**
 * 저장된 API 키로 AI 서비스 초기화
 */
export const initializeAIFromStorage = () => {
  const savedApiKey = localStorage.getItem('ahp_openai_key');
  const savedProvider = localStorage.getItem('ahp_ai_provider') as 'openai' | 'claude' || 'openai';
  
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
    // 환경변수 키가 있으면 로컬 스토리지에 저장
    localStorage.setItem('ahp_openai_key', OPENAI_API_KEY);
    localStorage.setItem('ahp_ai_provider', 'openai');
    console.log('🔑 환경변수에서 API 키 발견, 로컬 스토리지에 저장 및 AI 서비스 초기화');
    return initializeAIService(OPENAI_API_KEY, 'openai');
  }
  
  // 환경변수 키가 없으면 저장된 키 사용
  console.log('🔍 환경변수에 API 키 없음, 로컬 스토리지에서 확인');
  return initializeAIFromStorage();
};

/**
 * API 키 저장 및 AI 서비스 초기화
 */
export const saveAndInitializeAI = (apiKey: string, provider: 'openai' | 'claude' = 'openai') => {
  localStorage.setItem('ahp_openai_key', apiKey);
  localStorage.setItem('ahp_ai_provider', provider);
  return initializeAIService(apiKey, provider);
};

/**
 * AI 설정 삭제
 */
export const clearAISettings = () => {
  localStorage.removeItem('ahp_openai_key');
  localStorage.removeItem('ahp_ai_provider');
};

/**
 * 현재 AI 설정 확인
 */
export const getCurrentAISettings = () => {
  return {
    apiKey: localStorage.getItem('ahp_openai_key'),
    provider: localStorage.getItem('ahp_ai_provider') || 'openai',
    hasApiKey: !!localStorage.getItem('ahp_openai_key')
  };
};

/**
 * API 키를 직접 설정하여 AI 서비스 초기화
 */
export const setAPIKeyDirectly = (apiKey: string, provider: 'openai' | 'claude' = 'openai') => {
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ API 키가 비어있습니다');
    return null;
  }
  
  console.log('🔑 API 키 직접 설정 및 AI 서비스 초기화');
  localStorage.setItem('ahp_openai_key', apiKey);
  localStorage.setItem('ahp_ai_provider', provider);
  return initializeAIService(apiKey, provider);
};