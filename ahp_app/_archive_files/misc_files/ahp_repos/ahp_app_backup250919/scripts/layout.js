// 레이아웃 관련 JavaScript 함수들

// 사이드바 토글
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.getElementById('toggle-icon');
    
    sidebar.classList.toggle('collapsed');
    toggleIcon.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
    
    // 로컬 스토리지에 상태 저장
    localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
}

// 로그아웃
function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        // 세션 정리
        sessionStorage.clear();
        localStorage.removeItem('currentUser');
        window.location.href = '/ahp_app/';
    }
}

// 현재 페이지에 따라 메뉴 활성화
function setActiveMenu(menuId) {
    // 모든 사이드바 항목에서 active 클래스 제거
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 현재 메뉴에 active 클래스 추가
    const activeItem = document.querySelector(`[data-menu="${menuId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// 현재 페이지에 따라 헤더 네비게이션 활성화
function setActiveHeaderNav(pageId) {
    // 모든 헤더 네비게이션 항목에서 active 클래스 제거
    document.querySelectorAll('.header-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 현재 페이지에 active 클래스 추가
    const activeItem = document.querySelector(`[data-page="${pageId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// 사용자 정보 업데이트
function updateUserInfo(user) {
    if (!user) {
        // 기본값 사용
        user = {
            name: '김철수',
            role: 'Personal Admin',
            initial: '김'
        };
    }
    
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    
    if (userAvatar) userAvatar.textContent = user.initial || user.name.charAt(0);
    if (userName) userName.textContent = user.name;
    if (userRole) userRole.textContent = user.role;
}

// 프로젝트 개수 업데이트
function updateProjectCount(count) {
    const badge = document.querySelector('[data-menu="my-projects"] .sidebar-badge');
    if (badge) {
        badge.textContent = count;
    }
}

// 백엔드 상태 확인
async function checkBackendStatus() {
    try {
        const response = await fetch('https://ahp-django-backend.onrender.com/api/service/status/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            console.log('✅ Django 백엔드 정상 연결');
            return true;
        } else {
            console.warn('⚠️ Django 백엔드 응답 오류');
            return false;
        }
    } catch (error) {
        console.error('❌ Django 백엔드 연결 실패:', error);
        return false;
    }
}

// 페이지별 초기화 함수
function initializePage(pageConfig) {
    // 기본 설정
    const config = {
        menuId: '',
        pageId: '',
        title: 'AHP System',
        ...pageConfig
    };
    
    // 문서 제목 설정
    document.title = `AHP System - ${config.title}`;
    
    // 메뉴 활성화
    if (config.menuId) {
        setActiveMenu(config.menuId);
    }
    
    // 헤더 네비게이션 활성화
    if (config.pageId) {
        setActiveHeaderNav(config.pageId);
    }
    
    // 사이드바 상태 복원
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed) {
        const sidebar = document.getElementById('sidebar');
        const toggleIcon = document.getElementById('toggle-icon');
        if (sidebar) {
            sidebar.classList.add('collapsed');
            if (toggleIcon) {
                toggleIcon.textContent = '▶';
            }
        }
    }
    
    // 사용자 정보 로드
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            updateUserInfo(user);
        } catch (e) {
            console.error('사용자 정보 파싱 오류:', e);
        }
    }
    
    // 백엔드 상태 확인
    checkBackendStatus();
}

// 공통 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 사이드바 메뉴 클릭 이벤트
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                // 개발 중인 메뉴 알림
                const menuName = this.querySelector('span:nth-child(2)').textContent;
                alert(`"${menuName}" 기능은 개발 중입니다.`);
            }
        });
    });
    
    // 헤더 네비게이션 클릭 이벤트
    document.querySelectorAll('.header-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                // 개발 중인 메뉴 알림
                const pageName = this.textContent;
                alert(`"${pageName}" 페이지는 개발 중입니다.`);
            }
        });
    });
    
    // ESC 키로 사이드바 토글 (개발 편의)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            toggleSidebar();
        }
    });
});

// 내보내기
window.layoutUtils = {
    toggleSidebar,
    handleLogout,
    setActiveMenu,
    setActiveHeaderNav,
    updateUserInfo,
    updateProjectCount,
    checkBackendStatus,
    initializePage
};