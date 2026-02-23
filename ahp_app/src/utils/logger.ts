/**
 * 조건부 로깅 유틸리티
 * 프로덕션 환경에서 console 출력을 억제하고,
 * 개발 환경에서만 디버그 정보를 표시합니다.
 */

const IS_DEV = process.env.NODE_ENV === 'development';
const IS_TEST = process.env.NODE_ENV === 'test';

type LogArgs = unknown[];

export const logger = {
  /** 개발 환경에서만 출력 (프로덕션 억제) */
  log: (...args: LogArgs): void => {
    if (IS_DEV) console.log(...args);
  },

  /** 개발 환경에서만 출력 */
  info: (...args: LogArgs): void => {
    if (IS_DEV) console.info(...args);
  },

  /** 개발+테스트 환경에서만 출력 */
  warn: (...args: LogArgs): void => {
    if (IS_DEV || IS_TEST) console.warn(...args);
  },

  /** 항상 출력 (에러는 프로덕션에서도 필요) */
  error: (...args: LogArgs): void => {
    console.error(...args);
  },

  /** 진단 도구 전용 — 개발 환경에서만 */
  diagnostic: (...args: LogArgs): void => {
    if (IS_DEV) console.log(...args);
  },
};

export default logger;
