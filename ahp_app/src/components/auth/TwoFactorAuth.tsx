import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, ShieldCheckIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { PhoneIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';
import QRCode from 'qrcode';

interface TwoFactorAuthProps {
  userEmail: string;
  isEnabled?: boolean;
  onSetupComplete?: (secret: string, backupCodes: string[]) => void;
  onDisable?: () => void;
  onVerificationSuccess?: (code: string) => void;
  onVerificationFailed?: (error: string) => void;
  loading?: boolean;
  mode?: 'setup' | 'verify' | 'manage';
}

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  userEmail,
  isEnabled = false,
  onSetupComplete,
  onDisable,
  onVerificationSuccess,
  onVerificationFailed,
  loading = false,
  mode = 'setup'
}) => {
  const [currentMode, setCurrentMode] = useState<'setup' | 'verify' | 'manage'>(mode);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Generate TOTP secret and QR code
  const generateTwoFactorSetup = async () => {
    try {
      // Generate a random secret (base32 encoded)
      const secret = generateBase32Secret();
      const serviceName = 'AHP Platform';
      const accountName = userEmail;
      
      // Create TOTP URL for QR code
      const totpUrl = `otpauth://totp/${serviceName}:${accountName}?secret=${secret}&issuer=${serviceName}`;
      
      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(totpUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Generate backup codes
      const backupCodes = generateBackupCodes();

      const setup: TwoFactorSetup = {
        secret,
        qrCodeUrl: totpUrl,
        backupCodes,
        manualEntryKey: formatSecretForManualEntry(secret)
      };

      setTwoFactorSetup(setup);
      setQrCodeDataUrl(qrCodeDataUrl);
      setError('');
    } catch (err) {
      setError('2단계 인증 설정을 생성하는 중 오류가 발생했습니다.');
      console.error('2FA setup generation error:', err);
    }
  };

  // Generate base32 secret
  const generateBase32Secret = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  // Generate backup codes
  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  // Format secret for manual entry
  const formatSecretForManualEntry = (secret: string): string => {
    return secret.match(/.{1,4}/g)?.join(' ') || secret;
  };

  // Verify TOTP code (simplified implementation)
  const verifyTOTPCode = (code: string, secret: string): boolean => {
    // In a real implementation, this would use proper TOTP verification
    // For now, we'll simulate verification based on current time window
    const currentTime = Math.floor(Date.now() / 1000 / 30);
    const validCodes = [
      generateTOTPCode(secret, currentTime - 1),
      generateTOTPCode(secret, currentTime),
      generateTOTPCode(secret, currentTime + 1)
    ];
    return validCodes.includes(code);
  };

  // Generate TOTP code (simplified implementation)
  const generateTOTPCode = (secret: string, timeStep: number): string => {
    // This is a simplified implementation
    // In production, use a proper TOTP library like 'otplib'
    const hash = simpleHash(secret + timeStep.toString());
    return (hash % 1000000).toString().padStart(6, '0');
  };

  // Simple hash function (for demonstration only)
  const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Handle verification
  const handleVerification = () => {
    if (!twoFactorSetup) return;

    setError('');
    
    if (useBackupCode) {
      if (twoFactorSetup.backupCodes.includes(backupCode.toUpperCase())) {
        setSuccess('백업 코드 인증 성공!');
        onVerificationSuccess?.(backupCode);
      } else {
        setError('잘못된 백업 코드입니다.');
        onVerificationFailed?.('Invalid backup code');
      }
    } else {
      if (verifyTOTPCode(verificationCode, twoFactorSetup.secret)) {
        setSuccess('인증 코드 확인 완료!');
        if (currentMode === 'setup') {
          setIsSetupComplete(true);
          setStep(3);
        } else {
          onVerificationSuccess?.(verificationCode);
        }
      } else {
        setError('잘못된 인증 코드입니다. 다시 시도해주세요.');
        onVerificationFailed?.('Invalid verification code');
      }
    }
  };

  // Complete setup
  const completeSetup = () => {
    if (twoFactorSetup) {
      onSetupComplete?.(twoFactorSetup.secret, twoFactorSetup.backupCodes);
      setSuccess('2단계 인증이 성공적으로 설정되었습니다!');
    }
  };

  // Initialize setup on mount
  useEffect(() => {
    if (currentMode === 'setup' && !twoFactorSetup) {
      generateTwoFactorSetup();
    }
  }, [currentMode]);

  // Reset error when input changes
  useEffect(() => {
    setError('');
  }, [verificationCode, backupCode]);

  // Setup mode - Step 1: QR Code display
  const renderSetupStep1 = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <ShieldCheckIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">2단계 인증 설정</h2>
        <p className="text-gray-600 mt-2">계정 보안을 강화하세요</p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">1. 인증 앱으로 QR 코드 스캔</h3>
          {qrCodeDataUrl ? (
            <div className="bg-white p-4 rounded-lg border inline-block">
              <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">QR 코드 생성 중...</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">권장 인증 앱:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Google Authenticator</li>
            <li>• Microsoft Authenticator</li>
            <li>• Authy</li>
            <li>• 1Password</li>
          </ul>
        </div>

        {twoFactorSetup && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">수동 입력 키:</h4>
            <p className="text-sm font-mono bg-white p-2 rounded border">
              {twoFactorSetup.manualEntryKey}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              QR 코드를 스캔할 수 없는 경우 위 키를 수동으로 입력하세요
            </p>
          </div>
        )}

        <button
          onClick={() => setStep(2)}
          disabled={!twoFactorSetup}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          다음 단계
        </button>
      </div>
    </div>
  );

  // Setup mode - Step 2: Verification
  const renderSetupStep2 = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <DevicePhoneMobileIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">인증 코드 확인</h2>
        <p className="text-gray-600 mt-2">앱에서 생성된 6자리 코드를 입력하세요</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            인증 코드 (6자리)
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="000000"
            maxLength={6}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <p className="ml-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <p className="ml-2 text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => setStep(1)}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            이전
          </button>
          <button
            onClick={handleVerification}
            disabled={verificationCode.length !== 6 || loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '확인 중...' : '확인'}
          </button>
        </div>
      </div>
    </div>
  );

  // Setup mode - Step 3: Backup codes
  const renderSetupStep3 = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">백업 코드 저장</h2>
        <p className="text-gray-600 mt-2">안전한 곳에 백업 코드를 저장하세요</p>
      </div>

      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-2">
              <h4 className="text-sm font-medium text-yellow-800">중요!</h4>
              <p className="text-sm text-yellow-700 mt-1">
                휴대폰을 분실한 경우 이 백업 코드로 계정에 접근할 수 있습니다.
                각 코드는 한 번만 사용 가능합니다.
              </p>
            </div>
          </div>
        </div>

        {twoFactorSetup && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">백업 코드:</h4>
            <div className="grid grid-cols-2 gap-2">
              {twoFactorSetup.backupCodes.map((code, index) => (
                <div key={index} className="bg-white p-2 rounded border text-center">
                  <span className="font-mono text-sm">{code}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => {
              const text = twoFactorSetup?.backupCodes.join('\n') || '';
              navigator.clipboard.writeText(text);
              setSuccess('백업 코드가 클립보드에 복사되었습니다!');
            }}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            복사
          </button>
          <button
            onClick={completeSetup}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );

  // Verify mode
  const renderVerifyMode = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <ShieldCheckIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">2단계 인증</h2>
        <p className="text-gray-600 mt-2">계속하려면 인증 코드를 입력하세요</p>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <button
            onClick={() => setUseBackupCode(!useBackupCode)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {useBackupCode ? '인증 앱 코드 사용' : '백업 코드 사용'}
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {useBackupCode ? '백업 코드' : '인증 코드 (6자리)'}
          </label>
          <input
            type="text"
            value={useBackupCode ? backupCode : verificationCode}
            onChange={(e) => {
              if (useBackupCode) {
                setBackupCode(e.target.value.toUpperCase().slice(0, 8));
              } else {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }
            }}
            className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={useBackupCode ? 'ABCD1234' : '000000'}
            maxLength={useBackupCode ? 8 : 6}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <p className="ml-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleVerification}
          disabled={
            (useBackupCode ? backupCode.length !== 8 : verificationCode.length !== 6) || loading
          }
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '확인 중...' : '인증'}
        </button>
      </div>
    </div>
  );

  // Manage mode
  const renderManageMode = () => (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <ShieldCheckIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">2단계 인증 관리</h2>
        <p className="text-gray-600 mt-2">현재 2단계 인증이 활성화되어 있습니다</p>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-2">
              <h4 className="text-sm font-medium text-green-800">보안 상태: 우수</h4>
              <p className="text-sm text-green-700 mt-1">
                2단계 인증이 활성화되어 계정이 안전하게 보호되고 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setCurrentMode('setup')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            새 기기 설정
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('2단계 인증을 비활성화하시겠습니까? 계정 보안이 약해질 수 있습니다.')) {
                onDisable?.();
              }
            }}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            2단계 인증 비활성화
          </button>
        </div>
      </div>
    </div>
  );

  // Main render logic
  if (currentMode === 'setup') {
    if (step === 1) return renderSetupStep1();
    if (step === 2) return renderSetupStep2();
    if (step === 3) return renderSetupStep3();
  }

  if (currentMode === 'verify') {
    return renderVerifyMode();
  }

  if (currentMode === 'manage') {
    return renderManageMode();
  }

  return null;
};

export default TwoFactorAuth;