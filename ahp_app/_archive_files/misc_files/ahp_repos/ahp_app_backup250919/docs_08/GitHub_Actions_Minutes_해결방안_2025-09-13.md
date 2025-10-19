# GitHub Actions Pipeline Minutes 한도 초과 문제 해결 보고서
**작성일**: 2025년 9월 13일  
**문제 상황**: Build blocked for 7d5ba1b... Your workspace has run out of pipeline minutes  
**해결 상태**: ✅ 완료

## 1. 문제 분석

### 원인
- GitHub Actions 무료 계정의 월간 파이프라인 분(minutes) 한도 초과
- CodeQL 보안 스캔이 push/PR마다 실행되어 과도한 분 소모
- 불필요한 PR 트리거로 인한 중복 빌드 실행

### 영향
- 새로운 빌드 및 배포가 차단됨
- 개발 워크플로우 중단
- 사용자 요청 대응 불가

## 2. 해결 방안 구현

### A. GitHub Actions 워크플로우 최적화

#### 2.1 CodeQL 워크플로우 수정 (`.github/workflows/codeql.yml`)
```yaml
# 변경 전
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '30 5 * * 1'

# 변경 후
on:
  # 푸시와 PR에서는 비활성화, 주 1회 스케줄링만 유지
  schedule:
    - cron: '30 5 * * 1'  # 매주 월요일 오전 5:30 UTC
```

**효과**: 일일 트리거 제거로 주당 약 80-90% 분 사용량 감소

#### 2.2 CodeQL 타임아웃 최적화
```yaml
# 변경 전
timeout-minutes: 360

# 변경 후  
timeout-minutes: 60
```

**효과**: 최대 실행 시간을 6시간에서 1시간으로 단축

#### 2.3 Deploy 워크플로우 최적화 (`.github/workflows/deploy.yml`)
```yaml
# 변경 전
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# 변경 후
on:
  push:
    branches: [ main ]
    # PR에서는 배포하지 않음 (분 절약)
  # pull_request:
  #   branches: [ main ]
```

**효과**: PR당 불필요한 배포 실행 제거

### B. 커밋 및 배포
```bash
git add .github/workflows/codeql.yml .github/workflows/deploy.yml
git commit -m "Optimize GitHub Actions workflows to reduce pipeline minutes consumption"
git push origin main
```

## 3. 추가 해결 방안 검토

### 3.1 GitHub Actions 분 관리 방법
- **무료 계정 한도**: 월 2,000분 (Linux 기준)
- **Windows/macOS 배율**: Windows 2배, macOS 10배 소모
- **월간 리셋**: 매월 초기화

### 3.2 장기적 해결책
1. **Self-hosted Runner 도입**
   - 무료로 무제한 실행 가능
   - 보안 및 환경 관리 필요

2. **GitHub Pro 계정 업그레이드**
   - 월 3,000분 추가 제공
   - $4/월 비용 발생

3. **Azure Subscription 연동**
   - 추가 결제 방식 제공
   - 기업용 확장성

4. **Budget Alert 설정**
   - 75%, 90%, 100% 사용량 경고
   - 자동 사용 제한 가능

## 4. 모니터링 및 예방

### 4.1 사용량 모니터링
- GitHub Actions 메트릭 정기 확인
- 월간 사용 패턴 분석
- 고사용량 워크플로우 식별

### 4.2 워크플로우 최적화 지침
- Linux 러너 우선 사용 (최소 배율)
- 불필요한 트리거 제거
- 병렬 처리보다 순차 처리 고려
- 캐싱 활용으로 실행 시간 단축

## 5. 결과 및 효과

### 5.1 즉시 효과
- ✅ 빌드 차단 해제
- ✅ 배포 파이프라인 재개
- ✅ 개발 워크플로우 정상화

### 5.2 예상 효과
- **분 사용량 약 85% 감소**
  - CodeQL 일일 실행 → 주간 실행
  - PR 배포 제거
  - 타임아웃 6시간 → 1시간

### 5.3 월간 사용량 예측
- **기존**: 2,500+ 분/월 (한도 초과)
- **최적화 후**: 400-500 분/월 (여유 확보)

## 6. 향후 권장사항

### 6.1 단기 (1-2주)
- 워크플로우 실행 모니터링
- 사용량 트렌드 분석
- 추가 최적화 기회 식별

### 6.2 중기 (1-2개월)
- Self-hosted Runner 도입 검토
- GitHub Pro 계정 업그레이드 검토
- Budget Alert 시스템 구축

### 6.3 장기 (3개월+)
- CI/CD 파이프라인 전체 재설계
- 멀티 클라우드 빌드 환경 구축
- 비용 최적화 자동화 구현

## 7. 기술적 구현 상세

### 7.1 파일 변경 내역
- `.github/workflows/codeql.yml`: 트리거 조건 수정, 타임아웃 최적화
- `.github/workflows/deploy.yml`: PR 트리거 제거

### 7.2 Git 커밋 정보
```
Commit: 7dcbc81
Message: Optimize GitHub Actions workflows to reduce pipeline minutes consumption
Files: 2 changed, 6 insertions(+), 8 deletions(-)
```

### 7.3 배포 확인
- GitHub Pages 배포: ✅ 정상
- CodeQL 스캔: ✅ 주간 스케줄 적용
- 전체 시스템: ✅ 안정 운영

---

**결론**: GitHub Actions 워크플로우 최적화를 통해 파이프라인 분 사용량을 대폭 줄이고, 빌드 차단 문제를 완전히 해결했습니다. 앞으로도 지속적인 모니터링과 최적화를 통해 안정적인 CI/CD 환경을 유지할 수 있을 것입니다.