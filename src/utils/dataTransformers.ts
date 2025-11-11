/**
 * 데이터 변환 유틸리티
 * 백엔드와 프론트엔드 간 데이터 형식을 변환합니다.
 */

import { Criterion, Alternative, Evaluator } from '../types/ahp';

/**
 * snake_case를 camelCase로 변환
 */
export function toCamelCase<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase) as any;
  }
  
  const result: any = {};
  
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    
    if (obj[key] && typeof obj[key] === 'object') {
      result[camelKey] = toCamelCase(obj[key]);
    } else {
      result[camelKey] = obj[key];
    }
  });
  
  return result;
}

/**
 * camelCase를 snake_case로 변환
 */
export function toSnakeCase<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase) as any;
  }
  
  const result: any = {};
  
  Object.keys(obj).forEach(key => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    
    if (obj[key] && typeof obj[key] === 'object') {
      result[snakeKey] = toSnakeCase(obj[key]);
    } else {
      result[snakeKey] = obj[key];
    }
  });
  
  return result;
}

/**
 * 백엔드 Criterion 데이터를 프론트엔드 형식으로 변환
 */
export function transformCriterion(data: any): Criterion {
  return {
    id: data.id,
    projectId: data.project_id || data.projectId,
    name: data.name,
    description: data.description,
    parentId: data.parent_id || data.parentId || null,
    level: data.level || 0,
    order: data.order || 0,
    weight: data.weight,
    localWeight: data.local_weight || data.localWeight,
    globalWeight: data.global_weight || data.globalWeight,
    children: data.children ? data.children.map(transformCriterion) : [],
    isLeaf: data.is_leaf || data.isLeaf || false,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt
  };
}

/**
 * 백엔드 Alternative 데이터를 프론트엔드 형식으로 변환
 */
export function transformAlternative(data: any): Alternative {
  return {
    id: data.id,
    projectId: data.project_id || data.projectId,
    name: data.name,
    description: data.description,
    order: data.order || 0,
    score: data.score,
    rank: data.rank,
    metadata: data.metadata || {},
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt
  };
}

/**
 * 백엔드 Evaluator 데이터를 프론트엔드 형식으로 변환
 */
export function transformEvaluator(data: any): Evaluator {
  return {
    id: data.id,
    projectId: data.project_id || data.projectId,
    userId: data.user_id || data.userId,
    name: data.name,
    email: data.email,
    role: data.role || 'participant',
    status: data.status || 'invited',
    invitationCode: data.invitation_code || data.invitationCode,
    invitationToken: data.invitation_token || data.invitationToken,
    invitedAt: data.invited_at || data.invitedAt,
    acceptedAt: data.accepted_at || data.acceptedAt,
    completedAt: data.completed_at || data.completedAt,
    progress: data.progress || 0,
    createdAt: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt
  };
}

/**
 * 배열 데이터 변환
 */
export function transformArray<T>(
  data: any[],
  transformer: (item: any) => T
): T[] {
  if (!Array.isArray(data)) return [];
  return data.map(transformer);
}

/**
 * API 응답 데이터 정규화
 */
export function normalizeApiResponse<T>(
  response: any,
  transformer?: (data: any) => T
): T | T[] {
  // 페이지네이션 응답 처리
  if (response.results && Array.isArray(response.results)) {
    return transformer 
      ? response.results.map(transformer)
      : response.results;
  }
  
  // 배열 응답 처리
  if (Array.isArray(response)) {
    return transformer 
      ? response.map(transformer)
      : response;
  }
  
  // 단일 객체 응답 처리
  return transformer ? transformer(response) : response;
}

/**
 * 계층 구조 빌드
 */
export function buildHierarchy(flatData: Criterion[]): Criterion[] {
  const itemMap = new Map<string, Criterion>();
  const rootItems: Criterion[] = [];
  
  // 모든 아이템을 맵에 저장
  flatData.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] });
  });
  
  // 부모-자식 관계 구성
  itemMap.forEach(item => {
    if (item.parentId) {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(item);
      }
    } else {
      rootItems.push(item);
    }
  });
  
  return rootItems;
}

/**
 * 계층 구조 평탄화
 */
export function flattenHierarchy(hierarchicalData: Criterion[]): Criterion[] {
  const result: Criterion[] = [];
  
  function traverse(items: Criterion[], level = 0) {
    items.forEach(item => {
      result.push({ ...item, level });
      if (item.children && item.children.length > 0) {
        traverse(item.children, level + 1);
      }
    });
  }
  
  traverse(hierarchicalData);
  return result;
}

/**
 * ID로 아이템 찾기 (계층 구조)
 */
export function findItemById(
  items: Criterion[],
  id: string
): Criterion | undefined {
  for (const item of items) {
    if (item.id === id) return item;
    
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  
  return undefined;
}

/**
 * 부모 경로 찾기
 */
export function findParentPath(
  items: Criterion[],
  targetId: string,
  path: Criterion[] = []
): Criterion[] | null {
  for (const item of items) {
    if (item.id === targetId) {
      return path;
    }
    
    if (item.children) {
      const newPath = [...path, item];
      const found = findParentPath(item.children, targetId, newPath);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * 날짜 형식 변환
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '';
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
}

/**
 * 안전한 JSON 파싱
 */
export function safeJsonParse<T>(
  jsonString: string,
  defaultValue: T
): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
}

/**
 * 깊은 복사
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  const cloned: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * 객체 병합 (깊은 병합)
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  
  if (source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = target[key];
        
        if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
          if (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
            target[key] = deepMerge(targetValue, sourceValue);
          } else {
            target[key] = deepClone(sourceValue) as any;
          }
        } else {
          target[key] = sourceValue as any;
        }
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

export default {
  toCamelCase,
  toSnakeCase,
  transformCriterion,
  transformAlternative,
  transformEvaluator,
  transformArray,
  normalizeApiResponse,
  buildHierarchy,
  flattenHierarchy,
  findItemById,
  findParentPath,
  formatDate,
  safeJsonParse,
  deepClone,
  deepMerge
};