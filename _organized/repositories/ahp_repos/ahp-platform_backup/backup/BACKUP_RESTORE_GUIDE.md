# AHP 플랫폼 백업 복구 가이드

**백업 생성일**: 2025-09-02  
**백업 시점**: 컬러 테마 최적화 완료 후  
**백업 커밋**: e827036 🎨 로즈/레드 테마 통합 및 아이스 화이트 다크모드 테마 추가

---

## 📦 백업 파일 정보

### 백업 아카이브
- **파일명**: `ahp-platform-complete-backup-2025-09-02.tar.gz`
- **크기**: 10.69 MB
- **위치**: `backup/ahp-platform-complete-backup-2025-09-02.tar.gz`
- **포함 내용**: 전체 소스코드 (node_modules, .git, build 폴더 제외)

### 백업 시점 상태
- **Git 커밋**: e827036
- **브랜치**: main
- **주요 기능**: Rose-Red Fusion 테마, Ice White 다크모드 테마
- **문서화**: docs_03 폴더에 66개 문서

---

## 🔄 복구 방법

### 1️⃣ 압축 파일에서 복구

```bash
# 백업 디렉토리로 이동
cd C:\Users\ASUS\ahp-platform\backup

# 새로운 디렉토리에 복구
mkdir ahp-platform-restored
cd ahp-platform-restored

# 백업 아카이브 압축 해제
tar -xzf ../ahp-platform-complete-backup-2025-09-02.tar.gz

# 의존성 설치
npm install
cd backend && npm install && cd ..

# 환경 변수 설정 (.env 파일 별도 백업 필요)
cp .env.example .env
# .env 파일 편집하여 실제 설정값 입력

# 개발 서버 실행
npm start
```

### 2️⃣ Git을 통한 커밋 복구

```bash
# 현재 프로젝트 디렉토리에서
cd C:\Users\ASUS\ahp-platform

# 특정 커밋으로 하드 리셋 (주의: 현재 변경사항 모두 손실)
git reset --hard e827036

# 또는 새로운 브랜치로 복구
git checkout -b backup-restore-2025-09-02 e827036
```

---

## 🏗️ 백업 시점 주요 구현사항

### 🎨 컬러 테마 시스템
- **Rose-Red Fusion**: 부드러운 로즈와 강렬한 레드의 완벽한 조화
- **Ice White**: 다크모드 전용 최적화 테마
- **8개 테마**: gold, blue, green, purple, rose-red, orange, teal, indigo, ice-white

### 📱 디자인 시스템
- **타이포그래피**: Inter (영문) + Pretendard (한글)
- **컴포넌트**: 12px border-radius, 0.15s ease-out 애니메이션
- **그림자**: 0 4px 6px rgba(0,0,0,0.1)

### 🎯 애니메이션 시스템
- **성능 최적화**: transform: scale() 전용
- **GPU 가속**: 60fps 부드러운 인터랙션
- **접근성**: prefers-reduced-motion 지원

---

## 📁 주요 파일 구조

### 핵심 컴포넌트
```
src/
├── components/common/
│   ├── ColorThemeButton.tsx      # 테마 선택 버튼
│   ├── ColorThemeSelector.tsx    # 테마 선택 모달
│   ├── Button.tsx                # 통합 버튼 컴포넌트
│   └── Card.tsx                  # 카드 컴포넌트
├── hooks/
│   └── useColorTheme.tsx         # 컬러 테마 훅
└── index.css                     # 글로벌 CSS 변수 시스템
```

### 문서화
```
docs_03/
├── 66-color-theme-optimization-report.md    # 컬러 테마 최적화
├── 65-animation-rose-theme-implementation.md # 애니메이션 구현
├── 64-component-design-system-implementation.md # 컴포넌트 디자인
└── 62-typography-system-implementation.md   # 타이포그래피
```

---

## ⚙️ 환경 설정 복구

### Node.js 의존성
```bash
# 프론트엔드
npm install

# 백엔드
cd backend
npm install
```

### 환경 변수 (.env)
```env
# 백엔드 (.env)
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-secure-jwt-secret
PORT=3001

# 프론트엔드 (.env)
REACT_APP_API_URL=https://ahp-platform.onrender.com/api
```

---

## 🧪 복구 검증 방법

### 1단계: 빌드 테스트
```bash
# 프론트엔드 빌드
npm run build

# 백엔드 빌드
cd backend && npm run build
```

### 2단계: 개발 서버 실행
```bash
# 프론트엔드 (localhost:3000)
npm start

# 백엔드 (localhost:3001)
cd backend && npm start
```

### 3단계: 주요 기능 확인
- [ ] 로그인/회원가입 작동
- [ ] 프로젝트 생성 가능
- [ ] 컬러 테마 변경 작동
- [ ] 다크모드 전환 작동
- [ ] Rose-Red 테마 기본 적용 확인

---

## 🚨 복구 시 주의사항

### 데이터베이스
- PostgreSQL 연결 설정 확인 필요
- 마이그레이션 파일 실행: `backend/src/database/migrations/`

### 보안
- `.env` 파일 별도 백업/복구 필요
- JWT_SECRET 재설정 권장
- 프로덕션 환경에서는 새로운 시크릿 키 생성

### 의존성
- Node.js 18+ 버전 필요
- npm 최신 버전 권장

---

## 📊 백업 무결성 확인

### 파일 개수 확인
```bash
# 원본과 백업 파일 개수 비교
find . -type f \( ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./build/*" ! -path "./dist/*" \) | wc -l
```

### 주요 컴포넌트 존재 확인
```bash
# 핵심 파일 존재 여부
ls -la src/hooks/useColorTheme.tsx
ls -la src/components/common/ColorThemeButton.tsx
ls -la docs_03/66-color-theme-optimization-report.md
```

---

## 🎯 백업 포인트 특징

### ✅ 완료된 주요 기능
- 🎨 **컬러 시스템**: Rose-Red + Ice White 통합 테마
- 📝 **타이포그래피**: Inter + Pretendard 폰트 시스템  
- 🎭 **애니메이션**: 0.15s ease-out 성능 최적화
- 🧩 **컴포넌트**: 12px radius, 통일된 디자인 시스템
- 📱 **반응형**: 모바일 최적화 UI/UX

### 🔧 기술 스택
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **배포**: Render.com (프론트) + Render.com (백엔드)
- **버전관리**: Git + GitHub

---

## 📞 문제 해결

### 복구 실패 시
1. Node.js 버전 확인 (18+)
2. npm cache 정리: `npm cache clean --force`
3. 의존성 재설치: `rm -rf node_modules && npm install`

### 데이터베이스 연결 실패 시
1. PostgreSQL 서버 상태 확인
2. `.env` 파일 DATABASE_URL 검증
3. 마이그레이션 실행 확인

**백업 생성**: ✅ 2025-09-02 17:05 KST  
**백업 크기**: 10.69 MB (압축)  
**복구 예상 시간**: 5-10분 (의존성 설치 포함)