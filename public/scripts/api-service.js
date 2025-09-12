/**
 * AHP System API Service - 공개형 외부 회원 서비스
 * Django REST API와의 통신만을 담당하는 서비스 모듈
 * 로컬 저장소 및 데모 모드 완전 제거
 */

class AHPApiService {
    constructor() {
        this.baseURL = 'https://ahp-django-backend.onrender.com/api';
        this.user = null;
        this.isOnline = navigator.onLine;
        
        // 네트워크 상태 모니터링
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('✅ 네트워크 연결됨');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('❌ 네트워크 연결 끊어짐');
            this.showNetworkError();
        });
    }

    // =========================
    // 인증 관련 API
    // =========================

    /**
     * 로그인 (Django API 전용)
     */
    async login(credentials) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결을 확인해주세요.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 쿠키 포함
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `로그인 실패: ${response.status}`);
            }

            const data = await response.json();
            this.user = data.user;
            
            console.log('✅ 로그인 성공:', data.user.name);
            return {
                success: true,
                user: data.user,
                message: data.message || '로그인에 성공했습니다.'
            };
        } catch (error) {
            console.error('로그인 오류:', error);
            return {
                success: false,
                message: error.message || '서버 연결에 실패했습니다.'
            };
        }
    }

    /**
     * 로그아웃
     */
    async logout() {
        try {
            await fetch(`${this.baseURL}/auth/logout/`, {
                method: 'POST',
                credentials: 'include'
            });

            this.user = null;
            console.log('✅ 로그아웃 완료');
            return { success: true };
        } catch (error) {
            console.error('로그아웃 오류:', error);
            return { 
                success: false, 
                message: '로그아웃 중 오류가 발생했습니다.' 
            };
        }
    }

    /**
     * 현재 사용자 정보 조회
     */
    async getCurrentUser() {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/me/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.user = null;
                    return {
                        success: false,
                        message: '인증이 필요합니다.'
                    };
                }
                throw new Error(`사용자 정보 조회 실패: ${response.status}`);
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
                message: error.message || '사용자 정보를 가져올 수 없습니다.'
            };
        }
    }

    /**
     * 회원가입
     */
    async register(userData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결을 확인해주세요.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `회원가입 실패: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                user: data.user,
                message: data.message || '회원가입이 완료되었습니다.'
            };
        } catch (error) {
            console.error('회원가입 오류:', error);
            return {
                success: false,
                message: error.message || '회원가입 중 오류가 발생했습니다.'
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
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: []
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
                message: error.message || '프로젝트를 불러올 수 없습니다.',
                data: []
            };
        }
    }

    /**
     * 프로젝트 생성
     */
    async createProject(projectData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
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
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `프로젝트 생성 실패: ${response.status}`);
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
                message: error.message || '프로젝트를 생성할 수 없습니다.'
            };
        }
    }

    /**
     * 프로젝트 상세 조회
     */
    async getProject(projectId) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`프로젝트 조회 실패: ${response.status}`);
            }

            const project = await response.json();
            return {
                success: true,
                data: project
            };
        } catch (error) {
            console.error('프로젝트 조회 오류:', error);
            return {
                success: false,
                message: error.message || '프로젝트 정보를 가져올 수 없습니다.'
            };
        }
    }

    /**
     * 프로젝트 수정
     */
    async updateProject(projectId, projectData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(projectData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `프로젝트 수정 실패: ${response.status}`);
            }

            const project = await response.json();
            return {
                success: true,
                data: project
            };
        } catch (error) {
            console.error('프로젝트 수정 오류:', error);
            return {
                success: false,
                message: error.message || '프로젝트를 수정할 수 없습니다.'
            };
        }
    }

    /**
     * 프로젝트 삭제
     */
    async deleteProject(projectId) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`프로젝트 삭제 실패: ${response.status}`);
            }

            return {
                success: true
            };
        } catch (error) {
            console.error('프로젝트 삭제 오류:', error);
            return {
                success: false,
                message: error.message || '프로젝트를 삭제할 수 없습니다.'
            };
        }
    }

    // =========================
    // 기준 관리 API
    // =========================

    /**
     * 프로젝트의 기준 목록 조회
     */
    async getCriteria(projectId) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: []
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/criteria/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`기준 조회 실패: ${response.status}`);
            }

            const criteria = await response.json();
            return {
                success: true,
                data: criteria
            };
        } catch (error) {
            console.error('기준 조회 오류:', error);
            return {
                success: false,
                message: error.message || '기준 정보를 가져올 수 없습니다.',
                data: []
            };
        }
    }

    /**
     * 기준 생성
     */
    async createCriterion(projectId, criterionData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/criteria/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(criterionData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `기준 생성 실패: ${response.status}`);
            }

            const criterion = await response.json();
            return {
                success: true,
                data: criterion
            };
        } catch (error) {
            console.error('기준 생성 오류:', error);
            return {
                success: false,
                message: error.message || '기준을 생성할 수 없습니다.'
            };
        }
    }

    // =========================
    // 대안 관리 API
    // =========================

    /**
     * 프로젝트의 대안 목록 조회
     */
    async getAlternatives(projectId) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: []
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/alternatives/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`대안 조회 실패: ${response.status}`);
            }

            const alternatives = await response.json();
            return {
                success: true,
                data: alternatives
            };
        } catch (error) {
            console.error('대안 조회 오류:', error);
            return {
                success: false,
                message: error.message || '대안 정보를 가져올 수 없습니다.',
                data: []
            };
        }
    }

    /**
     * 대안 생성
     */
    async createAlternative(projectId, alternativeData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/alternatives/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(alternativeData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `대안 생성 실패: ${response.status}`);
            }

            const alternative = await response.json();
            return {
                success: true,
                data: alternative
            };
        } catch (error) {
            console.error('대안 생성 오류:', error);
            return {
                success: false,
                message: error.message || '대안을 생성할 수 없습니다.'
            };
        }
    }

    // =========================
    // 쌍대비교 API
    // =========================

    /**
     * 쌍대비교 데이터 저장
     */
    async saveComparison(projectId, comparisonData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/comparisons/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(comparisonData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `쌍대비교 저장 실패: ${response.status}`);
            }

            const comparison = await response.json();
            return {
                success: true,
                data: comparison
            };
        } catch (error) {
            console.error('쌍대비교 저장 오류:', error);
            return {
                success: false,
                message: error.message || '비교 데이터를 저장할 수 없습니다.'
            };
        }
    }

    /**
     * 쌍대비교 결과 조회
     */
    async getComparisons(projectId) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: []
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/comparisons/`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`쌍대비교 조회 실패: ${response.status}`);
            }

            const comparisons = await response.json();
            return {
                success: true,
                data: comparisons
            };
        } catch (error) {
            console.error('쌍대비교 조회 오류:', error);
            return {
                success: false,
                message: error.message || '비교 데이터를 가져올 수 없습니다.',
                data: []
            };
        }
    }

    // =========================
    // 결과 분석 API
    // =========================

    /**
     * AHP 분석 결과 계산 및 조회
     */
    async calculateResults(projectId) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/results/calculate/`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `결과 계산 실패: ${response.status}`);
            }

            const results = await response.json();
            return {
                success: true,
                data: results
            };
        } catch (error) {
            console.error('결과 계산 오류:', error);
            return {
                success: false,
                message: error.message || '분석 결과를 계산할 수 없습니다.'
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
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: { theme: 'light' }
            };
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
                message: error.message || '설정 정보를 가져올 수 없습니다.',
                data: { theme: 'light' }
            };
        }
    }

    /**
     * 사용자 설정 저장
     */
    async saveUserSettings(settings) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
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
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `설정 저장 실패: ${response.status}`);
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
                message: error.message || '설정을 저장할 수 없습니다.'
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
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: {}
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
                message: error.message || '통계 정보를 가져올 수 없습니다.',
                data: {}
            };
        }
    }

    /**
     * 시스템 활동 로그 조회
     */
    async getSystemActivities(limit = 10) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: []
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
                message: error.message || '활동 로그를 가져올 수 없습니다.',
                data: []
            };
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
                signal: AbortSignal.timeout(5000)
            });
            
            return response.ok;
        } catch (error) {
            console.error('API 연결 확인 실패:', error);
            return false;
        }
    }

    /**
     * 네트워크 오류 표시
     */
    showNetworkError() {
        if (document.body) {
            const errorBanner = document.createElement('div');
            errorBanner.id = 'network-error-banner';
            errorBanner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ef4444;
                color: white;
                text-align: center;
                padding: 10px;
                z-index: 9999;
                font-weight: bold;
            `;
            errorBanner.textContent = '네트워크 연결이 끊어졌습니다. 연결을 확인해주세요.';
            
            // 기존 배너 제거
            const existing = document.getElementById('network-error-banner');
            if (existing) existing.remove();
            
            document.body.prepend(errorBanner);
            
            // 연결 복구 시 배너 제거
            window.addEventListener('online', () => {
                const banner = document.getElementById('network-error-banner');
                if (banner) banner.remove();
            }, { once: true });
        }
    }

    /**
     * 현재 사용자 정보 가져오기
     */
    getCurrentUserSync() {
        return this.user;
    }
}

// 전역 API 서비스 인스턴스
window.ahpApi = new AHPApiService();

// 페이지 로드시 사용자 인증 확인 (공개 서비스용)
document.addEventListener('DOMContentLoaded', async () => {
    // 로그인 페이지가 아닌 경우에만 인증 확인
    if (!window.location.pathname.includes('login') && 
        !window.location.pathname.includes('register') &&
        !window.location.pathname.includes('index.html') &&
        window.location.pathname !== '/ahp_app/') {
        
        const result = await window.ahpApi.getCurrentUser();
        if (!result.success) {
            console.log('🔐 인증 필요, 로그인 페이지로 이동');
            window.location.href = '/ahp_app/public/login.html';
        } else {
            console.log(`✅ 사용자 인증 확인됨: ${result.user.name}`);
        }
    }
});

console.log('🚀 AHP API Service 초기화 완료 (공개형 외부 서비스)');