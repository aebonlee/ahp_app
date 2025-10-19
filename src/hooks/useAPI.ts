/**
 * API 호출을 위한 커스텀 Hook
 */

import { useCallback } from 'react';

interface APIResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  blob?: () => Promise<Blob>;
}

export const useAPI = () => {
  const post = useCallback(async <T = any>(url: string, data?: any): Promise<APIResponse<T>> => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Blob 응답인 경우
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/')) {
        return {
          ok: true,
          blob: () => response.blob()
        };
      }

      // JSON 응답인 경우
      const result = await response.json();
      return {
        ok: true,
        data: result
      };
    } catch (error) {
      console.error('API call failed:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const get = useCallback(async <T = any>(url: string): Promise<APIResponse<T>> => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        ok: true,
        data: result
      };
    } catch (error) {
      console.error('API call failed:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const put = useCallback(async <T = any>(url: string, data?: any): Promise<APIResponse<T>> => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        ok: true,
        data: result
      };
    } catch (error) {
      console.error('API call failed:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const del = useCallback(async <T = any>(url: string): Promise<APIResponse<T>> => {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        ok: true,
        data: result
      };
    } catch (error) {
      console.error('API call failed:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  return {
    get,
    post,
    put,
    delete: del
  };
};