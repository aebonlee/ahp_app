import authService from './authService';

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
    // 30분 세션 타이머 시작
    this.clearTimers();
    this.resumeSessionTimer(this.SESSION_DURATION);

    // 토큰 만료 이벤트 리스너 등록
    this.setupTokenExpirationListener();
  }

  // JWT 토큰 만료 이벤트 리스너 설정
  private setupTokenExpirationListener(): void {
    window.addEventListener('auth:tokenExpired', () => {
      this.logout();
    });
  }

  // 세션 타이머 시작 (30분 기본)
  private startSessionTimer(): void {
    this.clearTimers();
    this.resumeSessionTimer(this.SESSION_DURATION);
  }

  // 세션 타이머 재개 (JWT 기반에서는 사용하지 않음)
  private resumeSessionTimer(remainingTime: number): void {
    // JWT 기반에서는 authService가 자동으로 토큰 상태를 관리

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
    // JWT 토큰 자동 갱신은 api.ts makeRequest()의 refreshToken() 로직이 처리
    // 여기서는 클라이언트 측 세션 타이머만 재시작

    // 30분(1800초) 연장을 위한 타이머 재시작
    this.clearTimers();
    this.resumeSessionTimer(this.SESSION_DURATION); // 새로운 30분 세션 시작
    this.hideSessionWarning();

    // 사용자에게 연장 확인 알림
    this.showExtensionConfirmation();
  }

  // 마지막 활동 시간 업데이트 및 세션 연장
  public updateLastActivity(): void {
    // 현재 세션이 유효한 경우에만 활동 업데이트
    if (this.sessionTimer) {
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

  // 슬라이드인 애니메이션 CSS 추가 (한 번만)
  private ensureAnimationStyle(): void {
    if (document.getElementById('session-slide-style')) return;
    const style = document.createElement('style');
    style.id = 'session-slide-style';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // 세션 경고 표시
  private showSessionWarning(): void {
    this.hideSessionWarning();
    this.ensureAnimationStyle();

    const warningDiv = document.createElement('div');
    warningDiv.id = 'session-warning';
    warningDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background-color: #f97316; color: white; padding: 16px;
      border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      min-width: 350px; animation: slideIn 0.3s ease-out;
    `;

    const container = document.createElement('div');
    container.style.cssText = 'display: flex; align-items: center; justify-content: space-between;';

    const textBlock = document.createElement('div');

    const title = document.createElement('h4');
    title.style.cssText = 'font-weight: 600; font-size: 16px; margin: 0;';
    title.textContent = '⚠️ 세션 만료 경고';

    const countdownP = document.createElement('p');
    countdownP.style.cssText = 'font-size: 14px; margin-top: 4px; margin-bottom: 0;';
    countdownP.textContent = '5분 후 자동 로그아웃됩니다.';

    const saveP = document.createElement('p');
    saveP.style.cssText = 'font-size: 12px; margin-top: 4px; opacity: 0.9;';
    saveP.textContent = '작업 내용을 저장하세요.';

    textBlock.appendChild(title);
    textBlock.appendChild(countdownP);
    textBlock.appendChild(saveP);

    const extendBtn = document.createElement('button');
    extendBtn.id = 'extend-session-btn';
    extendBtn.style.cssText = `
      margin-left: 16px; background-color: white; color: #f97316;
      padding: 8px 16px; border-radius: 4px; border: none;
      font-size: 14px; font-weight: 500; cursor: pointer;
    `;
    extendBtn.textContent = '30분 연장';
    extendBtn.addEventListener('mouseover', () => { extendBtn.style.backgroundColor = '#f3f4f6'; });
    extendBtn.addEventListener('mouseout', () => { extendBtn.style.backgroundColor = 'white'; });
    extendBtn.addEventListener('click', () => { this.extendSession(); });

    container.appendChild(textBlock);
    container.appendChild(extendBtn);
    warningDiv.appendChild(container);
    document.body.appendChild(warningDiv);

    let countdown = 5;
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        countdownP.textContent = `${countdown}분 후 자동 로그아웃됩니다.`;
      } else {
        clearInterval(countdownInterval);
      }
    }, 60000);
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
    this.ensureAnimationStyle();

    const confirmDiv = document.createElement('div');
    confirmDiv.id = 'session-extension-confirm';
    confirmDiv.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background-color: #10b981; color: white; padding: 16px;
      border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      min-width: 300px; animation: slideIn 0.3s ease-out;
    `;

    const container = document.createElement('div');
    container.style.cssText = 'display: flex; align-items: center;';

    const textBlock = document.createElement('div');

    const title = document.createElement('h4');
    title.style.cssText = 'font-weight: 600; font-size: 16px; margin: 0;';
    title.textContent = '✅ 세션 연장 완료';

    const msg = document.createElement('p');
    msg.style.cssText = 'font-size: 14px; margin-top: 4px; margin-bottom: 0;';
    msg.textContent = '30분이 추가되었습니다.';

    textBlock.appendChild(title);
    textBlock.appendChild(msg);
    container.appendChild(textBlock);
    confirmDiv.appendChild(container);
    document.body.appendChild(confirmDiv);

    setTimeout(() => { confirmDiv.remove(); }, 3000);
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
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%); z-index: 10000;
      background-color: #dc2626; color: white; padding: 24px;
      border-radius: 12px; box-shadow: 0 25px 50px rgba(0,0,0,0.25);
      text-align: center; min-width: 400px;
    `;

    const logoutContent = document.createElement('div');

    const logoutTitle = document.createElement('h3');
    logoutTitle.style.cssText = 'font-weight: 700; font-size: 20px; margin: 0 0 8px 0;';
    logoutTitle.textContent = '🔒 세션 만료';

    const logoutMsg = document.createElement('p');
    logoutMsg.style.cssText = 'font-size: 16px; margin: 0 0 16px 0;';
    logoutMsg.textContent = '30분 세션이 만료되어 자동 로그아웃되었습니다.';

    const logoutHint = document.createElement('p');
    logoutHint.style.cssText = 'font-size: 14px; opacity: 0.9; margin: 0;';
    logoutHint.textContent = '다시 로그인해주세요.';

    logoutContent.appendChild(logoutTitle);
    logoutContent.appendChild(logoutMsg);
    logoutContent.appendChild(logoutHint);
    logoutDiv.appendChild(logoutContent);
    document.body.appendChild(logoutDiv);

    // 3초 후 로그아웃 처리
    setTimeout(() => {
      logoutDiv.remove();

      // localStorage 제거됨 - JWT 기반 세션 관리

      // 콜백을 통해 App 상태 업데이트
      if (this.logoutCallback) {
        this.logoutCallback();
      } else {
        window.location.reload();
      }
    }, 3000);
  }

  // 수동 로그아웃 (프론트엔드 전용 - 서버 요청 없음)
  public async logout(): Promise<void> {
    this.clearTimers();
    this.hideSessionWarning();
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

}

// 싱글톤 인스턴스 내보내기
const sessionService = SessionService.getInstance();

// 페이지 활동 감지로 세션 활성화
document.addEventListener('click', () => sessionService.updateLastActivity());
document.addEventListener('keypress', () => sessionService.updateLastActivity());
document.addEventListener('scroll', () => sessionService.updateLastActivity());

export default sessionService;
