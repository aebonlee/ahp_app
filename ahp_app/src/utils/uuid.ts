/**
 * UUID 생성 유틸리티 함수
 * PostgreSQL의 UUID 필드와 호환되는 UUID를 생성합니다.
 */

/**
 * RFC 4122 규격을 준수하는 UUID v4를 생성합니다.
 * @returns UUID 문자열 (예: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx")
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * UUID 형식이 유효한지 검증합니다.
 * @param uuid 검증할 UUID 문자열
 * @returns 유효한 UUID인 경우 true, 아니면 false
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * 임시 ID가 UUID 형식인지 확인합니다.
 * 만약 UUID가 아니라면 새로운 UUID를 생성하여 반환합니다.
 * @param id 확인할 ID
 * @returns 유효한 UUID 또는 새로 생성된 UUID
 */
export const ensureValidUUID = (id?: string): string => {
  if (!id || !isValidUUID(id)) {
    return generateUUID();
  }
  return id;
};

/**
 * 임시 ID가 temp_ 형식인지 확인합니다.
 * @param id 확인할 ID
 * @returns temp_ 형식이면 true
 */
export const isTempId = (id: string): boolean => {
  return /^(temp_|criterion[_-]|node[_-])/.test(id);
};