// 세션 관리 서비스 (서버 전용 - 브라우저 스토리지 사용 금지)
class SessionService {
  private static instance: SessionService;
  private sessionTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private readonly SESSION_DURATION = 2 * 60 * 60 * 1000; // 2시간 (밀리초) - 서버가 관리
  private readonly WARNING_TIME = 10 * 60 * 1000; // 10분 전 경고 (밀리초)
  private logoutCallback: (() => void) | null = null;

  private constructor() {
    this.initializeSession();
    this.setupActivityListeners();
  }
  
  // 사용자 활동 감지 리스너 설정 (서버 세션 활성화용)
  private setupActivityListeners(): void {
    const activityEvents = ['click', 'scroll', 'keypress', 'mousemove'];
    let lastActivity = Date.now();
    
    const handleActivity = () => {
      const now = Date.now();
      // 5초 이내의 중복 활동은 무시 (과도한 업데이트 방지)
      if (now - lastActivity > 5000) {
        lastActivity = now;
        // localStorage 사용 금지 - 서버가 활동을 자동 추적
        this.notifyServerActivity();
      }
    };
    
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
  }

  // 서버에 활동 알림 (브라우저 스토리지 대신)
  private async notifyServerActivity(): Promise<void> {
    try {
      await fetch('https://ahp-django-backend.onrender.com/accounts/web/activity/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      // 활동 알림 실패는 무시 (필수가 아님)
    }
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // 세션 초기화 (서버 전용 - localStorage 사용 금지)
  private async initializeSession(): Promise<void> {
    // 서버에서 세션 상태 확인
    const isValid = await this.checkServerSession();
    if (isValid) {
      console.log('서버 세션 확인됨');
    } else {
      console.log('서버 세션 없음');
    }
  }

  // 서버 세션 확인 (브라우저 스토리지 대신)
  private async checkServerSession(): Promise<boolean> {
    try {
      const response = await fetch('https://ahp-django-backend.onrender.com/accounts/web/session-check/', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      return false;
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

  // 세션 연장 (서버에서 처리)
  public async extendSession(): Promise<void> {
    try {
      // 서버에 세션 연장 요청 (localStorage 사용 금지)
      await fetch('https://ahp-django-backend.onrender.com/accounts/web/extend-session/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      this.startSessionTimer(); // 타이머 재시작
      this.hideSessionWarning();
      console.log('서버에서 세션이 연장되었습니다.');
    } catch (error) {
      console.error('세션 연장 실패:', error);
    }
  }

  // 마지막 활동 시간 업데이트 (Cookie 기반에서는 불필요)
  public updateLastActivity(): void {
    // 쿠키 기반 인증에서는 서버가 자동으로 세션 활동을 추적
    // 클라이언트에서는 별도 저장 불필요
  }

  // 세션 상태 확인 (서버에서만 확인)
  public async isSessionValid(): Promise<boolean> {
    return await this.checkServerSession();
  }

  // 남은 세션 시간 (서버에서 계산)
  public async getRemainingTime(): Promise<number> {
    try {
      const response = await fetch('https://ahp-django-backend.onrender.com/accounts/web/session-time/', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.remaining_minutes || 0;
      }
      return 0;
    } catch (error) {
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
      
      // localStorage 사용 금지 - 서버에서 세션 삭제됨
      
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

  // 세션 상태 확인 (서버 전용)
  public async checkSessionStatus(): Promise<boolean> {
    return await this.checkServerSession();
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