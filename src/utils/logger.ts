/**
 * 프로덕션 안전 로거
 * 개발 환경에서만 console.log 출력
 */

const isDevelopment = process.env.NODE_ENV === 'development' || 
                      process.env.REACT_APP_DEBUG === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // 에러는 프로덕션에서도 출력 (중요)
    console.error(...args);
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};

// 기본 export
export default logger;
