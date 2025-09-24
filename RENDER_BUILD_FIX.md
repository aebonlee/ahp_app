# 🔧 Render.com 빌드 실패 해결 가이드

## ❌ 현재 오류
```
Deploy failed for b872cd3
Exited with status 1 while building your code
```

## 🔍 가능한 원인들

### 1. Root Directory 미설정 (90% 가능성)
백엔드 코드가 `ahp_django_service_updated` 폴더 안에 있는데 Root Directory를 설정하지 않으면 실패합니다.

### 2. Build Command 경로 문제
render-build.sh 파일을 찾을 수 없는 경우

### 3. Python 버전 문제
Python 버전이 명시되지 않은 경우

## ✅ 즉시 해결 방법

### Step 1: Render.com 설정 확인 (중요!)

1. **ahp-django-backend** → **Settings** → **Build & Deploy**

2. **다음 설정들을 정확히 입력하세요:**

| 설정 항목 | 올바른 값 |
|-----------|-----------|
| **Root Directory** | `ahp_django_service_updated` |
| **Build Command** | `chmod +x render-build.sh && ./render-build.sh` |
| **Start Command** | `gunicorn ahp_backend.wsgi:application` |

3. **Environment Variables** 탭에서 추가:
```
PYTHON_VERSION = 3.11.0
```

### Step 2: 설정 저장 후 재배포

1. 모든 설정 **Save Changes**
2. **Manual Deploy** 클릭
3. **Deploy latest commit**

## 🎯 올바른 디렉토리 구조 확인

GitHub 저장소 구조:
```
aebonlee/ahp_app/
├── ahp_django_service_updated/    ← 여기가 Root Directory
│   ├── ahp_backend/
│   │   ├── __init__.py
│   │   ├── settings.py
│   │   └── wsgi.py
│   ├── apps/
│   ├── manage.py
│   ├── requirements.txt         ← 여기 있어야 함
│   └── render-build.sh          ← 여기 있어야 함
├── ahp_frontend_src/
└── ahp_frontend_public/
```

## 🚨 중요 체크리스트

### Render.com에서 반드시 확인:
- [ ] Root Directory = `ahp_django_service_updated`
- [ ] Build Command = `chmod +x render-build.sh && ./render-build.sh`
- [ ] Start Command = `gunicorn ahp_backend.wsgi:application`
- [ ] PYTHON_VERSION = `3.11.0`
- [ ] DATABASE_URL = 유료 PostgreSQL URL

## 📝 대체 Build Command 옵션들

만약 위 방법이 실패하면 다음을 시도:

### 옵션 1: 직접 명령 실행
```bash
pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
```

### 옵션 2: Bash 직접 실행
```bash
bash render-build.sh
```

### 옵션 3: 경로 명시
```bash
cd ahp_django_service_updated && chmod +x render-build.sh && ./render-build.sh
```

## 🔍 로그 확인 방법

1. **Logs** 탭 클릭
2. 오류 메시지 찾기:
   - "No such file or directory" → Root Directory 문제
   - "Permission denied" → chmod 필요
   - "Module not found" → requirements.txt 경로 문제

## ⚡ 빠른 해결책

**가장 중요한 것은 Root Directory 설정입니다!**

1. Root Directory: `ahp_django_service_updated` 입력
2. Save Changes
3. Manual Deploy

이 3단계만 정확히 하면 대부분 해결됩니다.

---

**📋 요약: Root Directory를 `ahp_django_service_updated`로 설정하고 재배포하세요!**