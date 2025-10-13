import authService from './authService';
import { API_BASE_URL } from '../config/api';

// 세션 관리 서비스 (JWT 기반 - localStorage 제거됨)
class SessionService {
  private static instance: SessionService;
  private sessionTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30분 (밀리초)
  private readonly WARNING_TIME = 5 * 60 * 1000; // 5분 전 경고 (밀리초)
  private logoutCallback: (() => void) | null = null;

  private constructor() {
    this.initializeSession();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // 세션 초기화 (JWT 기반으로 변경 - localStorage 제거)
  private initializeSession(): void {
    // JWT 기반 인증에서는 서버가 세션 관리를 담당
    // 클라이언트는 세션 상태 확인만 수행
    this.checkSessionStatus();
    
    // localStorage 제거됨 - JWT 토큰 만료 시간에 따라 서버에서 처리
  }

  // 로그인 시 세션 시작 (30분 세션)
  public startSession(): void {
    console.log('30분 세션이 시작되었습니다.');
    
    // 30분 세션 타이머 시작
    this.clearTimers();
    this.resumeSessionTimer(this.SESSION_DURATION);
    
    // 토큰 만료 이벤트 리스너 등록
    this.setupTokenExpirationListener();
  }

  // JWT 토큰 만료 이벤트 리스너 설정
  private setupTokenExpirationListener(): void {
    window.addEventListener('auth:tokenExpired', () => {
      console.log('JWT 토큰 만료 - 자동 로그아웃');
      this.logout();
    });
  }

  // 세션 타이머 시작 (30분 기본)
  private startSessionTimer(): void {
    console.log('30분 세션 타이머 시작');
    this.clearTimers();
    this.resumeSessionTimer(this.SESSION_DURATION);
  }

  // 세션 타이머 재개 (JWT 기반에서는 사용하지 않음)
  private resumeSessionTimer(remainingTime: number): void {
    // JWT 기반에서는 authService가 자동으로 토큰 상태를 관리
    console.log('JWT 기반 인증: 토큰 자동 갱신으로 세션 유지');
    
    console.log(`세션 타이머 재개: 남은 시간 ${Math.floor(remainingTime / 60000)}분`);
    
    // 5분 이상 남았으면 경고 타이머 설정
    if (remainingTime > this.WARNING_TIME) {
      this.warningTimer = setTimeout(() => {
        this.showSessionWarning();
      }, remainingTime - this.WARNING_TIME);
    } else if (remainingTime > 0) {
      // 5분 이하 남았으면 바로 경고 표시
      this.showSessionWarning();
    }
    
    // 남은 시간 후 자동 로그아웃
    this.sessionTimer = setTimeout(() => {
      this.forceLogout();
    }, remainingTime);
  }

  // 세션 연장 (30분 추가)
  public extendSession(): void {
    // JWT 토큰 연장은 서버에서 처리
    // TODO: API 호출로 서버 세션 연장 처리
    
    // 30분(1800초) 연장을 위한 타이머 재시작
    this.clearTimers();
    this.resumeSessionTimer(this.SESSION_DURATION); // 새로운 30분 세션 시작
    this.hideSessionWarning();
    
    console.log('세션이 30분 연장되었습니다.');
    
    // 사용자에게 연장 확인 알림
    this.showExtensionConfirmation();
  }

  // 마지막 활동 시간 업데이트 및 세션 연장
  public updateLastActivity(): void {
    // 현재 세션이 유효한 경우에만 활동 업데이트
    if (this.sessionTimer) {
      console.log('사용자 활동 감지 - 세션 갱신');
      // 새로운 30분 세션으로 갱신
      this.clearTimers();
      this.resumeSessionTimer(this.SESSION_DURATION);
    }
  }

  // 세션 상태 확인 (JWT 기반)
  public async isSessionValid(): Promise<boolean> {
    // JWT 토큰 유효성을 authService에서 확인
    return authService.isAuthenticated();
  }

  // 남은 세션 시간 (JWT 기반)
  public async getRemainingTime(): Promise<number> {
    const token = authService.getAccessToken();
    if (!token) return 0;
    
    try {
      // JWT 토큰에서 만료 시간 추출
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // 밀리초로 변환
      const currentTime = Date.now();
      const remainingTime = expirationTime - currentTime;
      
      return Math.max(0, Math.floor(remainingTime / 60000)); // 분 단위로 반환
    } catch {
      return 0;
    }
  }

  // 세션 경고 표시
  private showSessionWarning(): void {
    // 이미 경고가 표시되어 있으면 제거
    this.hideSessionWarning();
    
    // 경고 알림 표시
    const warningDiv = document.createElement('div');
    warningDiv.id = 'session-warning';
    warningDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background-color: #f97316;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      min-width: 350px;
      animation: slideIn 0.3s ease-out;
    `;
    
    warningDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h4 style="font-weight: 600; font-size: 16px; margin: 0;">⚠️ 세션 만료 경고</h4>
          <p style="font-size: 14px; margin-top: 4px; margin-bottom: 0;">5분 후 자동 로그아웃됩니다.</p>
          <p style="font-size: 12px; margin-top: 4px; opacity: 0.9;">작업 내용을 저장하세요.</p>
        </div>
        <button 
          id="extend-session-btn"
          style="
            margin-left: 16px;
            background-color: white;
            color: #f97316;
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          "
          onmouseover="this.style.backgroundColor='#f3f4f6'"
          onmouseout="this.style.backgroundColor='white'"
        >
          30분 연장
        </button>
      </div>
    `;
    
    // 애니메이션 CSS 추가
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(warningDiv);
    
    // 연장하기 버튼 이벤트
    const extendBtn = document.getElementById('extend-session-btn');
    if (extendBtn) {
      extendBtn.addEventListener('click', () => {
        this.extendSession();
      });
    }
    
    // 5초마다 남은 시간 업데이트
    let countdown = 5;
    const countdownInterval = setInterval(() => {
      countdown--;
      const pElement = warningDiv.querySelector('p');
      if (pElement && countdown > 0) {
        pElement.textContent = `${countdown}분 후 자동 로그아웃됩니다.`;
      } else {
        clearInterval(countdownInterval);
      }
    }, 60000); // 1분마다 업데이트
  }

  // 세션 경고 숨기기
  private hideSessionWarning(): void {
    const warningDiv = document.getElementById('session-warning');
    if (warningDiv) {
      warningDiv.remove();
    }
  }

  // 세션 연장 확인 알림
  private showExtensionConfirmation(): void {
    const confirmDiv = document.createElement('div');
    confirmDiv.id = 'session-extension-confirm';
    confirmDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background-color: #10b981;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      min-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    confirmDiv.innerHTML = `
      <div style="display: flex; align-items: center;">
        <div>
          <h4 style="font-weight: 600; font-size: 16px; margin: 0;">✅ 세션 연장 완료</h4>
          <p style="font-size: 14px; margin-top: 4px; margin-bottom: 0;">30분이 추가되었습니다.</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmDiv);
    
    // 3초 후 자동 제거
    setTimeout(() => {
      confirmDiv.remove();
    }, 3000);
  }

  // 로그아웃 콜백 설정
  public setLogoutCallback(callback: () => void): void {
    this.logoutCallback = callback;
  }

  // 강제 로그아웃
  private async forceLogout(): Promise<void> {
    this.clearTimers();
    this.hideSessionWarning();
    
    // 세션 만료 알림 표시
    const logoutDiv = document.createElement('div');
    logoutDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      background-color: #dc2626;
      color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25);
      text-align: center;
      min-width: 400px;
    `;
    
    logoutDiv.innerHTML = `
      <div>
        <h3 style="font-weight: 700; font-size: 20px; margin: 0 0 8px 0;">🔒 세션 만료</h3>
        <p style="font-size: 16px; margin: 0 0 16px 0;">30분 세션이 만료되어 자동 로그아웃되었습니다.</p>
        <p style="font-size: 14px; opacity: 0.9; margin: 0;">다시 로그인해주세요.</p>
      </div>
    `;
    
    document.body.appendChild(logoutDiv);
    
    // 3초 후 로그아웃 처리
    setTimeout(() => {
      logoutDiv.remove();
      
      // localStorage 제거됨 - JWT 기반 세션 관리
      
      console.log('세션이 만료되어 로그아웃되었습니다.');
      
      // 콜백을 통해 App 상태 업데이트
      if (this.logoutCallback) {
        this.logoutCallback();
      } else {
        window.location.reload();
      }
    }, 3000);
  }

  // 수동 로그아웃
  public async logout(): Promise<void> {
    this.clearTimers();
    this.hideSessionWarning();
    
    // 서버에 로그아웃 요청
    try {
      await fetch(`${API_BASE_URL}/api/service/auth/logout/`, {
        credentials: 'include',
        method: 'POST'
      });
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    }
    
    console.log('로그아웃되었습니다.');
  }

  // 타이머 정리
  private clearTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  // 세션 상태 확인 (JWT 기반)
  public async checkSessionStatus(): Promise<boolean> {
    // JWT 기반에서는 authService의 토큰 상태를 확인
    return authService.isAuthenticated();
  }

  // 세션 새로고침
  private async refreshSession(): Promise<void> {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        console.log('⚠️ 토큰 없음 - 세션 새로고침 건너뜀');
        return;
      }

      await fetch(`${API_BASE_URL}/api/service/auth/profile/`, {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('세션 새로고침 실패:', error);
    }
  }
}

// 싱글톤 인스턴스 내보내기
const sessionService = SessionService.getInstance();

// 페이지 활동 감지로 세션 활성화
document.addEventListener('click', () => sessionService.updateLastActivity());
document.addEventListener('keypress', () => sessionService.updateLastActivity());
document.addEventListener('scroll', () => sessionService.updateLastActivity());

export default sessionService;