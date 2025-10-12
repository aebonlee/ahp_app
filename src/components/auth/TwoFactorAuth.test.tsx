import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TwoFactorAuth from './TwoFactorAuth';

// Mock QRCode module
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mocked-qr-code')
}));

// Mock crypto for TOTP generation
const mockCrypto = {
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  })
};

Object.defineProperty(window, 'crypto', {
  value: mockCrypto
});

describe('TwoFactorAuth Component', () => {
  const defaultProps = {
    userEmail: 'test@example.com',
    mode: 'setup' as const,
    onSetupComplete: jest.fn(),
    onDisable: jest.fn(),
    onVerificationSuccess: jest.fn(),
    onVerificationFailed: jest.fn(),
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Setup Mode', () => {
    it('renders setup step 1 with QR code', async () => {
      render(<TwoFactorAuth {...defaultProps} />);
      
      expect(screen.getByText('2단계 인증 설정')).toBeInTheDocument();
      expect(screen.getByText('1. 인증 앱으로 QR 코드 스캔')).toBeInTheDocument();
      expect(screen.getByText('권장 인증 앱:')).toBeInTheDocument();
      expect(screen.getByText('Google Authenticator')).toBeInTheDocument();
      
      // Wait for QR code to load
      await waitFor(() => {
        expect(screen.getByAltText('QR Code')).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: '다음 단계' })).toBeInTheDocument();
    });

    it('displays manual entry key when QR code loads', async () => {
      render(<TwoFactorAuth {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('수동 입력 키:')).toBeInTheDocument();
      });
    });

    it('progresses to step 2 when next button is clicked', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      render(<TwoFactorAuth {...defaultProps} />);
      
      // Wait for setup to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '다음 단계' })).not.toBeDisabled();
      });
      
      await userEvent.click(screen.getByRole('button', { name: '다음 단계' }));
      
      expect(screen.getByText('인증 코드 확인')).toBeInTheDocument();
      expect(screen.getByText('앱에서 생성된 6자리 코드를 입력하세요')).toBeInTheDocument();
    });

    it('validates verification code format in step 2', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      render(<TwoFactorAuth {...defaultProps} />);
      
      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '다음 단계' })).not.toBeDisabled();
      });
      await userEvent.click(screen.getByRole('button', { name: '다음 단계' }));
      
      const codeInput = screen.getByPlaceholderText('000000');
      const confirmButton = screen.getByRole('button', { name: '확인' });
      
      // Test invalid input (letters)
      await userEvent.type(codeInput, 'abc123');
      expect(codeInput).toHaveValue('123');
      
      // Test valid 6-digit code
      await userEvent.clear(codeInput);
      await userEvent.type(codeInput, '123456');
      expect(codeInput).toHaveValue('123456');
      expect(confirmButton).not.toBeDisabled();
    });

    it('progresses to step 3 when valid code is entered', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      render(<TwoFactorAuth {...defaultProps} />);
      
      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '다음 단계' })).not.toBeDisabled();
      });
      await userEvent.click(screen.getByRole('button', { name: '다음 단계' }));
      
      // Enter valid code
      const codeInput = screen.getByPlaceholderText('000000');
      await userEvent.type(codeInput, '123456');
      await userEvent.click(screen.getByRole('button', { name: '확인' }));
      
      await waitFor(() => {
        expect(screen.getByText('백업 코드 저장')).toBeInTheDocument();
      });
      
      expect(screen.getByText('안전한 곳에 백업 코드를 저장하세요')).toBeInTheDocument();
      expect(screen.getByText('백업 코드:')).toBeInTheDocument();
    });

    it('completes setup when setup complete button is clicked', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      const onSetupComplete = jest.fn();
      render(<TwoFactorAuth {...defaultProps} onSetupComplete={onSetupComplete} />);
      
      // Navigate through all steps
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '다음 단계' })).not.toBeDisabled();
      });
      await userEvent.click(screen.getByRole('button', { name: '다음 단계' }));
      
      const codeInput = screen.getByPlaceholderText('000000');
      await userEvent.type(codeInput, '123456');
      await userEvent.click(screen.getByRole('button', { name: '확인' }));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '설정 완료' })).toBeInTheDocument();
      });
      
      await userEvent.click(screen.getByRole('button', { name: '설정 완료' }));
      
      expect(onSetupComplete).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([expect.any(String)])
      );
    });
  });

  describe('Verify Mode', () => {
    const verifyProps = {
      ...defaultProps,
      mode: 'verify' as const
    };

    it('renders verification form', () => {
      render(<TwoFactorAuth {...verifyProps} />);
      
      expect(screen.getByText('2단계 인증')).toBeInTheDocument();
      expect(screen.getByText('계속하려면 인증 코드를 입력하세요')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '인증' })).toBeInTheDocument();
    });

    it('switches between TOTP and backup code input', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      render(<TwoFactorAuth {...verifyProps} />);
      
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
      expect(screen.getByText('백업 코드 사용')).toBeInTheDocument();
      
      await userEvent.click(screen.getByText('백업 코드 사용'));
      
      expect(screen.getByPlaceholderText('ABCD1234')).toBeInTheDocument();
      expect(screen.getByText('인증 앱 코드 사용')).toBeInTheDocument();
    });

    it('calls verification success on valid TOTP code', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      const onVerificationSuccess = jest.fn();
      render(<TwoFactorAuth {...verifyProps} onVerificationSuccess={onVerificationSuccess} />);
      
      const codeInput = screen.getByPlaceholderText('000000');
      await userEvent.type(codeInput, '123456');
      await userEvent.click(screen.getByRole('button', { name: '인증' }));
      
      expect(onVerificationSuccess).toHaveBeenCalledWith('123456');
    });

    it('calls verification success on valid backup code', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      const onVerificationSuccess = jest.fn();
      render(<TwoFactorAuth {...verifyProps} onVerificationSuccess={onVerificationSuccess} />);
      
      // Switch to backup code mode
      await userEvent.click(screen.getByText('백업 코드 사용'));
      
      const backupInput = screen.getByPlaceholderText('ABCD1234');
      await userEvent.type(backupInput, 'ABCD1234');
      await userEvent.click(screen.getByRole('button', { name: '인증' }));
      
      expect(onVerificationSuccess).toHaveBeenCalledWith('ABCD1234');
    });

    it('disables submit button for invalid code length', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      render(<TwoFactorAuth {...verifyProps} />);
      
      const codeInput = screen.getByPlaceholderText('000000');
      const submitButton = screen.getByRole('button', { name: '인증' });
      
      expect(submitButton).toBeDisabled();
      
      await userEvent.type(codeInput, '123');
      expect(submitButton).toBeDisabled();
      
      await userEvent.type(codeInput, '456');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Manage Mode', () => {
    const manageProps = {
      ...defaultProps,
      mode: 'manage' as const,
      isEnabled: true
    };

    it('renders management interface for enabled 2FA', () => {
      render(<TwoFactorAuth {...manageProps} />);
      
      expect(screen.getByText('2단계 인증 관리')).toBeInTheDocument();
      expect(screen.getByText('현재 2단계 인증이 활성화되어 있습니다')).toBeInTheDocument();
      expect(screen.getByText('보안 상태: 우수')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '새 기기 설정' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2단계 인증 비활성화' })).toBeInTheDocument();
    });

    it('calls disable callback when disable button is clicked', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      const onDisable = jest.fn();
      
      // Mock window.confirm
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(<TwoFactorAuth {...manageProps} onDisable={onDisable} />);
      
      await userEvent.click(screen.getByRole('button', { name: '2단계 인증 비활성화' }));
      
      expect(confirmSpy).toHaveBeenCalledWith(
        '2단계 인증을 비활성화하시겠습니까? 계정 보안이 약해질 수 있습니다.'
      );
      expect(onDisable).toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });

    it('does not call disable callback when confirmation is cancelled', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      const onDisable = jest.fn();
      
      // Mock window.confirm to return false
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(<TwoFactorAuth {...manageProps} onDisable={onDisable} />);
      
      await userEvent.click(screen.getByRole('button', { name: '2단계 인증 비활성화' }));
      
      expect(confirmSpy).toHaveBeenCalled();
      expect(onDisable).not.toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('shows loading state during verification', () => {
      render(<TwoFactorAuth {...defaultProps} mode="verify" loading={true} />);
      
      expect(screen.getByText('확인 중...')).toBeInTheDocument();
    });

    it('disables inputs during loading', () => {
      render(<TwoFactorAuth {...defaultProps} mode="verify" loading={true} />);
      
      expect(screen.getByRole('button', { name: '확인 중...' })).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('displays error messages', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      const onVerificationFailed = jest.fn();
      render(
        <TwoFactorAuth 
          {...defaultProps} 
          mode="verify" 
          onVerificationFailed={onVerificationFailed} 
        />
      );
      
      const codeInput = screen.getByPlaceholderText('000000');
      await userEvent.type(codeInput, '000000'); // Invalid code
      await userEvent.click(screen.getByRole('button', { name: '인증' }));
      
      await waitFor(() => {
        expect(screen.getByText('잘못된 인증 코드입니다. 다시 시도해주세요.')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper labels and ARIA attributes', () => {
      render(<TwoFactorAuth {...defaultProps} mode="verify" />);
      
      const codeInput = screen.getByLabelText('인증 코드 (6자리)');
      expect(codeInput).toHaveAttribute('maxLength', '6');
      expect(codeInput).toHaveAttribute('placeholder', '000000');
    });

    it('maintains focus order through steps', async () => {
      // const user = userEvent.setup(); // 최신 버전에서는 direct call 사용
      render(<TwoFactorAuth {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '다음 단계' })).not.toBeDisabled();
      });
      
      // Check that buttons are focusable
      const nextButton = screen.getByRole('button', { name: '다음 단계' });
      expect(nextButton).toBeInTheDocument();
      
      await userEvent.tab();
      expect(nextButton).toHaveFocus();
    });
  });
});