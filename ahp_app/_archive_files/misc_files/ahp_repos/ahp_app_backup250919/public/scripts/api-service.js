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
        this.authToken = null; // 인증 토큰 저장
        
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
    // 유틸리티 메서드
    // =========================
    
    /**
     * CSRF 토큰 가져오기
     */
    getCSRFToken() {
        // Django CSRF 토큰을 쿠키에서 가져오기
        const name = 'csrftoken';
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const trimmed = cookie.trim();
            if (trimmed.startsWith(name + '=')) {
                return decodeURIComponent(trimmed.substring(name.length + 1));
            }
        }
        
        // Meta 태그에서도 시도
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) {
            return metaTag.getAttribute('content');
        }
        
        return null;
    }
    
    /**
     * 인증 헤더 생성
     */
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // CSRF 토큰 추가
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
            headers['X-CSRFToken'] = csrfToken;
        }
        
        // 인증 토큰 추가 (Bearer 토큰 또는 세션 토큰)
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
        return headers;
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
            // 로그인 요청 데이터 준비 (email 또는 username 처리)
            const loginData = {
                username: credentials.email || credentials.username,
                password: credentials.password
            };

            console.log('🔑 로그인 시도:', {
                username: loginData.username,
                password: '***'
            });

            const response = await fetch(`${this.baseURL}/login/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'include', // 쿠키 포함
                body: JSON.stringify(loginData)
            });

            console.log('📡 로그인 응답 상태:', response.status);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.error('❌ 로그인 실패 응답:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                throw new Error(errorData?.message || `로그인 실패: ${response.status}`);
            }

            const data = await response.json();
            
            // Django 백엔드 응답 구조 확인
            if (data.success && data.user) {
                this.user = data.user;
                console.log('✅ 로그인 성공:', data.user.name || data.user.username);
                return {
                    success: true,
                    user: data.user,
                    message: data.message || '로그인에 성공했습니다.'
                };
            } else {
                console.error('❌ 로그인 응답 구조 오류:', data);
                return {
                    success: false,
                    message: data.message || '로그인 응답을 처리할 수 없습니다.'
                };
            }
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
            await fetch(`${this.baseURL}/logout/`, {
                method: 'POST',
                credentials: 'include'
            });

            this.user = null;
            this.lastUserCheck = null;
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

        // 캐시된 사용자 정보가 있고 최근 5분 이내라면 재사용
        if (this.user && this.lastUserCheck) {
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            if (this.lastUserCheck > fiveMinutesAgo) {
                console.log('🔄 캐시된 사용자 정보 사용');
                return {
                    success: true,
                    user: this.user
                };
            }
        }

        try {
            console.log('🔍 현재 사용자 정보 조회 시작');
            const response = await fetch(`${this.baseURL}/user/`, {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 API 응답 상태:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('❌ 401 Unauthorized - 인증이 필요함');
                    this.user = null;
                    return {
                        success: false,
                        message: '인증이 필요합니다.'
                    };
                }
                console.error('❌ API 호출 실패:', response.status, response.statusText);
                
                // 오류 응답 내용도 확인
                const errorText = await response.text().catch(() => 'Unknown error');
                console.error('❌ 오류 응답 내용:', errorText);
                
                throw new Error(`사용자 정보 조회 실패: ${response.status}`);
            }

            const data = await response.json();
            
            // Django 백엔드 응답 구조에 맞춰 처리
            if (data.success && data.user) {
                this.user = data.user;
                this.lastUserCheck = Date.now();
                return {
                    success: true,
                    user: data.user
                };
            } else if (data.authenticated && data.user) {
                this.user = data.user;
                this.lastUserCheck = Date.now();
                return {
                    success: true,
                    user: data.user
                };
            } else {
                this.user = null;
                this.lastUserCheck = null;
                return {
                    success: false,
                    message: data.message || '인증 정보를 확인할 수 없습니다.'
                };
            }
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
                headers: this.getAuthHeaders(),
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

            const response = await fetch(`${this.baseURL}/service/projects/?${queryParams}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`프로젝트 조회 실패: ${response.status}`);
            }

            const response_data = await response.json();
            // DRF 페이지네이션 응답 구조 처리
            const projects = response_data.results || response_data;
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
     * CSRF 토큰 가져오기 (강제)
     */
    async ensureCSRFToken() {
        try {
            const response = await fetch(`${this.baseURL}/user/`, {
                method: 'GET',
                credentials: 'include'
            });
            // CSRF 토큰이 쿠키에 설정됨
            console.log('🔐 CSRF 토큰 검색 완료');
            return true;
        } catch (error) {
            console.warn('⚠️ CSRF 토큰 가져오기 실패:', error);
            return false;
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
            console.log('🚀 프로젝트 생성 요청 (슈퍼관리자 인증):', projectData);
            
            // 인증 헤더 포함 (슈퍼관리자 세션)
            const headers = this.getAuthHeaders();
            
            console.log('📡 요청 헤더:', headers);
            
            const response = await fetch(`${this.baseURL}/service/projects/`, {
                method: 'POST',
                headers: headers,
                credentials: 'include',
                body: JSON.stringify(projectData)
            });
            
            console.log('📡 API 응답:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error');
                console.error('❌ API 오류 응답:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                
                throw new Error(errorData?.message || `프로젝트 생성 실패: ${response.status}`);
            }

            const project = await response.json();
            console.log('✅ 프로젝트 생성 성공:', project);
            
            return {
                success: true,
                data: project
            };
        } catch (error) {
            console.error('❌ 프로젝트 생성 오류:', error);
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
            const response = await fetch(`${this.baseURL}/service/projects/${projectId}/`, {
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
            const response = await fetch(`${this.baseURL}/service/projects/${projectId}/`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
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
            const response = await fetch(`${this.baseURL}/service/projects/${projectId}/`, {
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
            const response = await fetch(`${this.baseURL}/service/projects/${projectId}/service/criteria/`, {
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
            const response = await fetch(`${this.baseURL}/service/projects/${projectId}/service/criteria/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
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
            const response = await fetch(`${this.baseURL}/service/projects/${projectId}/service/alternatives/`, {
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
            const response = await fetch(`${this.baseURL}/service/projects/${projectId}/service/alternatives/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
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
            const response = await fetch(`${this.baseURL}/service/projects/${projectId}/service/comparisons/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
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
            const response = await fetch(`${this.baseURL}/service/projects/${projectId}/service/comparisons/`, {
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
            const response = await fetch(`${this.baseURL}/service/projects/${projectId}/service/results/calculate/`, {
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
                headers: this.getAuthHeaders(),
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

    // =========================
    // 평가자 관리 API (Phase 3 협업 시스템)
    // =========================

    /**
     * 평가자 목록 조회
     */
    async getEvaluators(filters = {}) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: []
            };
        }

        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`${this.baseURL}/evaluations/evaluators/?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ 평가자 목록 조회 성공');
                return {
                    success: true,
                    data: data.results || data,
                    count: data.count,
                    next: data.next,
                    previous: data.previous
                };
            } else {
                console.error('❌ 평가자 목록 조회 실패:', data);
                return {
                    success: false,
                    message: data.message || '평가자 목록을 가져올 수 없습니다.',
                    data: []
                };
            }
        } catch (error) {
            console.error('❌ 평가자 목록 조회 오류:', error);
            return {
                success: false,
                message: '서버 연결 오류가 발생했습니다.',
                data: []
            };
        }
    }

    /**
     * 평가자 초대
     */
    async inviteEvaluator(projectId, evaluatorData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            const inviteData = {
                project: projectId,
                evaluator_email: evaluatorData.email,
                evaluator_name: evaluatorData.name,
                message: evaluatorData.message || '',
                role: evaluatorData.role || 'evaluator'
            };

            console.log('🔔 평가자 초대 요청:', inviteData);

            const response = await fetch(`${this.baseURL}/evaluations/invitations/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(inviteData)
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ 평가자 초대 성공');
                return {
                    success: true,
                    data: data,
                    message: '평가자 초대를 성공적으로 보냈습니다.'
                };
            } else {
                console.error('❌ 평가자 초대 실패:', data);
                return {
                    success: false,
                    message: data.message || '평가자 초대를 보낼 수 없습니다.',
                    errors: data.errors
                };
            }
        } catch (error) {
            console.error('❌ 평가자 초대 오류:', error);
            return {
                success: false,
                message: '서버 연결 오류가 발생했습니다.'
            };
        }
    }

    /**
     * 평가 진행 상황 조회
     */
    async getEvaluationProgress(projectId = null) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: {}
            };
        }

        try {
            const url = projectId 
                ? `${this.baseURL}/evaluations/progress/?project=${projectId}`
                : `${this.baseURL}/evaluations/progress/`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ 평가 진행 상황 조회 성공');
                return {
                    success: true,
                    data: data
                };
            } else {
                console.error('❌ 평가 진행 상황 조회 실패:', data);
                return {
                    success: false,
                    message: data.message || '평가 진행 상황을 가져올 수 없습니다.',
                    data: {}
                };
            }
        } catch (error) {
            console.error('❌ 평가 진행 상황 조회 오류:', error);
            return {
                success: false,
                message: '서버 연결 오류가 발생했습니다.',
                data: {}
            };
        }
    }

    /**
     * 평가자 역할 업데이트
     */
    async updateEvaluatorRole(evaluatorId, roleData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/evaluations/evaluators/${evaluatorId}/`, {
                method: 'PATCH',
                headers: this.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(roleData)
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ 평가자 역할 업데이트 성공');
                return {
                    success: true,
                    data: data,
                    message: '평가자 역할이 업데이트되었습니다.'
                };
            } else {
                console.error('❌ 평가자 역할 업데이트 실패:', data);
                return {
                    success: false,
                    message: data.message || '평가자 역할을 업데이트할 수 없습니다.',
                    errors: data.errors
                };
            }
        } catch (error) {
            console.error('❌ 평가자 역할 업데이트 오류:', error);
            return {
                success: false,
                message: '서버 연결 오류가 발생했습니다.'
            };
        }
    }

    // =========================
    // 인구통계학적 설문조사 API
    // =========================

    /**
     * 사용자의 기존 설문조사 데이터 조회
     */
    async getUserDemographicData() {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: null
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/user/demographic-survey/`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            if (response.status === 404) {
                // 설문조사 데이터가 없음 (정상)
                return {
                    success: false,
                    message: '설문조사 데이터가 없습니다.',
                    data: null
                };
            }

            if (!response.ok) {
                throw new Error(`설문조사 데이터 조회 실패: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('설문조사 데이터 조회 오류:', error);
            return {
                success: false,
                message: error.message || '설문조사 데이터를 가져올 수 없습니다.',
                data: null
            };
        }
    }

    /**
     * 인구통계학적 설문조사 제출
     */
    async submitDemographicSurvey(surveyData) {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.'
            };
        }

        try {
            // CSRF 토큰 확보
            await this.ensureCSRFToken();

            console.log('📋 설문조사 데이터 전송:', surveyData);

            const response = await fetch(`${this.baseURL}/api/evaluations/demographic-surveys/submit_survey/`, {
                method: 'POST',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(surveyData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ 설문조사 제출 실패:', errorData);
                throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ 설문조사 제출 성공:', result);

            return {
                success: true,
                data: result,
                message: result.message || '설문조사가 성공적으로 제출되었습니다.'
            };

        } catch (error) {
            console.error('❌ 설문조사 제출 오류:', error);
            return {
                success: false,
                message: error.message || '설문조사 제출 중 오류가 발생했습니다.'
            };
        }
    }

    /**
     * 설문조사 통계 조회 (관리자용)
     */
    async getDemographicSurveyStats() {
        if (!this.isOnline) {
            return {
                success: false,
                message: '네트워크 연결이 필요합니다.',
                data: null
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/admin/demographic-survey/stats/`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`설문조사 통계 조회 실패: ${response.status}`);
            }

            const stats = await response.json();
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('설문조사 통계 조회 오류:', error);
            return {
                success: false,
                message: error.message || '설문조사 통계를 가져올 수 없습니다.',
                data: null
            };
        }
    }
}

// 전역 API 서비스 인스턴스
window.ahpApi = new AHPApiService();

// 페이지 로드시 사용자 인증 확인 (공개 서비스용)
document.addEventListener('DOMContentLoaded', async () => {
    // 특정 페이지에서 자동 인증 확인을 건너뛰는 플래그 확인
    if (window.SKIP_AUTO_AUTH_CHECK) {
        console.log('🛡️ 자동 인증 확인 건너뜀 (페이지 자체에서 처리)');
        return;
    }
    
    // 관리자 대시보드 페이지인 경우 추가적으로 건너뛰기
    if (window.location.pathname.includes('super-admin-dashboard') || 
        window.location.pathname.includes('admin-dashboard')) {
        console.log('🛡️ 관리자 페이지 - 자동 인증 확인 건너뜀');
        return;
    }
    
    // 로그인 페이지가 아닌 경우에만 인증 확인
    if (!window.location.pathname.includes('login') && 
        !window.location.pathname.includes('register') &&
        !window.location.pathname.includes('index.html') &&
        window.location.pathname !== '/ahp_app/') {
        
        const result = await window.ahpApi.getCurrentUser();
        if (!result.success) {
            console.log('🔐 인증 필요, 로그인 페이지로 이동');
            window.location.href = './login.html';
        } else {
            console.log(`✅ 사용자 인증 확인됨: ${result.user.name}`);
        }
    }
});

console.log('🚀 AHP API Service 초기화 완료 (공개형 외부 서비스)');