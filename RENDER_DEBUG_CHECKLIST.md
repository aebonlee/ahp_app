# 🔍 Render.com 디버그 체크리스트

## ❗ 현재 상황
- 5번 연속 "Exited with status 1" 오류
- 빌드 로그 상세 확인 필요

## 📋 체크해야 할 사항들

### 1. Render.com 현재 설정 확인
**Settings → Build & Deploy에서 확인:**
- [ ] Root Directory: `ahp_django_service_updated` 또는 비워두기
- [ ] Build Command: 
- [ ] Start Command: 
- [ ] Python Version: 

**현재 어떻게 설정되어 있는지 알려주세요.**

### 2. 빌드 로그 확인 필요
**Logs 탭에서 가장 최근 실패 로그의 마지막 부분:**
- 어떤 오류 메시지가 나오는지?
- 어느 단계에서 실패하는지?
- pip install 단계? migrate 단계? collectstatic 단계?

### 3. 가능한 원인들

#### A. 파일 경로 문제
```bash
# 확인 명령어 (Build Command에 임시로)
pwd && ls -la && ls -la ahp_django_service_updated/
```

#### B. requirements.txt 문제
```bash
# 확인 명령어
cd ahp_django_service_updated && cat requirements.txt
```

#### C. Python/Django 설정 문제
```bash
# 확인 명령어
cd ahp_django_service_updated && python --version && python -c "import django; print(django.VERSION)"
```

### 4. 단계별 디버그 방법

#### Step 1: 최소 빌드 테스트
**Build Command를 이것만으로:**
```bash
echo "Testing build" && pwd && ls -la
```

#### Step 2: 디렉토리 이동 테스트
**Build Command:**
```bash
cd ahp_django_service_updated && pwd && ls -la
```

#### Step 3: Python 설치 테스트
**Build Command:**
```bash
cd ahp_django_service_updated && python --version && pip --version
```

#### Step 4: requirements 설치 테스트
**Build Command:**
```bash
cd ahp_django_service_updated && pip install -r requirements.txt
```

## 🎯 디버그 순서

1. **현재 설정 확인** - 지금 어떻게 되어 있는지 알려주세요
2. **빌드 로그 확인** - 구체적인 오류 메시지 확인
3. **단계별 테스트** - 위 Step 1부터 순차적으로

## ❓ 알려주세요

1. **현재 Render.com 설정:**
   - Root Directory: ?
   - Build Command: ?
   - Start Command: ?

2. **빌드 로그 오류:**
   - 어떤 오류 메시지가 나오나요?
   - 어느 단계에서 실패하나요?

이 정보를 알려주시면 정확한 해결책을 제시하겠습니다.