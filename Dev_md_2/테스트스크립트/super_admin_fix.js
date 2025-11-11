// 슈퍼 관리자 권한 강제 설정 스크립트
// 브라우저 콘솔에서 실행하세요

function forceSuperAdmin() {
    const user = JSON.parse(localStorage.getItem('ahp_user') || '{}');
    
    if (user.email === 'admin@ahp.com' || user.id === 1) {
        // role을 super_admin으로 강제 설정
        user.role = 'super_admin';
        user.is_super_admin = true;
        user.admin_type = 'super';
        
        localStorage.setItem('ahp_user', JSON.stringify(user));
        console.log('✅ 슈퍼 관리자 권한 설정 완료!');
        console.log('현재 user:', user);
        
        // 강제로 토글 버튼 생성
        if (!document.getElementById('force-super-toggle')) {
            const button = document.createElement('div');
            button.id = 'force-super-toggle';
            button.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 999999;
                    background: linear-gradient(45deg, #ff0000, #ffff00);
                    color: black;
                    padding: 15px 25px;
                    border-radius: 10px;
                    font-weight: bold;
                    font-size: 18px;
                    cursor: pointer;
                    border: 3px solid black;
                    box-shadow: 0 0 20px rgba(255,0,0,0.5);
                    animation: pulse 2s infinite;
                " onclick="toggleSuperAdminMode()">
                    👑 슈퍼 관리자 토글 👑<br>
                    <small>클릭하여 모드 전환</small>
                </div>
                <style>
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                        100% { transform: scale(1); }
                    }
                </style>
            `;
            document.body.appendChild(button);
        }
        
        // 토글 함수 정의
        window.toggleSuperAdminMode = function() {
            const currentMode = localStorage.getItem('ahp_super_mode') === 'true';
            localStorage.setItem('ahp_super_mode', (!currentMode).toString());
            alert(`슈퍼 관리자 모드: ${!currentMode ? '활성화' : '비활성화'}\n\n페이지를 새로고침하세요.`);
            location.reload();
        };
        
        return true;
    } else {
        console.log('❌ admin@ahp.com 계정이 아닙니다. 현재 이메일:', user.email);
        return false;
    }
}

// 자동 실행
forceSuperAdmin();

// 전역 함수로 등록
window.forceSuperAdmin = forceSuperAdmin;

// 슈퍼 관리자 정보 확인 함수
window.checkSuperAdmin = function() {
    const user = JSON.parse(localStorage.getItem('ahp_user') || '{}');
    console.log('=== 현재 사용자 정보 ===');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Is Super Admin:', user.role === 'super_admin');
    console.log('Admin Type:', user.admin_type);
    console.log('전체 User 객체:', user);
    console.log('====================');
    
    if (user.email === 'admin@ahp.com' && user.role !== 'super_admin') {
        console.log('⚠️ 권한 불일치 감지! forceSuperAdmin() 실행 중...');
        forceSuperAdmin();
        console.log('✅ 권한 수정 완료. 페이지를 새로고침하세요.');
    }
};

console.log(`
========================================
🎯 슈퍼 관리자 설정 스크립트 로드 완료!
========================================

사용 가능한 명령어:
1. forceSuperAdmin() - 슈퍼 관리자 권한 강제 설정
2. checkSuperAdmin() - 현재 권한 상태 확인
3. 페이지 새로고침 (F5) - 변경사항 적용

현재 사용자 정보:
`, JSON.parse(localStorage.getItem('ahp_user') || '{}'));

// 자동 권한 체크
window.checkSuperAdmin();