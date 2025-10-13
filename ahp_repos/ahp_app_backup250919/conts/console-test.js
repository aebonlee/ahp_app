// 브라우저 콘솔에서 실행할 테스트 코드
// F12 -> Console 탭에서 아래 코드를 복사해서 실행하세요

// 테스트 계정 생성 함수
async function createTestAccounts() {
    const API_BASE_URL = 'https://ahp-django-backend-new.onrender.com';
    
    const testAccounts = [
        {
            username: 'aebon',
            email: 'aebon@ahp-system.com', 
            password: 'AebonAdmin2024!',
            first_name: 'Aebon',
            last_name: 'Super',
            user_type: 'admin',
            admin_role: 'super_admin'
        },
        {
            username: 'system_admin',
            email: 'admin@ahp-system.com',
            password: 'SystemAdmin2024!', 
            first_name: '시스템',
            last_name: '관리자',
            user_type: 'admin',
            admin_role: 'system_admin'
        },
        {
            username: 'business_user',
            email: 'business@company.com',
            password: 'BusinessUser2024!',
            first_name: '비즈니스',
            last_name: '사용자', 
            user_type: 'personal_service_user',
            service_tier: 'professional'
        },
        {
            username: 'evaluator01',
            email: 'evaluator@email.com',
            password: 'Evaluator2024!',
            first_name: '평가자',
            last_name: '김',
            user_type: 'evaluator'
        }
    ];

    console.log('🚀 테스트 계정 생성 시작...');
    
    for (const account of testAccounts) {
        try {
            console.log(`🔄 계정 생성 중: ${account.username}`);
            
            const response = await fetch(`${API_BASE_URL}/api/dev/create-test-user/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(account),
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${account.username} 계정 생성 성공:`, data);
            } else {
                const errorData = await response.json();
                console.error(`❌ ${account.username} 계정 생성 실패:`, errorData);
            }
        } catch (error) {
            console.error(`❌ ${account.username} 네트워크 오류:`, error);
        }
        
        // 각 계정 생성 사이에 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ 테스트 계정 생성 완료');
}

// 로그인 테스트 함수  
async function testLogin(username, password) {
    const API_BASE_URL = 'https://ahp-django-backend-new.onrender.com';
    
    try {
        console.log(`🔍 로그인 테스트: ${username}`);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log(`✅ ${username} 로그인 성공:`, data);
            return true;
        } else {
            console.error(`❌ ${username} 로그인 실패:`, data);
            return false;
        }
    } catch (error) {
        console.error(`❌ ${username} 로그인 오류:`, error);
        return false;
    }
}

// 모든 계정 로그인 테스트
async function testAllLogins() {
    console.log('🔐 로그인 테스트 시작...');
    
    const accounts = [
        ['aebon', 'AebonAdmin2024!'],
        ['system_admin', 'SystemAdmin2024!'],
        ['business_user', 'BusinessUser2024!'],
        ['evaluator01', 'Evaluator2024!']
    ];
    
    for (const [username, password] of accounts) {
        await testLogin(username, password);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ 모든 로그인 테스트 완료');
}

// 실행 명령어들
console.log('='.repeat(60));
console.log('🛠️ AHP 시스템 테스트 계정 생성 도구');
console.log('='.repeat(60));
console.log('');
console.log('사용 방법:');
console.log('1. createTestAccounts() - 모든 테스트 계정 생성');
console.log('2. testAllLogins() - 모든 계정 로그인 테스트');
console.log('3. testLogin("username", "password") - 개별 로그인 테스트');
console.log('');
console.log('먼저 createTestAccounts()를 실행하세요!');
console.log('='.repeat(60));