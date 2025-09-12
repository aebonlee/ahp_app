/**
 * AHP System API Service - localStorage 완전 제거 버전
 * Django REST API와의 통신을 담당하는 서비스 모듈
 * API 실패 시 데모 모드로 자동 전환
 */

class AHPApiService {
    constructor() {
        this.baseURL = 'https://ahp-django-backend.onrender.com/api';
        this.token = null;
        this.user = null;
        this.isOnline = navigator.onLine;
        this.demoMode = false; // 데모 모드 플래그
        
        // 네트워크 상태 모니터링
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('✅ 네트워크 연결됨');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('❌ 네트워크 연결 끊어짐');
        });
    }

    // =========================
    // 인증 관련 API
    // =========================

    /**
     * 로그인 (쿠키 기반 세션 인증 또는 데모 모드)
     */
    async login(credentials) {
        try {
            // 먼저 실제 API로 로그인 시도
            const response = await fetch(`${this.baseURL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 쿠키 포함
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                this.demoMode = false;
                
                // 사용자 정보를 세션에 임시 저장 (페이지 새로고침용)
                sessionStorage.setItem('ahp_user', JSON.stringify(data.user));
                sessionStorage.setItem('ahp_demo_mode', 'false');
                
                console.log('✅ API 로그인 성공');
                return {
                    success: true,
                    user: data.user,
                    message: data.message
                };
            } else {
                throw new Error(`API 로그인 실패: ${response.status}`);
            }
        } catch (error) {
            console.warn('🔄 API 로그인 실패, 데모 모드로 전환:', error.message);
            
            // API 실패 시 데모 모드로 폴백
            return await this.demoLogin(credentials);
        }
    }

    /**
     * 로그아웃
     */
    async logout() {
        try {
            if (!this.demoMode) {
                await fetch(`${this.baseURL}/auth/logout/`, {
                    method: 'POST',
                    credentials: 'include'
                });
            }

            this.user = null;
            this.demoMode = false;
            sessionStorage.clear();
            
            return { success: true };
        } catch (error) {
            console.error('로그아웃 오류:', error);
            return { success: false };
        }
    }

    /**
     * 현재 사용자 정보 조회
     */
    async getCurrentUser() {
        // 데모 모드인 경우 세션에서 가져오기
        if (this.demoMode || sessionStorage.getItem('ahp_demo_mode') === 'true') {
            const demoUser = sessionStorage.getItem('ahp_user');
            if (demoUser) {
                try {
                    this.user = JSON.parse(demoUser);
                    this.demoMode = true;
                    return {
                        success: true,
                        user: this.user
                    };
                } catch (error) {
                    console.error('데모 사용자 정보 파싱 오류:', error);
                }
            }
            return {
                success: false,
                message: '데모 사용자 세션 만료'
            };
        }
        
        try {
            const response = await fetch(`${this.baseURL}/auth/me/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('인증되지 않은 사용자');
            }

            const user = await response.json();
            this.user = user;
            
            return {
                success: true,
                user: user
            };
        } catch (error) {
            console.error('사용자 정보 조회 오류:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // =========================
    // 프로젝트 관리 API
    // =========================

    /**
     * 프로젝트 목록 조회
     */
    async getProjects(filters = {}) {
        if (this.demoMode) {
            return {
                success: true,
                data: this.generateDemoProjects()
            };
        }

        try {
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.search) queryParams.append('search', filters.search);

            const response = await fetch(`${this.baseURL}/projects/?${queryParams}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`프로젝트 조회 실패: ${response.status}`);
            }

            const projects = await response.json();
            return {
                success: true,
                data: projects
            };
        } catch (error) {
            console.error('프로젝트 조회 오류:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    }

    /**
     * 프로젝트 생성
     */
    async createProject(projectData) {
        if (this.demoMode) {
            // 데모 모드에서는 세션에 저장
            const newProject = {
                id: Date.now().toString(),
                ...projectData,
                status: 'draft',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                criteria: [],
                alternatives: []
            };

            const existingProjects = this.getDemoProjectsFromSession();
            existingProjects.unshift(newProject);
            this.saveDemoProjectsToSession(existingProjects);

            return {
                success: true,
                data: newProject
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(projectData)
            });

            if (!response.ok) {
                throw new Error(`프로젝트 생성 실패: ${response.status}`);
            }

            const project = await response.json();
            return {
                success: true,
                data: project
            };
        } catch (error) {
            console.error('프로젝트 생성 오류:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // =========================
    // 사용자 설정 API
    // =========================

    /**
     * 사용자 설정 조회
     */
    async getUserSettings() {
        // 데모 모드인 경우 세션에서 가져오기
        if (this.demoMode || sessionStorage.getItem('ahp_demo_mode') === 'true') {
            const demoSettings = sessionStorage.getItem('ahp_settings') || '{}';
            try {
                return {
                    success: true,
                    data: JSON.parse(demoSettings)
                };
            } catch (error) {
                return {
                    success: true,
                    data: { theme: 'light' }
                };
            }
        }
        
        try {
            const response = await fetch(`${this.baseURL}/user/settings/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`설정 조회 실패: ${response.status}`);
            }

            const settings = await response.json();
            return {
                success: true,
                data: settings
            };
        } catch (error) {
            console.error('설정 조회 오류:', error);
            return {
                success: false,
                message: error.message,
                data: {}
            };
        }
    }

    /**
     * 사용자 설정 저장
     */
    async saveUserSettings(settings) {
        // 데모 모드인 경우 세션에 저장
        if (this.demoMode || sessionStorage.getItem('ahp_demo_mode') === 'true') {
            try {
                const currentSettings = sessionStorage.getItem('ahp_settings') || '{}';
                const parsedSettings = JSON.parse(currentSettings);
                const newSettings = { ...parsedSettings, ...settings };
                sessionStorage.setItem('ahp_settings', JSON.stringify(newSettings));
                
                return {
                    success: true,
                    data: newSettings
                };
            } catch (error) {
                console.error('데모 설정 저장 오류:', error);
                return {
                    success: false,
                    message: error.message
                };
            }
        }
        
        try {
            const response = await fetch(`${this.baseURL}/user/settings/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                throw new Error(`설정 저장 실패: ${response.status}`);
            }

            const savedSettings = await response.json();
            return {
                success: true,
                data: savedSettings
            };
        } catch (error) {
            console.error('설정 저장 오류:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    // =========================
    // 관리자 API
    // =========================

    /**
     * 관리자 통계 조회
     */
    async getAdminStats() {
        if (this.demoMode) {
            return {
                success: true,
                data: {
                    totalUsers: 1247,
                    activeProjects: 89,
                    systemPerformance: 98.7,
                    storageUsage: 67.3
                }
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/admin/stats/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`통계 조회 실패: ${response.status}`);
            }

            const stats = await response.json();
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('통계 조회 오류:', error);
            return {
                success: false,
                message: error.message,
                data: {}
            };
        }
    }

    /**
     * 시스템 활동 로그 조회
     */
    async getSystemActivities(limit = 10) {
        if (this.demoMode) {
            return {
                success: true,
                data: [
                    {
                        type: 'user',
                        description: '새 사용자 등록: 김철수 (kim.cs@company.com)',
                        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
                    },
                    {
                        type: 'system',
                        description: '시스템 백업 완료 (DB: 2.3GB, Files: 856MB)',
                        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
                    },
                    {
                        type: 'project',
                        description: '대규모 AHP 프로젝트 생성: "제품 선택 분석" (15개 기준, 8개 대안)',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                    }
                ]
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/admin/activities/?limit=${limit}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`활동 로그 조회 실패: ${response.status}`);
            }

            const activities = await response.json();
            return {
                success: true,
                data: activities
            };
        } catch (error) {
            console.error('활동 로그 조회 오류:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    }

    // =========================
    // 데모 모드 기능
    // =========================
    
    /**
     * 데모 로그인
     */
    async demoLogin(credentials) {
        // 시뮬레이션을 위한 지연
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 데모 계정
        const demoUsers = [
            {
                email: 'admin@ahp.com',
                password: 'admin123',
                name: '관리자',
                role: 'admin'
            },
            {
                email: 'user@ahp.com',
                password: 'user123',
                name: '사용자',
                role: 'user'
            },
            {
                email: 'demo@ahp.com',
                password: 'demo123',
                name: '데모 사용자',
                role: 'user'
            }
        ];

        const user = demoUsers.find(u => 
            u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
            this.demoMode = true;
            this.user = {
                id: Math.floor(Math.random() * 1000),
                email: user.email,
                name: user.name,
                role: user.role
            };
            
            // 세션에 저장
            sessionStorage.setItem('ahp_user', JSON.stringify(this.user));
            sessionStorage.setItem('ahp_demo_mode', 'true');
            
            console.log('🎮 데모 모드로 로그인 성공:', this.user.name);
            return {
                success: true,
                user: this.user,
                message: `${user.name}님, 데모 모드로 로그인되었습니다.`
            };
        } else {
            return {
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            };
        }
    }
    
    /**
     * 데모 데이터 생성
     */
    generateDemoProjects() {
        const sessionProjects = this.getDemoProjectsFromSession();
        if (sessionProjects.length > 0) {
            return sessionProjects;
        }

        return [
            {
                id: '1',
                title: '새로운 마케팅 전략 선택',
                description: '상반기 마케팅 전략을 결정하기 위한 AHP 분석',
                goal: '최적의 마케팅 전략 선택',
                category: 'business',
                status: 'active',
                created_at: '2024-01-15T09:00:00Z',
                updated_at: '2024-01-20T14:30:00Z',
                criteria: [],
                alternatives: []
            },
            {
                id: '2',
                title: '직원 성과 평가 시스템',
                description: '공정하고 효율적인 성과 평가 시스템 설계',
                goal: '객관적인 성과 평가 기준 수립',
                category: 'policy',
                status: 'completed',
                created_at: '2024-02-01T10:15:00Z',
                updated_at: '2024-02-28T16:45:00Z',
                criteria: [],
                alternatives: []
            }
        ];
    }

    getDemoProjectsFromSession() {
        try {
            const projects = sessionStorage.getItem('ahp_demo_projects');
            return projects ? JSON.parse(projects) : [];
        } catch (error) {
            return [];
        }
    }

    saveDemoProjectsToSession(projects) {
        try {
            sessionStorage.setItem('ahp_demo_projects', JSON.stringify(projects));
        } catch (error) {
            console.error('데모 프로젝트 저장 실패:', error);
        }
    }

    // =========================
    // 유틸리티 함수
    // =========================

    /**
     * 네트워크 상태 확인
     */
    isNetworkAvailable() {
        return this.isOnline;
    }

    /**
     * API 연결 상태 확인
     */
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health/`, {
                method: 'GET',
                timeout: 5000
            });
            
            return response.ok;
        } catch (error) {
            console.error('API 연결 확인 실패:', error);
            return false;
        }
    }

    /**
     * 데모 모드 확인
     */
    isDemoMode() {
        return this.demoMode || sessionStorage.getItem('ahp_demo_mode') === 'true';
    }
}

// 전역 API 서비스 인스턴스
window.ahpApi = new AHPApiService();

// 페이지 로드시 사용자 인증 확인
document.addEventListener('DOMContentLoaded', async () => {
    const result = await window.ahpApi.getCurrentUser();
    if (!result.success) {
        // 로그인 페이지가 아닌 경우 리다이렉트
        if (!window.location.pathname.includes('login')) {
            console.log('🔐 인증 필요, 로그인 페이지로 이동');
            window.location.href = '/ahp_app/public/login.html';
        }
    } else {
        const modeText = window.ahpApi.isDemoMode() ? '(데모 모드)' : '';
        console.log(`✅ 사용자 인증 확인됨: ${result.user.name} ${modeText}`);
    }
});

console.log('🚀 AHP API Service 초기화 완료 (localStorage 제거 버전)');