# 🔄 AHP 플랫폼 복원 가이드

**백업 버전**: v2.5.1 (2025-09-14)  
**복원 기점**: 엔터프라이즈급 슈퍼 관리자 시스템 완성 시점

## 🚀 빠른 복원 (5분)

### 프론트엔드 복원
```bash
# 1. 기존 디렉토리 백업 (선택사항)
mv ahp_app ahp_app_backup_$(date +%Y%m%d)

# 2. 백업에서 복원
cp -r backupdata/2025-09-14-enterprise-super-admin-system/ahp_app_frontend ahp_app

# 3. Git 리포지토리 연결 (필요시)
cd ahp_app
git init
git remote add origin https://github.com/aebonlee/ahp_app.git
```

### 백엔드 복원
```bash
# 1. 기존 디렉토리 백업 (선택사항)
mv ahp_django ahp_django_backup_$(date +%Y%m%d)

# 2. 백업에서 복원
cp -r backupdata/2025-09-14-enterprise-super-admin-system/ahp_django_backend ahp_django

# 3. 가상환경 설정
cd ahp_django
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 4. 의존성 설치
pip install -r requirements.txt

# 5. 데이터베이스 마이그레이션
python manage.py migrate
python manage.py createsuperuser  # 관리자 계정 생성
```

## 🛠️ 완전 복원 (15분)

### 1. 환경 준비
```bash
# Python 버전 확인 (3.8+ 필요)
python --version

# Node.js 확인 (선택사항, 개발용)
node --version
npm --version
```

### 2. 프론트엔드 설정
```bash
cd ahp_app

# GitHub Pages 자동 배포 확인
# .github/workflows/deploy.yml 존재 확인

# 로컬 서버 실행 (테스트용)
python -m http.server 8000
```

### 3. 백엔드 설정
```bash
cd ahp_django

# 환경 변수 설정 (.env 파일 생성)
cat > .env << EOF
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost/ahp_db
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
CORS_ALLOWED_ORIGINS=http://localhost:8000,https://aebonlee.github.io
EOF

# PostgreSQL 데이터베이스 생성
createdb ahp_db

# 마이그레이션 실행
python manage.py makemigrations
python manage.py migrate

# 정적 파일 수집
python manage.py collectstatic

# 개발 서버 실행
python manage.py runserver
```

### 4. 배포 설정

#### GitHub Pages (프론트엔드)
```bash
# GitHub 리포지토리 푸시
git add .
git commit -m "Restore from backup v2.5.1"
git push origin main

# GitHub Pages 설정 확인
# Settings > Pages > Source: GitHub Actions
```

#### Render (백엔드)
```bash
# Render 배포 설정 확인
# render.yaml 파일 존재 확인
# Environment Variables 설정:
# - SECRET_KEY
# - DATABASE_URL  
# - ALLOWED_HOSTS
```

## 🔧 설정 확인

### 프론트엔드 확인사항
```javascript
// 1. API 연결 확인
console.log('API Service:', typeof window.ahpApi);

// 2. 주요 함수 존재 확인
console.log('handleMenuClick:', typeof handleMenuClick);
console.log('switchToAdminMode:', typeof switchToAdminMode);
console.log('updateUserInfo:', typeof updateUserInfo);

// 3. 메뉴 이벤트 바인딩 확인
document.querySelectorAll('.sidebar-item').length;
```

### 백엔드 확인사항
```bash
# 1. 데이터베이스 연결 확인
python manage.py dbshell

# 2. API 엔드포인트 확인
python manage.py show_urls

# 3. 관리자 페이지 접근 확인
# http://localhost:8000/admin/

# 4. API 응답 테스트
curl http://localhost:8000/api/health/
```

## 🧪 테스트 체크리스트

### 필수 기능 테스트
- [ ] 로그인/로그아웃 기능
- [ ] 슈퍼 관리자 권한 확인
- [ ] 관리자 ↔ 개인 서비스 전환
- [ ] 왼쪽 메뉴 클릭 기능
- [ ] 사용자 정보 표시 (배지 포함)
- [ ] 권한별 아바타 색상

### 권한 시스템 테스트
- [ ] 슈퍼 관리자: 모든 기능 접근
- [ ] 일반 관리자: 관리 기능만 접근
- [ ] 일반 사용자: 개인 서비스만 접근

### UI/UX 테스트
- [ ] 반응형 디자인 (모바일/태블릿)
- [ ] 브라우저 호환성 (Chrome, Firefox, Safari)
- [ ] 로딩 속도 (2초 이내)
- [ ] 에러 메시지 표시

## ⚠️ 문제 해결

### 일반적인 문제들

#### 1. 메뉴 클릭이 안 됨
```javascript
// 해결: 이벤트 바인딩 재실행
bindMenuEvents();
```

#### 2. API 연결 오류
```bash
# CORS 설정 확인
# settings.py에서 CORS_ALLOWED_ORIGINS 확인
```

#### 3. 권한 시스템 오류
```python
# Django에서 사용자 권한 확인
from django.contrib.auth.models import User
user = User.objects.get(username='your-username')
print(f"Is superuser: {user.is_superuser}")
print(f"Is staff: {user.is_staff}")
```

#### 4. 데이터베이스 연결 오류
```bash
# PostgreSQL 서비스 상태 확인
sudo systemctl status postgresql

# 데이터베이스 존재 확인
psql -l | grep ahp_db
```

### 복원 실패 시 대안

#### 옵션 1: GitHub에서 직접 복원
```bash
git clone https://github.com/aebonlee/ahp_app.git
cd ahp_app
git checkout 5cb694e  # 백업 시점 커밋
```

#### 옵션 2: 개별 파일 복원
```bash
# 핵심 파일만 복원
cp backupdata/.../personal-service-enhanced.html ./public/
cp backupdata/.../super-admin-dashboard.html ./public/
cp backupdata/.../api-service.js ./public/scripts/
```

## 📞 지원 및 문의

### 개발팀 연락처
- **이슈 트래커**: GitHub Issues
- **긴급 지원**: 개발팀 Slack
- **문서**: 백업 디렉토리 내 docs_08/

### 추가 자료
- **API 문서**: `/docs_08/API-documentation.md`
- **개발 일지**: `/docs_08/48-AHP플랫폼-엔터프라이즈급-슈퍼관리자-시스템-구현-개발일지-2025-09-14.md`
- **기술 스택**: `/docs_08/기술적구현상세_20250907.md`

---

**✅ 복원 완료 확인**: 모든 테스트 체크리스트 통과 시 복원 완료  
**🚀 서비스 재개**: 라이브 환경 배포 및 서비스 시작  
**📊 모니터링**: 복원 후 24시간 시스템 안정성 모니터링 권장