# 🔧 Render.com 최종 해결 방안

## 🚨 현재 문제
- PostgreSQL 연결 성공 ✅
- pip install 성공 ✅  
- render-build.sh에서 실패 ❌

## ✅ 즉시 해결 방법

### Build Command를 render-build.sh 없이 직접 실행

**Render.com Settings → Build & Deploy:**

#### **Root Directory:**
```
(비워두기)
```

#### **Build Command:**
```bash
cd ahp_django_service_updated && pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput
```

#### **Start Command:**
```bash
cd ahp_django_service_updated && python manage.py runserver 0.0.0.0:$PORT
```

또는 gunicorn 사용:
```bash
cd ahp_django_service_updated && gunicorn ahp_backend.wsgi:application --bind 0.0.0.0:$PORT
```

## 🎯 단순화된 접근

render-build.sh 스크립트가 복잡해서 실패하고 있으므로, 가장 기본적인 Django 명령어만 사용합니다.

### 단계별 Build Command:

1. **디렉토리 이동**: `cd ahp_django_service_updated`
2. **의존성 설치**: `pip install -r requirements.txt`
3. **마이그레이션**: `python manage.py migrate --noinput`
4. **정적 파일**: `python manage.py collectstatic --noinput`

## ⚡ 즉시 실행

1. Build Command 위 명령어로 변경
2. Start Command 변경
3. Save Changes
4. Manual Deploy

이렇게 하면 복잡한 스크립트 없이 직접 Django 명령어로 빌드됩니다.