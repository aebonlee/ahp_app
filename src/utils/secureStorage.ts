/**
 * 보안 강화된 스토리지 유틸리티
 * localStorage 사용을 암호화와 함께 안전하게 처리
 */

// 간단한 암호화/복호화 함수 (실제 운영환경에서는 더 강력한 암호화 사용 권장)
const STORAGE_KEY = 'ahp_secure_';
const ENCRYPTION_SECRET = 'ahp_platform_2025';

/**
 * 간단한 문자열 암호화 (XOR 기반)
 * 주의: 이는 기본적인 난독화이며, 실제 운영환경에서는 AES 등 강력한 암호화 사용 권장
 */
const encrypt = (text: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ ENCRYPTION_SECRET.charCodeAt(i % ENCRYPTION_SECRET.length)
    );
  }
  return btoa(result); // Base64 인코딩
};

/**
 * 간단한 문자열 복호화
 */
const decrypt = (encryptedText: string): string => {
  try {
    const decoded = atob(encryptedText); // Base64 디코딩
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ ENCRYPTION_SECRET.charCodeAt(i % ENCRYPTION_SECRET.length)
      );
    }
    return result;
  } catch (error) {
    console.error('복호화 실패:', error);
    return '';
  }
};

/**
 * 보안 스토리지 인터페이스
 */
export interface SecureStorage {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * 암호화된 localStorage 구현
 */
class EncryptedLocalStorage implements SecureStorage {
  setItem(key: string, value: string): void {
    try {
      const encryptedValue = encrypt(value);
      localStorage.setItem(STORAGE_KEY + key, encryptedValue);
    } catch (error) {
      console.error('암호화된 저장 실패:', error);
    }
  }

  getItem(key: string): string | null {
    try {
      const encryptedValue = localStorage.getItem(STORAGE_KEY + key);
      if (!encryptedValue) return null;
      return decrypt(encryptedValue);
    } catch (error) {
      console.error('암호화된 조회 실패:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(STORAGE_KEY + key);
  }

  clear(): void {
    // AHP 관련 암호화된 항목만 제거
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEY))
      .forEach(key => localStorage.removeItem(key));
  }
}

/**
 * sessionStorage 구현 (암호화 선택적)
 */
class SecureSessionStorage implements SecureStorage {
  private useEncryption: boolean;

  constructor(useEncryption = false) {
    this.useEncryption = useEncryption;
  }

  setItem(key: string, value: string): void {
    try {
      const finalValue = this.useEncryption ? encrypt(value) : value;
      sessionStorage.setItem(STORAGE_KEY + key, finalValue);
    } catch (error) {
      console.error('세션 저장 실패:', error);
    }
  }

  getItem(key: string): string | null {
    try {
      const storedValue = sessionStorage.getItem(STORAGE_KEY + key);
      if (!storedValue) return null;
      return this.useEncryption ? decrypt(storedValue) : storedValue;
    } catch (error) {
      console.error('세션 조회 실패:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(STORAGE_KEY + key);
  }

  clear(): void {
    Object.keys(sessionStorage)
      .filter(key => key.startsWith(STORAGE_KEY))
      .forEach(key => sessionStorage.removeItem(key));
  }
}

/**
 * 메모리 기반 스토리지 (가장 안전하지만 새로고침 시 초기화)
 */
class MemoryStorage implements SecureStorage {
  private storage: Map<string, string> = new Map();

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * 스토리지 팩토리
 */
export class SecureStorageFactory {
  /**
   * 암호화된 localStorage (권장: 사용자 설정, 비민감 데이터)
   */
  static createEncryptedLocalStorage(): SecureStorage {
    return new EncryptedLocalStorage();
  }

  /**
   * sessionStorage (권장: 임시 토큰, 세션 데이터)
   */
  static createSessionStorage(useEncryption = false): SecureStorage {
    return new SecureSessionStorage(useEncryption);
  }

  /**
   * 메모리 스토리지 (최고 보안: 민감한 인증 토큰)
   */
  static createMemoryStorage(): SecureStorage {
    return new MemoryStorage();
  }

  /**
   * 하이브리드 스토리지 (현재 AHP 패턴과 유사)
   * sessionStorage 우선, localStorage 폴백
   */
  static createHybridStorage(): {
    setItem: (key: string, value: string, persistent?: boolean) => void;
    getItem: (key: string) => string | null;
    removeItem: (key: string) => void;
    clear: () => void;
  } {
    const sessionStore = new SecureSessionStorage(false);
    const localStore = new EncryptedLocalStorage();

    return {
      setItem: (key: string, value: string, persistent = false) => {
        sessionStore.setItem(key, value);
        if (persistent) {
          localStore.setItem(key, value);
        }
      },
      getItem: (key: string) => {
        return sessionStore.getItem(key) || localStore.getItem(key);
      },
      removeItem: (key: string) => {
        sessionStore.removeItem(key);
        localStore.removeItem(key);
      },
      clear: () => {
        sessionStore.clear();
        localStore.clear();
      }
    };
  }
}

/**
 * 기본 인스턴스들
 */
export const encryptedLocalStorage = SecureStorageFactory.createEncryptedLocalStorage();
export const secureSessionStorage = SecureStorageFactory.createSessionStorage(false);
export const memoryStorage = SecureStorageFactory.createMemoryStorage();
export const hybridStorage = SecureStorageFactory.createHybridStorage();

/**
 * 레거시 localStorage 마이그레이션 유틸리티
 */
export const migrateLegacyStorage = () => {
  const legacyKeys = [
    'ahp_user',
    'ahp_access_token', 
    'ahp_refresh_token',
    'ahp_temp_role',
    'ahp_super_mode'
  ];

  legacyKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      // 새로운 암호화된 스토리지로 이동
      encryptedLocalStorage.setItem(key.replace('ahp_', ''), value);
      // 기존 키 제거
      localStorage.removeItem(key);
      console.log(`✅ ${key} 마이그레이션 완료`);
    }
  });
};