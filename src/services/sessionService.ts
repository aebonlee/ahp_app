// 세션 관리 서비스 (Cookie 기반)
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

  // 세션 초기화 (Cookie 기반 인증으로 변경)
  private initializeSession(): void {
    // 쿠키 기반 인증에서는 서버가 세션 관리를 담당
    // 클라이언트는 세션 상태 확인만 수행
    this.checkSessionStatus();
    
    // 페이지 로드 시 기존 세션이 있으면 타이머 재시작
    const loginTime = localStorage.getItem('login_time');
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime);
      if (elapsed < this.SESSION_DURATION) {
        // 남은 시간만큼 타이머 설정
        this.resumeSessionTimer(this.SESSION_DURATION - elapsed);
      } else {
        // 세션 만료
        this.forceLogout();
      }
    }
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

  // 세션 타이머 재개 (페이지 새로고침 후)
  private resumeSessionTimer(remainingTime: number): void {
    this.clearTimers();
    
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

  // 세션 연장
  public extendSession(): void {
    // 로그인 시간 갱신
    localStorage.setItem('login_time', Date.now().toString());
    localStorage.setItem('last_activity', Date.now().toString());
    
    this.startSessionTimer(); // 타이머 재시작
    this.hideSessionWarning();
    console.log('세션이 30분 연장되었습니다.');
  }

  // 마지막 활동 시간 업데이트 (Cookie 기반에서는 불필요)
  public updateLastActivity(): void {
    // 쿠키 기반 인증에서는 서버가 자동으로 세션 활동을 추적
    // 클라이언트에서는 별도 저장 불필요
  }

  // 세션 상태 확인 (클라이언트 사이드)
  public async isSessionValid(): Promise<boolean> {
    // localStorage에서 로그인 시간 확인
    const loginTime = localStorage.getItem('login_time');
    if (!loginTime) return false;
    
    // 30분 경과 여부 확인
    const elapsed = Date.now() - parseInt(loginTime);
    return elapsed < this.SESSION_DURATION;
  }

  // 남은 세션 시간 (클라이언트 사이드 계산)
  public async getRemainingTime(): Promise<number> {
    const loginTime = localStorage.getItem('login_time');
    if (!loginTime) return 0;
    
    const elapsed = Date.now() - parseInt(loginTime);
    const remaining = Math.max(0, this.SESSION_DURATION - elapsed);
    return Math.floor(remaining / 60000); // 분 단위로 반환
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
      
      // localStorage 세션 정보 삭제
      localStorage.removeItem('login_time');
      localStorage.removeItem('last_activity');
      
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
      await fetch('https://ahp-django-backend.onrender.com/api/logout/', {
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
      await fetch('https://ahp-django-backend.onrender.com/api/user/', {
        credentials: 'include',
        method: 'GET'
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