# ✅ Render.com 최종 설정 가이드

## 🎯 현재 상황
- ✅ Web Service: Starter Plan ($7/월) - 이미 활성화
- ✅ PostgreSQL: dpg-d2q8l5qdbo4c73bt3780-a - 이미 활성화
- ✅ GitHub Repository: https://github.com/aebonlee/ahp_app - 연결 완료

## 🚀 즉시 필요한 설정 (5분)

### Step 1: Root Directory 설정 (중요!)
백엔드 코드가 저장소의 서브디렉토리에 있으므로:

1. **ahp-django-backend** 서비스 → **Settings**
2. **Build & Deploy** 섹션
3. **Root Directory**: `ahp_django_service_updated` 입력
4. **Save Changes**

### Step 2: Build Command 확인
1. **Build Command** 필드:
   ```bash
   ./render-build.sh
   ```
   또는
   ```bash
   chmod +x render-build.sh && ./render-build.sh
   ```

### Step 3: Start Command 확인
1. **Start Command** 필드:
   ```bash
   gunicorn ahp_backend.wsgi:application
   ```

### Step 4: 환경변수 설정
**Environment** 탭에서 다음 변수들 확인/추가:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `DATABASE_URL` | dpg-d2q8l5qdbo4c73bt3780-a의 연결 URL | 유료 PostgreSQL |
| `SECRET_KEY` | 랜덤 문자열 | Django 시크릿 키 |
| `DEBUG` | False | 프로덕션 설정 |
| `ALLOWED_HOSTS` | ahp-django-backend.onrender.com | 허용 도메인 |
| `PYTHON_VERSION` | 3.11.0 | Python 버전 |

### Step 5: Auto-Deploy 활성화
1. **Auto-Deploy from GitHub** → **ON**
2. **Branch**: main
3. **Auto-Deploy on Push**: 체크

### Step 6: Manual Deploy 실행
모든 설정 완료 후:
1. **Manual Deploy** 버튼 클릭
2. **Deploy latest commit from main**

## 📊 배포 확인 사항

### 배포 로그에서 확인할 메시지:
```
🎉🎉🎉 RENDER.COM UPGRADED - AUTO DEPLOYMENT ACTIVATED 🎉🎉🎉
✅ Using PAID PostgreSQL Instance: dpg-d2q8l5qdbo4c73bt3780-a
🔄 Commits to Deploy: 27 (ALL PENDING COMMITS)
✅ PostgreSQL migrations completed
✅ Tables created and verified
```

### 배포 성공 테스트:
```bash
# 1. 서비스 상태
curl https://ahp-django-backend.onrender.com/

# 2. API 엔드포인트
curl https://ahp-django-backend.onrender.com/api/service/projects/

# 3. Admin 페이지
https://ahp-django-backend.onrender.com/admin/
```

## ⚠️ 중요 체크포인트

### 올바른 디렉토리 구조 확인:
```
github.com/aebonlee/ahp_app/
├── .github/workflows/
├── ahp_django_service_updated/    ← 백엔드 Root Directory
│   ├── ahp_backend/
│   ├── apps/
│   ├── manage.py
│   ├── requirements.txt
│   └── render-build.sh
├── ahp_frontend_src/              ← 프론트엔드 소스
└── ahp_frontend_public/           ← 프론트엔드 public
```

## 🎉 예상 결과

설정 완료 후 15분 내:
- ✅ 27개 누락 커밋 모두 배포
- ✅ PostgreSQL 테이블 자동 생성
- ✅ API 엔드포인트 정상 작동
- ✅ 향후 GitHub 푸시 시 자동 배포

## 🔧 문제 해결

### 배포 실패 시:
1. **Logs** 탭에서 에러 확인
2. **Root Directory** 경로 재확인
3. **requirements.txt** 파일 위치 확인
4. **render-build.sh** 실행 권한 확인

### 데이터베이스 연결 실패 시:
1. DATABASE_URL 환경변수 확인
2. PostgreSQL 서비스 상태 확인
3. 연결 문자열 형식 확인

---

**🚀 모든 준비가 완료되었습니다! 위 설정을 확인하고 Manual Deploy를 실행하세요!**