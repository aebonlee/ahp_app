/**
 * Memory Storage Service
 * localStorage를 사용하지 않고 메모리에만 데이터를 저장
 * 브라우저 새로고침 시 데이터가 유지되지 않음
 */

class MemoryStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }

  hasOwnProperty(key: string): boolean {
    return this.store.has(key);
  }
}

// 싱글톤 인스턴스
const memoryStorage = new MemoryStorage();

// localStorage 오버라이드
if (typeof window !== 'undefined') {
  // localStorage를 memoryStorage로 대체
  Object.defineProperty(window, 'localStorage', {
    value: memoryStorage,
    writable: false,
    configurable: false
  });
}

export default memoryStorage;