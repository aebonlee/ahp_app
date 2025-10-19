/**
 * AHP System API Service
 * Django REST API와의 통신을 담당하는 서비스 모듈
 * localStorage 완전 제거 및 서버 기반 데이터 관리
 */

class AHPApiService {
    constructor() {
        this.baseURL = 'https://ahp-django-backend.onrender.com/api';
        this.token = null;
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
        });
    }

    // =========================
    // 인증 관련 API
    // =========================

    /**
     * 로그인 (쿠키 기반 세션 인증)
     */
    async login(credentials) {
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
                throw new Error(`로그인 실패: ${response.status}`);
            }

            const data = await response.json();
            this.user = data.user;
            
            // 사용자 정보를 세션에 임시 저장 (페이지 새로고침용)
            sessionStorage.setItem('ahp_user', JSON.stringify(data.user));
            
            return {
                success: true,
                user: data.user,
                message: data.message
            };
        } catch (error) {
            console.error('로그인 오류:', error);
            return {
                success: false,
                message: error.message
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

    /**
     * 프로젝트 상세 조회
     */
    async getProject(projectId) {
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
                message: error.message
            };
        }
    }

    /**
     * 프로젝트 수정
     */
    async updateProject(projectId, projectData) {
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
                throw new Error(`프로젝트 수정 실패: ${response.status}`);
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
                message: error.message
            };
        }
    }

    /**
     * 프로젝트 삭제
     */
    async deleteProject(projectId) {
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
                message: error.message
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
                message: error.message,
                data: []
            };
        }
    }

    /**
     * 기준 생성
     */
    async createCriterion(projectId, criterionData) {
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
                throw new Error(`기준 생성 실패: ${response.status}`);
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
                message: error.message
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
                message: error.message,
                data: []
            };
        }
    }

    /**
     * 대안 생성
     */
    async createAlternative(projectId, alternativeData) {
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
                throw new Error(`대안 생성 실패: ${response.status}`);
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
                message: error.message
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
                throw new Error(`쌍대비교 저장 실패: ${response.status}`);
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
                message: error.message
            };
        }
    }

    /**
     * 쌍대비교 결과 조회
     */
    async getComparisons(projectId) {
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
                message: error.message,
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
        try {
            const response = await fetch(`${this.baseURL}/projects/${projectId}/results/calculate/`, {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`결과 계산 실패: ${response.status}`);
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
     * 에러 처리 헬퍼
     */
    handleApiError(error, context = '') {
        console.error(`API 오류 [${context}]:`, error);
        
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결을 확인해주세요.',
                error: 'network_error'
            };
        }
        
        return {
            success: false,
            message: error.message || '서버 오류가 발생했습니다.',
            error: 'server_error'
        };
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
            console.log('인증 필요, 로그인 페이지로 이동');
            window.location.href = '/ahp_app/public/login.html';
        }
    } else {
        console.log('✅ 사용자 인증 확인됨:', result.user.name);
    }
});

console.log('✅ AHP API Service 초기화 완료');