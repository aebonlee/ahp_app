// 슈퍼 관리자 권한 강제 설정 스크립트
// 브라우저 콘솔에서 실행하세요

function forceSuperAdmin() {
    const user = JSON.parse(localStorage.getItem('ahp_user') || '{}');
    
    if (user.email === 'admin@ahp.com') {
        user.role = 'super_admin';
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

console.log(`
========================================
슈퍼 관리자 설정 스크립트 로드 완료!
========================================

다음 명령어를 콘솔에 입력하세요:
1. forceSuperAdmin() - 슈퍼 관리자 권한 설정
2. 페이지 새로고침 (F5)

현재 사용자 정보:
`, JSON.parse(localStorage.getItem('ahp_user') || '{}'));