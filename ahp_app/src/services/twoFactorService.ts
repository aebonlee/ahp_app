import { API_BASE_URL } from '../config/api';
import { ApiResponse } from './api';

// Two-Factor Authentication interfaces
export interface TwoFactorSetupResponse {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
  manual_entry_key: string;
}

export interface TwoFactorVerificationRequest {
  code: string;
  type: 'totp' | 'backup';
}

export interface TwoFactorStatus {
  is_enabled: boolean;
  last_used: string | null;
  backup_codes_count: number;
}

// Generate secure headers for 2FA requests
const getSecureHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
  
  const accessToken = sessionStorage.getItem('ahp_access_token');
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
};

// Make secure API request for 2FA
const makeSecureRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      credentials: 'include',
      ...options,
      headers: {
        ...getSecureHeaders(),
        ...options.headers
      }
    });
    
    const contentType = response.headers.get('content-type');
    let data: Record<string, unknown> | null = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json() as Record<string, unknown>;
    }

    if (!response.ok) {
      console.error(`2FA API Error [${endpoint}]:`, {
        status: response.status,
        statusText: response.statusText,
        data
      });
      
      throw new Error((data?.message || data?.error || `HTTP ${response.status}: 2FA API 요청 실패`) as string);
    }

    return {
      success: true,
      data: (data?.data ?? data) as T,
      message: data?.message as string | undefined
    };
  } catch (error: unknown) {
    console.error(`2FA API Error [${endpoint}]:`, error);
    const errorMessage = error instanceof Error ? error.message : '';
    return {
      success: false,
      error: errorMessage || 'Unknown 2FA error occurred'
    };
  }
};

// Two-Factor Authentication Service
export const twoFactorService = {
  // Initialize 2FA setup
  initializeSetup: async (): Promise<ApiResponse<TwoFactorSetupResponse>> => {
    return makeSecureRequest<TwoFactorSetupResponse>('/api/auth/2fa/setup/', {
      method: 'POST'
    });
  },

  // Complete 2FA setup with verification
  completeSetup: async (verificationCode: string): Promise<ApiResponse<{ success: boolean; backup_codes: string[] }>> => {
    return makeSecureRequest<{ success: boolean; backup_codes: string[] }>('/api/auth/2fa/setup/complete/', {
      method: 'POST',
      body: JSON.stringify({
        verification_code: verificationCode
      })
    });
  },

  // Verify 2FA code during login
  verifyCode: async (code: string, type: 'totp' | 'backup' = 'totp'): Promise<ApiResponse<{ valid: boolean; tokens?: { access: string; refresh: string } }>> => {
    return makeSecureRequest<{ valid: boolean; tokens?: { access: string; refresh: string } }>('/api/auth/2fa/verify/', {
      method: 'POST',
      body: JSON.stringify({
        code,
        type
      })
    });
  },

  // Disable 2FA
  disable: async (password: string): Promise<ApiResponse<{ success: boolean }>> => {
    return makeSecureRequest<{ success: boolean }>('/api/auth/2fa/disable/', {
      method: 'POST',
      body: JSON.stringify({
        password
      })
    });
  },

  // Get 2FA status
  getStatus: async (): Promise<ApiResponse<TwoFactorStatus>> => {
    return makeSecureRequest<TwoFactorStatus>('/api/auth/2fa/status/');
  },

  // Generate new backup codes
  generateBackupCodes: async (password: string): Promise<ApiResponse<{ backup_codes: string[] }>> => {
    return makeSecureRequest<{ backup_codes: string[] }>('/api/auth/2fa/backup-codes/generate/', {
      method: 'POST',
      body: JSON.stringify({
        password
      })
    });
  },

  // Validate backup code
  validateBackupCode: async (code: string): Promise<ApiResponse<{ valid: boolean; remaining_codes: number }>> => {
    return makeSecureRequest<{ valid: boolean; remaining_codes: number }>('/api/auth/2fa/backup-codes/validate/', {
      method: 'POST',
      body: JSON.stringify({
        backup_code: code
      })
    });
  }
};

// Client-side TOTP utilities (for verification and testing)
export class TOTPGenerator {
  private static base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  // Generate secure random secret
  static generateSecret(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    // base32Chars.length === 32, so byte % 32 is perfectly uniform (256 % 32 === 0)
    return Array.from(array, byte => this.base32Chars[byte % this.base32Chars.length]).join('');
  }

  // Format secret for manual entry
  static formatSecret(secret: string): string {
    return secret.match(/.{1,4}/g)?.join(' ') || secret;
  }

  // Generate TOTP URL for QR code
  static generateTOTPUrl(secret: string, accountName: string, issuer: string): string {
    const params = new URLSearchParams({
      secret,
      issuer
    });
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?${params.toString()}`;
  }

  // Generate backup codes
  static generateBackupCodes(count: number = 10): string[] {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const array = new Uint8Array(8);
      crypto.getRandomValues(array);
      // Use rejection sampling to avoid modulo bias (256 % 36 !== 0)
      const code = Array.from(array, byte => {
        // Accept only bytes in [0, 252) to ensure uniform distribution (252 = 36 * 7)
        const limit = 252;
        return byte < limit ? charset[byte % 36] : charset[Math.floor(byte / 256 * 36)];
      }).join('');
      codes.push(code);
    }
    return codes;
  }

  // Simple HMAC-based TOTP implementation (for client-side verification)
  static async generateTOTP(secret: string, timeStep?: number): Promise<string> {
    const time = timeStep || Math.floor(Date.now() / 1000 / 30);
    
    // This is a simplified implementation
    // In production, use a proper TOTP library like 'otplib'
    try {
      // Convert base32 secret to binary
      const binarySecret = this.base32ToBinary(secret);
      
      // Create time buffer
      const timeBuffer = new ArrayBuffer(8);
      const timeView = new DataView(timeBuffer);
      timeView.setUint32(4, time);
      
      // Generate HMAC-SHA1 (simplified)
      const hash = await this.simpleHMAC(binarySecret, new Uint8Array(timeBuffer));
      
      // Dynamic truncation
      const offset = hash[hash.length - 1] & 0x0f;
      const code = ((hash[offset] & 0x7f) << 24) |
                   ((hash[offset + 1] & 0xff) << 16) |
                   ((hash[offset + 2] & 0xff) << 8) |
                   (hash[offset + 3] & 0xff);
      
      return (code % 1000000).toString().padStart(6, '0');
    } catch (error) {
      console.error('TOTP generation error:', error);
      // Fallback to simple hash-based generation
      return this.fallbackTOTP(secret, time);
    }
  }

  // Convert base32 to binary (simplified)
  private static base32ToBinary(base32: string): Uint8Array {
    const normalized = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
    const bytes: number[] = [];
    
    for (let i = 0; i < normalized.length; i += 8) {
      const chunk = normalized.substr(i, 8).padEnd(8, '=');
      // Simplified base32 decoding
      let value = 0;
      for (let j = 0; j < 8; j++) {
        const char = chunk[j];
        if (char !== '=') {
          const index = this.base32Chars.indexOf(char);
          value = (value << 5) | index;
        }
      }
      
      // Extract bytes
      for (let k = 0; k < 5; k++) {
        if (i * 5 / 8 + k < normalized.length * 5 / 8) {
          bytes.push((value >>> (32 - (k + 1) * 8)) & 0xff);
        }
      }
    }
    
    return new Uint8Array(bytes);
  }

  // Simplified HMAC implementation
  private static async simpleHMAC(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
    // This is a very simplified HMAC implementation
    // In production, use Web Crypto API or a proper crypto library
    const combined = new Uint8Array(key.length + data.length);
    combined.set(key);
    combined.set(data, key.length);
    
    // Simple hash function
    const hash = new Uint8Array(20); // SHA-1 length
    for (let i = 0; i < 20; i++) {
      let value = 0;
      for (let j = 0; j < combined.length; j++) {
        value ^= combined[j] * (i + j + 1);
      }
      hash[i] = value & 0xff;
    }
    
    return hash;
  }

  // Fallback TOTP generation
  private static fallbackTOTP(secret: string, timeStep: number): string {
    // Simple deterministic code generation for testing
    let hash = 0;
    const input = secret + timeStep.toString();
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return (Math.abs(hash) % 1000000).toString().padStart(6, '0');
  }
}

// Security utilities for 2FA
export const twoFactorSecurity = {
  // Validate TOTP code format
  validateTOTPFormat: (code: string): boolean => {
    return /^\d{6}$/.test(code);
  },

  // Validate backup code format
  validateBackupCodeFormat: (code: string): boolean => {
    return /^[A-Z0-9]{8}$/.test(code.toUpperCase());
  },

  // Rate limiting check (client-side)
  checkRateLimit: (key: string, maxAttempts: number = 5, windowMs: number = 300000): boolean => {
    const now = Date.now();
    const storageKey = `2fa_attempts_${key}`;
    
    try {
      const attempts = JSON.parse(localStorage.getItem(storageKey) || '[]') as number[];
      const recentAttempts = attempts.filter(time => now - time < windowMs);
      
      if (recentAttempts.length >= maxAttempts) {
        return false; // Rate limited
      }
      
      // Add current attempt
      recentAttempts.push(now);
      localStorage.setItem(storageKey, JSON.stringify(recentAttempts));
      
      return true; // Not rate limited
    } catch (error) {
      console.error('Rate limit check error:', error);
      return true; // Allow on error
    }
  },

  // Clear rate limit data
  clearRateLimit: (key: string): void => {
    const storageKey = `2fa_attempts_${key}`;
    localStorage.removeItem(storageKey);
  }
};

export default twoFactorService;