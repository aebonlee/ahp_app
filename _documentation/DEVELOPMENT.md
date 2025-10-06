# 🛠️ AHP 플랫폼 개발 가이드

## 📂 정리된 폴더 구조

### **메인 프로젝트 (`D:/ahp/`)**
```
D:/ahp/
├── 📁 src/                    # 프론트엔드 소스 코드
├── 📁 django_backend/         # 백엔드 서브모듈
├── 📁 public/                 # 정적 자산
├── 📁 build/                  # 빌드 출력
├── 📁 node_modules/           # NPM 의존성
├── 📁 _cleanup/               # 정리된 파일들 (삭제 가능)
├── 📁 _archive/               # 백업 파일들
├── 📁 _documentation/         # 개발 문서
├── 📄 package.json            # NPM 설정
├── 📄 tsconfig.json           # TypeScript 설정
├── 📄 tailwind.config.js      # Tailwind CSS 설정
├── 📄 README.md               # 프로젝트 메인 문서
└── 📄 DEVELOPMENT.md          # 개발 가이드 (이 파일)
```

---

## 🧹 정리 작업 완료

### **이동된 파일들**
- ✅ **테스트 파일**: `test_*.js` → `_cleanup/test_files/`
- ✅ **임시 파일**: `*.log`, 기타 JavaScript → `_cleanup/misc_files/`
- ✅ **백엔드 테스트**: `test_*.py`, `*.sql` → `django_backend/_cleanup/`

### **유지된 핵심 파일들**
- ✅ **프론트엔드**: `src/`, `public/`, `package.json`
- ✅ **백엔드**: `django_backend/` (핵심 Django 파일)
- ✅ **설정**: `tsconfig.json`, `tailwind.config.js`
- ✅ **문서**: 새로 작성된 README.md, DEVELOPMENT.md

---

## 🚀 로컬 개발 환경 설정

### **1. 필수 소프트웨어**
```bash
# Node.js (권장: v18+)
node --version

# Python (권장: 3.9+)
python --version

# Git
git --version
```

### **2. 프로젝트 클론 및 설정**
```bash
# 저장소 클론
git clone https://github.com/aebonlee/ahp_app.git
cd ahp_app

# 서브모듈 초기화
git submodule init
git submodule update

# 프론트엔드 의존성 설치
npm install
```

### **3. 개발 서버 실행**
```bash
# 프론트엔드 개발 서버 (포트 3000)
npm start

# 백엔드 개발 서버 (선택사항, 포트 8000)
cd django_backend
pip install -r requirements.txt
python manage.py runserver
```

---

## 🔧 개발 워크플로우

### **브랜치 전략**
```bash
main                    # 프로덕션 배포
├── develop            # 개발 통합
├── feature/auth       # 인증 기능
├── feature/ui         # UI 개선
└── hotfix/critical    # 긴급 수정
```

### **커밋 규칙**
```bash
# 형식: <타입>: <제목>
feat: Add Naver social login integration
fix: Resolve database connection timeout
docs: Update API documentation
style: Fix code formatting
refactor: Optimize API response structure
test: Add unit tests for AHP calculator
chore: Update dependencies
```

### **개발 프로세스**
1. **기능 브랜치** 생성
2. **코드 작성** 및 테스트
3. **커밋** 및 푸시
4. **Pull Request** 생성
5. **코드 리뷰** 및 머지

---

## 🧪 테스트 가이드

### **프론트엔드 테스트**
```bash
# 전체 테스트 실행
npm test

# 특정 컴포넌트 테스트
npm test Button

# 커버리지 확인
npm run test:coverage
```

### **백엔드 테스트**
```bash
cd django_backend

# Django 테스트
python manage.py test

# 특정 앱 테스트
python manage.py test apps.accounts

# 데이터베이스 마이그레이션 테스트
python manage.py makemigrations --dry-run
```

### **통합 테스트**
프론트엔드 애플리케이션의 Connection Test 페이지 사용:
- 백엔드 연결 확인
- 데이터베이스 상태 확인
- API 엔드포인트 테스트

---

## 🎨 코딩 스타일

### **TypeScript/React**
```typescript
// 컴포넌트 구조
interface ComponentProps {
  title: string;
  onAction: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  const [state, setState] = useState<string>('');
  
  return (
    <div className="component-container">
      <h1>{title}</h1>
    </div>
  );
};

export default Component;
```

### **Python/Django**
```python
# Django 모델
class Project(models.Model):
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ahp_projects'
        verbose_name = 'AHP 프로젝트'

# API 뷰
class ProjectAPIView(APIView):
    def get(self, request):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
```

---

## 📦 빌드 및 배포

### **프론트엔드 빌드**
```bash
# 개발 빌드
npm run build

# GitHub Pages 배포
npm run deploy

# 빌드 분석
npm run analyze
```

### **백엔드 배포**
```bash
# Render.com 자동 배포
git push origin main

# 수동 배포 트리거
# Render.com 대시보드에서 Manual Deploy 클릭
```

### **환경별 설정**
```bash
# 개발 환경
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DATA_MODE=hybrid

# 프로덕션 환경
REACT_APP_API_URL=https://ahp-django-backend.onrender.com
REACT_APP_DATA_MODE=online
```

---

## 🔍 디버깅 가이드

### **프론트엔드 디버깅**
```bash
# 개발자 도구
F12 > Console/Network/Elements

# React Developer Tools
Browser Extension 설치 필요

# 로그 레벨 설정
console.log('Debug info')
console.warn('Warning message')
console.error('Error occurred')
```

### **백엔드 디버깅**
```bash
# Django 디버그 모드
DEBUG=True python manage.py runserver

# 로그 확인
tail -f django_backend/logs/django.log

# 데이터베이스 쿼리 확인
python manage.py shell
```

### **API 테스트**
```bash
# cURL 사용
curl -X GET https://ahp-django-backend.onrender.com/api/

# Postman/Insomnia 사용 권장
# 저장된 컬렉션: _documentation/api-collection.json
```

---

## 🛡️ 보안 가이드

### **프론트엔드 보안**
- ✅ XSS 방지: React의 기본 이스케이핑 사용
- ✅ 환경 변수: 민감한 정보는 서버사이드에서만
- ✅ HTTPS: 프로덕션에서 강제 사용

### **백엔드 보안**
- ✅ CSRF 보호: Django 기본 설정 사용
- ✅ JWT 토큰: 만료 시간 설정
- ✅ CORS: 허용된 도메인만 접근

### **데이터베이스 보안**
- ✅ ORM 사용: SQL 인젝션 방지
- ✅ 마이그레이션: 스키마 변경 추적
- ✅ 백업: 자동 백업 설정

---

## 📚 추가 자료

### **문서 위치**
- **API 문서**: `_documentation/api-docs/`
- **컴포넌트 가이드**: `_documentation/components/`
- **데이터베이스 스키마**: `_documentation/database/`

### **유용한 명령어**
```bash
# 프로젝트 정보 확인
npm run info

# 의존성 업데이트
npm update

# 코드 포맷팅
npm run format

# 타입 체크
npm run type-check
```

### **문제 해결**
1. **포트 충돌**: `lsof -i :3000` (Linux/Mac)
2. **모듈 해결 오류**: `rm -rf node_modules && npm install`
3. **빌드 실패**: `npm run clean && npm run build`

---

## 🤝 기여 가이드

### **이슈 리포팅**
1. [GitHub Issues](https://github.com/aebonlee/ahp_app/issues) 확인
2. 버그 재현 단계 명시
3. 환경 정보 포함 (OS, 브라우저, 버전)

### **Pull Request**
1. Feature 브랜치에서 작업
2. 테스트 코드 포함
3. 문서 업데이트
4. 코드 리뷰 대기

---

**마지막 업데이트**: 2025년 9월 30일  
**작성자**: Claude Code  
**버전**: 1.0