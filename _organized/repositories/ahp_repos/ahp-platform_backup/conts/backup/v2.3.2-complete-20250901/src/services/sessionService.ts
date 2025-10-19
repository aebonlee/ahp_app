// 세션 관리 서비스 (Cookie 기반)
class SessionService {
  private static instance: SessionService;
  private sessionTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30분 (밀리초)
  private readonly WARNING_TIME = 5 * 60 * 1000; // 5분 전 경고 (밀리초)

  private constructor() {
    this.initializeSession();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // 세션 초기화 (Cookie 기반 인증으로 변경)
  private initializeSession(): void {
    // 쿠키 기반 인증에서는 서버가 세션 관리를 담당
    // 클라이언트는 세션 상태 확인만 수행
    this.checkSessionStatus();
  }

  // 로그인 시 세션 시작 (Cookie 기반)
  public startSession(): void {
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
    // 서버에 세션 연장 요청
    this.refreshSession();
    this.startSessionTimer(); // 타이머 재시작
    this.hideSessionWarning();
    console.log('세션이 30분 연장되었습니다.');
  }

  // 마지막 활동 시간 업데이트 (Cookie 기반에서는 불필요)
  public updateLastActivity(): void {
    // 쿠키 기반 인증에서는 서버가 자동으로 세션 활동을 추적
    // 클라이언트에서는 별도 저장 불필요
  }

  // 세션 상태 확인 (서버에서 확인)
  public async isSessionValid(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include',
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // 남은 세션 시간 (서버에서 조회)
  public async getRemainingTime(): Promise<number> {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include',
        method: 'GET'
      });
      const data = await response.json();
      return data.remainingTime || 0;
    } catch (error) {
      return 0;
    }
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
  private async forceLogout(): Promise<void> {
    this.clearTimers();
    this.hideSessionWarning();
    
    // 서버에 로그아웃 요청
    try {
      await fetch('/api/auth/logout', {
        credentials: 'include',
        method: 'POST'
      });
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    }
    
    // 페이지 새로고침으로 로그인 페이지로 이동
    console.log('세션이 만료되어 로그아웃되었습니다.');
    window.location.reload();
  }

  // 수동 로그아웃
  public async logout(): Promise<void> {
    this.clearTimers();
    this.hideSessionWarning();
    
    // 서버에 로그아웃 요청
    try {
      await fetch('/api/auth/logout', {
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

  // 세션 상태 확인 (Cookie 기반에서는 토큰 반환 불필요)
  public async checkSessionStatus(): Promise<boolean> {
    return await this.isSessionValid();
  }

  // 세션 새로고침
  private async refreshSession(): Promise<void> {
    try {
      await fetch('/api/auth/profile', {
        credentials: 'include',
        method: 'POST'
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