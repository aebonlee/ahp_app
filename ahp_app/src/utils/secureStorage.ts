/**
 * 보안 강화된 스토리지 유틸리티
 * Web Crypto API (AES-GCM) 기반 암호화 + localStorage/sessionStorage/Memory
 *
 * NOTE: 클라이언트 측 암호화는 XSS 공격 시 키도 노출되므로 완벽하지 않음.
 * 민감 데이터는 가능하면 서버에 저장하고, 여기서는 난독화 수준의 보호 제공.
 */

const STORAGE_KEY = 'ahp_secure_';

// AES-GCM 키 도출을 위한 salt (환경 변수 또는 고정값)
const KEY_MATERIAL = process.env.REACT_APP_ENCRYPTION_SECRET || 'ahp-default-key';

/**
 * Web Crypto API를 이용한 AES-GCM 암호화
 */
async function deriveKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(KEY_MATERIAL),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('ahp-salt-v1'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptAsync(text: string): Promise<string> {
  try {
    const key = await deriveKey();
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(text)
    );
    // iv + ciphertext를 결합하여 Base64로 인코딩
    const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(Array.from(combined, b => String.fromCharCode(b)).join(''));
  } catch {
    // Web Crypto 미지원 환경 fallback: Base64만
    return btoa(unescape(encodeURIComponent(text)));
  }
}

async function decryptAsync(encryptedText: string): Promise<string> {
  try {
    const key = await deriveKey();
    const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    // fallback: Base64 디코딩 시도
    try {
      return decodeURIComponent(escape(atob(encryptedText)));
    } catch {
      return '';
    }
  }
}

/**
 * 동기 fallback (Web Crypto 미사용, Base64 난독화만)
 */
function encryptSync(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}

function decryptSync(encoded: string): string {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return '';
  }
}

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
 * 비동기 보안 스토리지 인터페이스 (AES-GCM 사용 시)
 */
export interface AsyncSecureStorage {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * 암호화된 localStorage 구현 (동기 - Base64 난독화)
 */
class EncryptedLocalStorage implements SecureStorage {
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(STORAGE_KEY + key, encryptSync(value));
    } catch {
      // 스토리지 용량 초과 등
    }
  }

  getItem(key: string): string | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + key);
      if (!stored) return null;
      return decryptSync(stored);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(STORAGE_KEY + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEY))
      .forEach(key => localStorage.removeItem(key));
  }
}

/**
 * AES-GCM 암호화 localStorage (비동기)
 */
class AesEncryptedLocalStorage implements AsyncSecureStorage {
  async setItem(key: string, value: string): Promise<void> {
    try {
      const encrypted = await encryptAsync(value);
      localStorage.setItem(STORAGE_KEY + key, encrypted);
    } catch {
      // 스토리지 용량 초과 등
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + key);
      if (!stored) return null;
      return await decryptAsync(stored);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(STORAGE_KEY + key);
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEY))
      .forEach(key => localStorage.removeItem(key));
  }
}

/**
 * sessionStorage 구현
 */
class SecureSessionStorage implements SecureStorage {
  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(STORAGE_KEY + key, value);
    } catch {
      // 스토리지 용량 초과 등
    }
  }

  getItem(key: string): string | null {
    return sessionStorage.getItem(STORAGE_KEY + key);
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
 * 메모리 기반 스토리지 (가장 안전, 새로고침 시 초기화)
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
  static createEncryptedLocalStorage(): SecureStorage {
    return new EncryptedLocalStorage();
  }

  static createAesEncryptedLocalStorage(): AsyncSecureStorage {
    return new AesEncryptedLocalStorage();
  }

  static createSessionStorage(): SecureStorage {
    return new SecureSessionStorage();
  }

  static createMemoryStorage(): SecureStorage {
    return new MemoryStorage();
  }
}

/**
 * 기본 인스턴스
 */
export const encryptedLocalStorage = SecureStorageFactory.createEncryptedLocalStorage();
export const aesEncryptedLocalStorage = SecureStorageFactory.createAesEncryptedLocalStorage();
export const secureSessionStorage = SecureStorageFactory.createSessionStorage();
export const memoryStorage = SecureStorageFactory.createMemoryStorage();
