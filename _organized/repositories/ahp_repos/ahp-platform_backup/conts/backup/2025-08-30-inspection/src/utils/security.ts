/**
 * Security utilities for XSS and CSRF protection
 */

// XSS 방지를 위한 HTML 태그 제거
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 위험한 문자열 패턴 검사
export function containsXSS(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*>/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

// SQL Injection 방지를 위한 기본 검사
export function containsSQLInjection(input: string): boolean {
  if (typeof input !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(;|\-\-|\||\/\*|\*\/)/gi,
    /(\b(or|and)\b.*\b(=|<|>|like)\b)/gi,
    /('|(\\')).*('|(\\')).*('|(\\'))/gi,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// 안전한 문자열 검증
export function isValidInput(input: string, options: {
  maxLength?: number;
  minLength?: number;
  allowHTML?: boolean;
  allowSQL?: boolean;
} = {}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { maxLength = 1000, minLength = 0, allowHTML = false, allowSQL = false } = options;
  
  if (typeof input !== 'string') {
    errors.push('입력값이 문자열이 아닙니다.');
    return { isValid: false, errors };
  }
  
  if (input.length < minLength) {
    errors.push(`최소 ${minLength}자 이상 입력해주세요.`);
  }
  
  if (input.length > maxLength) {
    errors.push(`최대 ${maxLength}자까지 입력 가능합니다.`);
  }
  
  if (!allowHTML && containsXSS(input)) {
    errors.push('위험한 스크립트가 포함되어 있습니다.');
  }
  
  if (!allowSQL && containsSQLInjection(input)) {
    errors.push('위험한 SQL 구문이 포함되어 있습니다.');
  }
  
  return { isValid: errors.length === 0, errors };
}

// CSRF 토큰 생성
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// CSRF 토큰 검증
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  return token === expectedToken;
}

// 안전한 URL 검증
export function isValidURL(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

// 이메일 형식 검증
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && !containsXSS(email);
}

// 비밀번호 강도 검사
export function validatePassword(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('최소 8자 이상이어야 합니다.');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('대문자를 포함해야 합니다.');
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('소문자를 포함해야 합니다.');
  }
  
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('숫자를 포함해야 합니다.');
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('특수문자를 포함해야 합니다.');
  }
  
  if (containsXSS(password) || containsSQLInjection(password)) {
    score = 0;
    feedback.push('위험한 문자가 포함되어 있습니다.');
  }
  
  return {
    isValid: score >= 4,
    score,
    feedback
  };
}

// Content Security Policy 헤더 생성
export function generateCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' https:",
    "connect-src 'self' https://ahp-forpaper.onrender.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}

// 세션 토큰 검증
export function isValidSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  // JWT 형태 검증 (헤더.페이로드.서명)
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  return jwtRegex.test(token) && !containsXSS(token);
}

// Rate limiting을 위한 요청 추적
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const current = requestCounts.get(identifier);
  
  if (!current || current.resetTime <= now) {
    // 새로운 윈도우 시작
    const resetTime = now + windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  current.count++;
  return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime };
}