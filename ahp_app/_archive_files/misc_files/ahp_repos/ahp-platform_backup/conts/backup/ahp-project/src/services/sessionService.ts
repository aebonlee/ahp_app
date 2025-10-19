// 세션 관리 서비스
class SessionService {
  private static instance: SessionService;
  private sessionTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30분 (밀리초)
  private readonly WARNING_TIME = 5 * 60 * 1000; // 5분 전 경고 (밀리초)
  private readonly STORAGE_KEYS = {
    TOKEN: 'auth_token',
    LOGIN_TIME: 'login_time',
    LAST_ACTIVITY: 'last_activity'
  };

  private constructor() {
    this.initializeSession();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // 세션 초기화 (새로고침 시에도 호출)
  private initializeSession(): void {
    const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
    const lastActivity = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY);
    
    if (token && lastActivity) {
      const lastActivityTime = parseInt(lastActivity, 10);
      const currentTime = Date.now();
      const timeDiff = currentTime - lastActivityTime;
      
      // 30분이 지나지 않았다면 세션 복구
      if (timeDiff < this.SESSION_DURATION) {
        this.startSessionTimer();
        this.updateLastActivity();
        console.log('세션이 복구되었습니다.');
      } else {
        console.log('세션이 만료되어 로그아웃됩니다.');
        this.forceLogout();
      }
    }
  }

  // 로그인 시 세션 시작
  public startSession(token: string): void {
    const currentTime = Date.now();
    
    localStorage.setItem(this.STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(this.STORAGE_KEYS.LOGIN_TIME, currentTime.toString());
    localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, currentTime.toString());
    
    this.startSessionTimer();
    console.log('세션이 시작되었습니다. (30분)');
  }

  // 세션 타이머 시작
  private startSessionTimer(): void {
    this.clearTimers();
    
    // 5분 전 경고 타이머
    this.warningTimer = setTimeout(() => {
      this.showSessionWarning();
    }, this.SESSION_DURATION - this.WARNING_TIME);
    
    // 30분 후 자동 로그아웃 타이머
    this.sessionTimer = setTimeout(() => {
      this.forceLogout();
    }, this.SESSION_DURATION);
  }

  // 세션 연장
  public extendSession(): void {
    const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
    if (!token) {
      console.warn('로그인 상태가 아닙니다.');
      return;
    }

    const currentTime = Date.now();
    localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, currentTime.toString());
    
    this.startSessionTimer(); // 타이머 재시작
    this.hideSessionWarning();
    console.log('세션이 30분 연장되었습니다.');
  }

  // 마지막 활동 시간 업데이트
  public updateLastActivity(): void {
    const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
    if (token) {
      const currentTime = Date.now();
      localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVITY, currentTime.toString());
    }
  }

  // 세션 상태 확인
  public isSessionValid(): boolean {
    const token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
    const lastActivity = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY);
    
    if (!token || !lastActivity) {
      return false;
    }
    
    const lastActivityTime = parseInt(lastActivity, 10);
    const currentTime = Date.now();
    const timeDiff = currentTime - lastActivityTime;
    
    return timeDiff < this.SESSION_DURATION;
  }

  // 남은 세션 시간 (분 단위)
  public getRemainingTime(): number {
    const lastActivity = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVITY);
    if (!lastActivity) return 0;
    
    const lastActivityTime = parseInt(lastActivity, 10);
    const currentTime = Date.now();
    const timeDiff = currentTime - lastActivityTime;
    const remaining = this.SESSION_DURATION - timeDiff;
    
    return Math.max(0, Math.floor(remaining / 60000)); // 분 단위
  }

  // 세션 경고 표시
  private showSessionWarning(): void {
    // 경고 알림 표시
    const warningDiv = document.createElement('div');
    warningDiv.id = 'session-warning';
    warningDiv.className = 'fixed top-4 right-4 z-50 bg-orange-500 text-white p-4 rounded-lg shadow-lg';
    warningDiv.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold">세션 만료 경고</h4>
          <p class="text-sm mt-1">5분 후 자동 로그아웃됩니다.</p>
        </div>
        <button 
          id="extend-session-btn"
          class="ml-4 bg-white text-orange-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
        >
          연장하기
        </button>
      </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // 연장하기 버튼 이벤트
    const extendBtn = document.getElementById('extend-session-btn');
    if (extendBtn) {
      extendBtn.addEventListener('click', () => {
        this.extendSession();
      });
    }
  }

  // 세션 경고 숨기기
  private hideSessionWarning(): void {
    const warningDiv = document.getElementById('session-warning');
    if (warningDiv) {
      warningDiv.remove();
    }
  }

  // 강제 로그아웃
  private forceLogout(): void {
    this.clearTimers();
    this.hideSessionWarning();
    
    // 로컬 스토리지에서 인증 정보 제거
    localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.LOGIN_TIME);
    localStorage.removeItem(this.STORAGE_KEYS.LAST_ACTIVITY);
    
    // 페이지 새로고침으로 로그인 페이지로 이동
    console.log('세션이 만료되어 로그아웃되었습니다.');
    window.location.reload();
  }

  // 수동 로그아웃
  public logout(): void {
    this.clearTimers();
    this.hideSessionWarning();
    
    localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.LOGIN_TIME);
    localStorage.removeItem(this.STORAGE_KEYS.LAST_ACTIVITY);
    
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

  // 현재 토큰 반환
  public getToken(): string | null {
    if (this.isSessionValid()) {
      return localStorage.getItem(this.STORAGE_KEYS.TOKEN);
    }
    return null;
  }
}

// 싱글톤 인스턴스 내보내기
const sessionService = SessionService.getInstance();

// 페이지 활동 감지로 세션 활성화
document.addEventListener('click', () => sessionService.updateLastActivity());
document.addEventListener('keypress', () => sessionService.updateLastActivity());
document.addEventListener('scroll', () => sessionService.updateLastActivity());

export default sessionService;